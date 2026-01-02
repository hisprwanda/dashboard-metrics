import React, { useCallback, useEffect, useRef, useState } from "react";

import { differenceInMonths, format, subDays, subMonths } from "date-fns";

import { CircularLoader, MultiSelectField, MultiSelectOption } from "@dhis2/ui";

import { useFilteredUsers, useUserGroups } from "../../../hooks/users";
import { useDashboardsInfo } from "../../../hooks/dashboards";
import { useDashboardAnalytics } from "../../../hooks/useDashboardAnalytics";
import { useSystem } from "../../../context/SystemContext";
import i18n from "../../../locales";

// User type from DHIS2 API
interface User {
  id: string;
  displayName?: string;
  userCredentials?: {
    username?: string;
    lastLogin?: string | null;
    userRoles?: Array<{ id: string; displayName: string }>;
  };
  userGroups?: Array<{ id: string; displayName: string }>;
  organisationUnits?: Array<{ id: string; displayName: string }>;
}

// Processed user engagement data
interface ProcessedUserEngagementData extends User {
  loginPastMonth: number;
  loginTrend: number[];
  accessRecency: "lastWeek" | "lastMonth" | "overMonth" | "never";
  lastDashboardAccess?: Date | null;
  totalDashboardAccesses?: number;
}

// Interface for filter props
interface FilterSectionProps {
  onUserDataChange: (userData: ProcessedUserEngagementData[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  onUserDataChange,
  onLoadingChange,
}) => {
  const { sqlViewUid } = useSystem();

  // State for selected user groups and dashboards
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);

  // Refs to prevent infinite loops
  const prevLoadingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const prevDataRef = useRef<string>(""); // Track processed data to avoid unnecessary updates

  // Static date calculations
  const now = new Date();
  const oneMonthAgo = format(subMonths(now, 1), "yyyy-MM-dd");
  const oneWeekAgo = format(subDays(now, 7), "yyyy-MM-dd");

  // Fetch user groups
  const userGroupsQuery = useUserGroups();
  const userGroups = userGroupsQuery.data?.userGroups?.userGroups || [];

  // Fetch dashboards list
  const { data: dashboardsData } = useDashboardsInfo();
  const dashboards = dashboardsData?.dashboards?.dashboards || [];

  // Fetch dashboard analytics when dashboards are selected
  const {
    analytics: dashboardAnalytics,
    accessLogs,
    loading: analyticsLoading,
    error: analyticsError,
  } = useDashboardAnalytics({
    dashboardIds: selectedDashboards,
    sqlViewUid: sqlViewUid || "",
    enabled: selectedDashboards.length > 0,
  });

  // Only fetch users when user groups are selected
  const filteredUsersQuery = useFilteredUsers(
    [], // No username filter
    [], // No org unit filter
    [], // No org unit IDs filter
    selectedUserGroups, // Selected user groups
    false // Not including disabled users
  );

  // Cleanup on unmount
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  // Memoized handler for user group selection
  const handleUserGroupsChange = useCallback(
    ({ selected }: { selected: string[] }) => {
      // Reset the data hash when selection changes to force data update
      prevDataRef.current = "";
      setSelectedUserGroups(selected);
    },
    []
  );

  // Memoized handler for dashboard selection
  const handleDashboardsChange = useCallback(
    ({ selected }: { selected: string[] }) => {
      // Reset the data hash when selection changes to force data update
      prevDataRef.current = "";
      setSelectedDashboards(selected);
    },
    []
  );

  // Helper function to calculate monthly trend from access logs
  const calculateMonthlyTrend = useCallback(
    (username: string, logs: typeof accessLogs) => {
      if (!logs || logs.length === 0) return [0, 0, 0];

      const userLogs = logs.filter((log) => log.username === username);
      const trend = [0, 0, 0]; // [current month, 1 month ago, 2 months ago]

      userLogs.forEach((log) => {
        const logDate = new Date(log.timestamp);
        const monthsAgo = differenceInMonths(now, logDate);

        if (monthsAgo >= 0 && monthsAgo < 3) {
          trend[monthsAgo]++;
        }
      });

      return trend;
    },
    [now, accessLogs]
  );

