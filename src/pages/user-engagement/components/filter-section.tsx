import React, { useCallback, useEffect, useMemo, useState } from "react";

import { differenceInMonths, format, subDays, subMonths } from "date-fns";

import { CircularLoader, MultiSelectField, MultiSelectOption } from "@dhis2/ui";

import {
  useUserGroups,
  useUsersByUserGroups,
  type EngagementUser,
} from "../../../hooks/users";
import { useDashboardsInfo } from "../../../hooks/dashboards";
import {
  useDashboardAnalytics,
  type DashboardAnalytics,
  type DashboardAccessLog,
} from "../../../hooks/useDashboardAnalytics";
import { useSystem } from "../../../context/SystemContext";
import i18n from "../../../locales";

// Processed user engagement data
interface ProcessedUserEngagementData extends EngagementUser {
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
  const [users, setUsers] = useState<EngagementUser[]>([]);
  const [currentAnalytics, setCurrentAnalytics] =
    useState<DashboardAnalytics | null>(null);
  const [currentAccessLogs, setCurrentAccessLogs] = useState<
    DashboardAccessLog[]
  >([]);

  // Static date calculations
  const now = useMemo(() => new Date(), []);
  const oneMonthAgo = useMemo(
    () => format(subMonths(now, 1), "yyyy-MM-dd"),
    [now]
  );
  const oneWeekAgo = useMemo(
    () => format(subDays(now, 7), "yyyy-MM-dd"),
    [now]
  );

  // Fetch user groups
  const userGroupsQuery = useUserGroups();
  const userGroups = userGroupsQuery.data?.userGroups?.userGroups || [];

  // Fetch dashboards list
  const { data: dashboardsData } = useDashboardsInfo();
  const dashboards = dashboardsData?.dashboards?.dashboards || [];

  // Hook for fetching users by user groups (imperative)
  const {
    loading: usersLoading,
    error: usersError,
    fetchUsersByUserGroups,
  } = useUsersByUserGroups();

  // Dashboard analytics hook (imperative)
  const {
    loading: analyticsLoading,
    error: analyticsError,
    fetchDashboardAnalytics,
  } = useDashboardAnalytics({
    sqlViewUid: sqlViewUid || "",
  });

  // Calculate loading state
  const isLoading = usersLoading || analyticsLoading;

  // Update parent loading state
  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  // Helper function to calculate monthly trend from access logs
  const calculateMonthlyTrend = useCallback(
    (username: string, logs: DashboardAccessLog[]) => {
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
    [now]
  );

  // Process user data to calculate engagement metrics
  // When dashboards are selected, only include users who accessed those dashboards
  const processUserEngagementData = useCallback(
    (
      usersData: EngagementUser[],
      analytics: DashboardAnalytics | null,
      logs: DashboardAccessLog[],
      dashboardIds: string[]
    ): ProcessedUserEngagementData[] => {
      if (!usersData || usersData.length === 0) return [];

      // If dashboards are selected, filter to only users who accessed them
      let filteredUsers = usersData;
      if (dashboardIds.length > 0 && analytics) {
        filteredUsers = usersData.filter((user) => {
          const username =
            user.userCredentials?.username || user.displayName || "";
          // Only include users who have accessed the selected dashboards
          return analytics.userAccessCounts[username] > 0;
        });
      }

      return filteredUsers.map((user): ProcessedUserEngagementData => {
        const username =
          user.userCredentials?.username || user.displayName || "";
        const lastLoginTimestamp = user.userCredentials?.lastLogin;
        const lastLoginDate = lastLoginTimestamp
          ? new Date(lastLoginTimestamp)
          : null;

        // Use real dashboard access data if dashboards are selected and we have analytics
        const loginPastMonth =
          analytics && dashboardIds.length > 0
            ? analytics.userAccessCounts[username] || 0
            : 0;

        const loginTrend =
          dashboardIds.length > 0
            ? calculateMonthlyTrend(username, logs)
            : [0, 0, 0];

        // Calculate access recency based on dashboard access if dashboards selected
        let accessRecency: "lastWeek" | "lastMonth" | "overMonth" | "never" =
          "never";

        if (dashboardIds.length > 0 && analytics) {
          const lastDashboardAccess = analytics.userLastAccess[username];
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
            dashboardIds.length > 0 && analytics
              ? analytics.userLastAccess[username]
                ? new Date(analytics.userLastAccess[username])
                : null
              : null,
          totalDashboardAccesses: loginPastMonth,
        };
      });
    },
    [oneMonthAgo, oneWeekAgo, calculateMonthlyTrend]
  );

  // Handle user group selection change
  const handleUserGroupsChange = useCallback(
    async ({ selected }: { selected: string[] }) => {
      setSelectedUserGroups(selected);

      // Clear data if no user groups selected
      if (selected.length === 0) {
        setUsers([]);
        onUserDataChange([]);
        return;
      }

      // Fetch users for selected user groups
      const userData = await fetchUsersByUserGroups(selected);
      setUsers(userData);

      // If dashboards already selected, fetch analytics and filter by dashboard access
      if (selectedDashboards.length > 0) {
        const { analytics, logs } =
          await fetchDashboardAnalytics(selectedDashboards);
        setCurrentAnalytics(analytics);
        setCurrentAccessLogs(logs);
        const processedUsers = processUserEngagementData(
          userData,
          analytics,
          logs,
          selectedDashboards
        );
        onUserDataChange(processedUsers);
      } else {
        // No dashboards selected, show all users
        const processedUsers = processUserEngagementData(
          userData,
          null,
          [],
          []
        );
        onUserDataChange(processedUsers);
      }
    },
    [
      fetchUsersByUserGroups,
      selectedDashboards,
      fetchDashboardAnalytics,
      processUserEngagementData,
      onUserDataChange,
    ]
  );

  // Handle dashboard selection change
  const handleDashboardsChange = useCallback(
    async ({ selected }: { selected: string[] }) => {
      setSelectedDashboards(selected);

      // If no users loaded yet, just update selection
      if (users.length === 0) {
        return;
      }

      if (selected.length > 0) {
        // Fetch analytics for selected dashboards
        const { analytics, logs } = await fetchDashboardAnalytics(selected);
        setCurrentAnalytics(analytics);
        setCurrentAccessLogs(logs);

        // Re-process users - only show those who accessed selected dashboards
        const processedUsers = processUserEngagementData(
          users,
          analytics,
          logs,
          selected
        );
        onUserDataChange(processedUsers);
      } else {
        // No dashboards selected, clear analytics and show all users
        setCurrentAnalytics(null);
        setCurrentAccessLogs([]);
        const processedUsers = processUserEngagementData(users, null, [], []);
        onUserDataChange(processedUsers);
      }
    },
    [
      users,
      fetchDashboardAnalytics,
      processUserEngagementData,
      onUserDataChange,
    ]
  );

  // Handle any errors
  const hasError =
    (usersError && selectedUserGroups.length > 0) ||
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

        {isLoading && (
          <div className="flex items-center">
            <CircularLoader small />
            <span className="ml-2">
              {analyticsLoading
                ? i18n.t("Loading dashboard analytics...")
                : i18n.t("Fetching user data...")}
            </span>
          </div>
        )}
      </div>

      {selectedUserGroups.length === 0 && (
        <div className="p-4 text-center">
          {i18n.t("Select a user group to view user engagement data")}
        </div>
      )}
    </div>
  );
};
