import React, { useCallback, useEffect, useState } from "react";

import { subDays } from "date-fns";

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
} from "../../../hooks/useDashboardAnalytics";
import { useSystem } from "../../../context/SystemContext";
import i18n from "../../../locales";

// Interface for user login status options
type LoginStatusValue = "inactive" | "active" | "dashboard_inactive";

interface UserLoginStatusOption {
  id: string;
  label: string;
  value: LoginStatusValue;
  description: string;
}

// Interface for filter props
interface FilterSectionProps {
  onUserDataChange: (userData: FilteredUser[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

interface UserGroup {
  id: string;
  displayName: string;
}

interface UserCredentials {
  username?: string;
  lastLogin?: string | null;
  disabled?: boolean;
  userRoles?: Array<{ id: string; displayName: string }>;
}

export interface FilteredUser {
  id: string;
  displayName?: string;
  email?: string;
  firstName?: string;
  surname?: string;
  userCredentials?: UserCredentials | null;
  userGroups?: UserGroup[];
  organisationUnits?: Array<{ id: string; displayName: string }>;
}

const isUserGroupArray = (value: unknown): value is UserGroup[] =>
  Array.isArray(value) &&
  value.every(
    (group) =>
      typeof group === "object" &&
      group !== null &&
      typeof group.id === "string" &&
      typeof group.displayName === "string"
  );

const isLoginStatusValue = (value: string): value is LoginStatusValue =>
  value === "inactive" || value === "active" || value === "dashboard_inactive";

export const FilterSection: React.FC<FilterSectionProps> = ({
  onUserDataChange,
  onLoadingChange,
}) => {
  const { sqlViewUid } = useSystem();

  // State for selections
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const [selectedLoginStatus, setSelectedLoginStatus] = useState<
    LoginStatusValue[]
  >([]);

  // State to track fetched data
  const [users, setUsers] = useState<EngagementUser[]>([]);
  const [currentAnalytics, setCurrentAnalytics] =
    useState<DashboardAnalytics | null>(null);

  // Fetch user groups
  const userGroupsQuery = useUserGroups();
  const userGroupsData = userGroupsQuery.data?.userGroups?.userGroups;
  const userGroups = isUserGroupArray(userGroupsData) ? userGroupsData : [];

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

  // Login status options
  const loginStatusOptions: UserLoginStatusOption[] = [
    {
      id: "never_logged_in",
      label: i18n.t("Never Logged In"),
      value: "inactive",
      description: i18n.t("Users who have never logged in"),
    },
    {
      id: "inactive_30_days",
      label: i18n.t("Inactive (30+ Days)"),
      value: "active",
      description: i18n.t("Users who haven't logged in for the past 30 days"),
    },
    {
      id: "never_accessed_dashboard",
      label: i18n.t("Never Accessed Dashboards"),
      value: "dashboard_inactive",
      description: i18n.t("Users who never accessed selected dashboards"),
    },
  ];

  // Calculate loading state
  const isLoading = usersLoading || analyticsLoading;

  // Update parent loading state
  useEffect(() => {
    onLoadingChange(isLoading);
  }, [isLoading, onLoadingChange]);

  // Convert EngagementUser to FilteredUser
  const mapToFilteredUser = (user: EngagementUser): FilteredUser => ({
    id: user.id,
    displayName: user.displayName,
    userCredentials: user.userCredentials,
    userGroups: user.userGroups,
    organisationUnits: user.organisationUnits,
  });

  // Apply login status filter to users
  const applyFilters = useCallback(
    (
      usersData: EngagementUser[],
      analytics: DashboardAnalytics | null,
      loginStatus: LoginStatusValue[],
      dashboardIds: string[]
    ) => {
      if (usersData.length === 0) {
        onUserDataChange([]);
        return;
      }

      // If no login status filter, return all users
      if (loginStatus.length === 0) {
        onUserDataChange(usersData.map(mapToFilteredUser));
        return;
      }

      const thresholdDate = subDays(new Date(), 30);
      const filteredUserMap = new Map<string, FilteredUser>();

      // Filter: Never logged in
      if (loginStatus.includes("inactive")) {
        usersData
          .filter((user) => !user.userCredentials?.lastLogin)
          .forEach((user) => {
            filteredUserMap.set(user.id, mapToFilteredUser(user));
          });
      }

      // Filter: Inactive for 30+ days
      if (loginStatus.includes("active")) {
        usersData
          .filter((user) => {
            const lastLogin = user.userCredentials?.lastLogin;
            if (!lastLogin) return false;

            const lastLoginDate = new Date(lastLogin);
            return (
              Number.isFinite(lastLoginDate.getTime()) &&
              lastLoginDate < thresholdDate
            );
          })
          .forEach((user) => {
            filteredUserMap.set(user.id, mapToFilteredUser(user));
          });
      }

      // Filter: Never accessed selected dashboards
      if (
        loginStatus.includes("dashboard_inactive") &&
        dashboardIds.length > 0 &&
        analytics
      ) {
        usersData
          .filter((user) => {
            const username =
              user.userCredentials?.username || user.displayName || "";
            // User has NOT accessed any of the selected dashboards
            return !analytics.userAccessCounts[username];
          })
          .forEach((user) => {
            filteredUserMap.set(user.id, mapToFilteredUser(user));
          });
      }

      onUserDataChange(Array.from(filteredUserMap.values()));
    },
    [onUserDataChange]
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

      // If dashboards are already selected, fetch analytics
      if (selectedDashboards.length > 0) {
        const analytics = await fetchDashboardAnalytics(selectedDashboards);
        setCurrentAnalytics(analytics);
        applyFilters(
          userData,
          analytics,
          selectedLoginStatus,
          selectedDashboards
        );
      } else {
        applyFilters(userData, null, selectedLoginStatus, []);
      }
    },
    [
      fetchUsersByUserGroups,
      selectedDashboards,
      selectedLoginStatus,
      fetchDashboardAnalytics,
      applyFilters,
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
        const analytics = await fetchDashboardAnalytics(selected);
        setCurrentAnalytics(analytics);
        applyFilters(users, analytics, selectedLoginStatus, selected);
      } else {
        // No dashboards selected, clear analytics
        setCurrentAnalytics(null);
        applyFilters(users, null, selectedLoginStatus, []);
      }
    },
    [users, selectedLoginStatus, fetchDashboardAnalytics, applyFilters]
  );

  // Handle login status selection change
  const handleLoginStatusChange = useCallback(
    ({ selected }: { selected: string[] }) => {
      const validSelections = selected.filter(isLoginStatusValue);
      setSelectedLoginStatus(validSelections);

      // Re-apply filters with new login status
      if (users.length > 0) {
        applyFilters(
          users,
          currentAnalytics,
          validSelections,
          selectedDashboards
        );
      }
    },
    [users, currentAnalytics, selectedDashboards, applyFilters]
  );

  // Handle any errors
  const hasError =
    (usersError && selectedUserGroups.length > 0) ||
    (analyticsError && selectedDashboards.length > 0);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Login Status Selector */}
        <div>
          <MultiSelectField
            label={i18n.t("Login Status")}
            onChange={handleLoginStatusChange}
            selected={selectedLoginStatus}
            clearable
            placeholder={i18n.t("Select login status")}
            className="mb-4"
            dataTest="login-status-selector"
          >
            {loginStatusOptions.map((option) => (
              <MultiSelectOption
                key={option.id}
                label={option.label}
                value={option.value}
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
          {i18n.t("Select a user group to view user data")}
        </div>
      )}
    </div>
  );
};