  // Process user data to calculate engagement metrics
  const processUserEngagementData = useCallback(
    (users: User[]): ProcessedUserEngagementData[] => {
      if (!users || users.length === 0) return [];

      return users.map((user): ProcessedUserEngagementData => {
        const username =
          user.userCredentials?.username || user.displayName || "";
        const lastLoginTimestamp = user.userCredentials?.lastLogin;
        const lastLoginDate = lastLoginTimestamp
          ? new Date(lastLoginTimestamp)
          : null;

        // Use real dashboard access data if dashboards are selected
        const loginPastMonth =
          selectedDashboards.length > 0 && dashboardAnalytics
            ? dashboardAnalytics.userAccessCounts[username] || 0
            : 0;

        const loginTrend =
          selectedDashboards.length > 0
            ? calculateMonthlyTrend(username, accessLogs)
            : [0, 0, 0];

        // Calculate access recency based on dashboard access if dashboards selected
        let accessRecency: "lastWeek" | "lastMonth" | "overMonth" | "never" =
          "never";

        if (selectedDashboards.length > 0 && dashboardAnalytics) {
          const lastDashboardAccess =
            dashboardAnalytics.userLastAccess[username];
          if (lastDashboardAccess) {
            const accessDate = new Date(lastDashboardAccess);
            const accessDateStr = format(accessDate, "yyyy-MM-dd");
            if (accessDateStr >= oneWeekAgo) {
              accessRecency = "lastWeek";
            } else if (accessDateStr >= oneMonthAgo) {
              accessRecency = "lastMonth";
            } else {
              accessRecency = "overMonth";
            }
          }
        } else if (lastLoginDate) {
          // Fall back to login-based recency if no dashboards selected
          const lastLoginDateStr = format(lastLoginDate, "yyyy-MM-dd");
          if (lastLoginDateStr >= oneWeekAgo) {
            accessRecency = "lastWeek";
          } else if (lastLoginDateStr >= oneMonthAgo) {
            accessRecency = "lastMonth";
          } else {
            accessRecency = "overMonth";
          }
        }

        return {
          ...user,
          loginPastMonth,
          loginTrend,
          accessRecency,
          lastDashboardAccess:
            selectedDashboards.length > 0 && dashboardAnalytics
              ? dashboardAnalytics.userLastAccess[username]
                ? new Date(dashboardAnalytics.userLastAccess[username])
                : null
              : null,
          totalDashboardAccesses: loginPastMonth,
        };
      });
    },
    [
      oneMonthAgo,
      oneWeekAgo,
      selectedDashboards.length,
      dashboardAnalytics,
      accessLogs,
      calculateMonthlyTrend,
    ]
  );

  // Effect for handling loading state
  useEffect(() => {
    if (!isMountedRef.current) return;

    const isLoading =
      (selectedUserGroups.length > 0 && filteredUsersQuery.loading) ||
      analyticsLoading;
    if (isLoading !== prevLoadingRef.current) {
      prevLoadingRef.current = isLoading;
      onLoadingChange(isLoading);
    }
  }, [
    selectedUserGroups,
    filteredUsersQuery.loading,
    analyticsLoading,
    onLoadingChange,
  ]);

  // Separate effect for handling user data updates
  useEffect(() => {
    if (!isMountedRef.current) return;

    // Only process and update when we have new data and user groups are selected
    if (
      !filteredUsersQuery.loading &&
      filteredUsersQuery.data &&
      selectedUserGroups.length > 0
    ) {
      const { users } = filteredUsersQuery.data.users;

      // Create a hash of the current data to compare with previous update
      const dataHash = JSON.stringify(users.map((u: any) => u.id));

      // Only update if data has changed
      if (dataHash !== prevDataRef.current) {
        prevDataRef.current = dataHash;
        const processedUsers = processUserEngagementData(users);
        onUserDataChange(processedUsers);
      }
    } else if (selectedUserGroups.length === 0 && prevDataRef.current !== "") {
      // Clear data when no user groups are selected and we haven't already cleared
      prevDataRef.current = "";
      onUserDataChange([]);
    }
  }, [
    selectedUserGroups,
    filteredUsersQuery.loading,
    filteredUsersQuery.data,
    processUserEngagementData,
    onUserDataChange,
  ]);

  // Handle any errors
  const hasError =
    (filteredUsersQuery.error && selectedUserGroups.length > 0) ||
    (analyticsError && selectedDashboards.length > 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Groups Selector */}
        <div>
          <MultiSelectField
            label={i18n.t("User Groups")}
            onChange={handleUserGroupsChange}
            selected={selectedUserGroups}
            loading={userGroupsQuery.loading}
            filterable
            clearable
            placeholder={i18n.t("Select user groups")}
            noMatchText={i18n.t("No user groups found")}
            className="mb-4"
            dataTest="user-groups-selector"
          >
            {userGroups.map((group) => (
              <MultiSelectOption
                key={group.id}
                label={group.displayName}
                value={group.id}
              />
            ))}
          </MultiSelectField>
        </div>

        {/* Dashboards Selector */}
        <div>
          <MultiSelectField
            label={i18n.t("Dashboards (Optional)")}
            onChange={handleDashboardsChange}
            selected={selectedDashboards}
            filterable
            clearable
            placeholder={i18n.t("All dashboards or select specific ones")}
            noMatchText={i18n.t("No dashboards found")}
            className="mb-4"
            dataTest="dashboard-selector"
          >
            {dashboards.map((dashboard) => (
              <MultiSelectOption
                key={dashboard.id}
                label={dashboard.displayName}
                value={dashboard.id}
              />
            ))}
          </MultiSelectField>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center">
        {hasError && (
          <div className="text-red-500">
            {i18n.t(
              "An error occurred while fetching user data. Please try again."
            )}
          </div>
        )}

        {(selectedUserGroups.length > 0 && filteredUsersQuery.loading) ||
          (analyticsLoading && (
            <div className="flex items-center">
              <CircularLoader small />
              <span className="ml-2">
                {analyticsLoading
                  ? i18n.t("Loading dashboard analytics...")
                  : i18n.t("Fetching user data...")}
              </span>
            </div>
          ))}
      </div>

      {selectedUserGroups.length === 0 && (
        <div className="p-4 text-center">
          {i18n.t("Select a user group to view user engagement data")}
        </div>
      )}
    </div>
  );
};
