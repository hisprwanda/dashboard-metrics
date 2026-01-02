import React, { useCallback, useEffect, useState } from "react";

import { subDays } from "date-fns";

import { CircularLoader, MultiSelectField, MultiSelectOption } from "@dhis2/ui";

import { useFilteredUsers, useUserGroups } from "../../../hooks/users";
import { useDashboardsInfo } from "../../../hooks/dashboards";
import { useDashboardAnalytics } from "../../../hooks/useDashboardAnalytics";
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
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isUserGroupArray = (value: unknown): value is UserGroup[] =>
  Array.isArray(value) &&
  value.every(
    (group) =>
      isRecord(group) &&
      typeof group.id === "string" &&
      typeof group.displayName === "string"
  );

const isFilteredUser = (value: unknown): value is FilteredUser =>
  isRecord(value) && typeof value.id === "string";

const isFilteredUserArray = (value: unknown): value is FilteredUser[] =>
  Array.isArray(value) && value.every(isFilteredUser);

const isLoginStatusValue = (value: string): value is LoginStatusValue =>
  value === "inactive" || value === "active" || value === "dashboard_inactive";

// Static empty arrays to prevent re-creation on every render
const EMPTY_USERNAME_FILTER: string[] = [];
const EMPTY_ORG_UNIT_FILTER: string[] = [];
const EMPTY_ORG_UNIT_IDS: string[] = [];

export const FilterSection: React.FC<FilterSectionProps> = ({
  onUserDataChange,
  onLoadingChange,
}) => {
  const { sqlViewUid } = useSystem();

  // State for selected user groups and dashboards
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);

  // State for selected login status
  const [selectedLoginStatus, setSelectedLoginStatus] = useState<
    LoginStatusValue[]
  >([]);

  // State to track fetched users
  const [fetchedUsers, setFetchedUsers] = useState<FilteredUser[]>([]);

  // Fetch user groups
  const userGroupsQuery = useUserGroups();
  const userGroupsData = userGroupsQuery.data?.userGroups?.userGroups;
  const userGroups = isUserGroupArray(userGroupsData) ? userGroupsData : [];

  // Fetch dashboards list
  const { data: dashboardsData } = useDashboardsInfo();
  const dashboards = dashboardsData?.dashboards?.dashboards || [];

  // Fetch dashboard analytics when dashboards are selected
  const {
    analytics: dashboardAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useDashboardAnalytics({
    dashboardIds: selectedDashboards,
    sqlViewUid: sqlViewUid || "",
    enabled: selectedDashboards.length > 0,
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

  // Only fetch users when user groups are selected - using static arrays
  const filteredUsersQuery = useFilteredUsers(
    EMPTY_USERNAME_FILTER, // Static reference, won't change on re-render
    EMPTY_ORG_UNIT_FILTER, // Static reference, won't change on re-render
    EMPTY_ORG_UNIT_IDS,
    selectedUserGroups // Selected user groups
  );

  // Update loading state based on query status
  useEffect(() => {
    const isLoading =
      (selectedUserGroups.length > 0 && filteredUsersQuery.loading) ||
      analyticsLoading;
    onLoadingChange(isLoading);
  }, [
    selectedUserGroups,
    filteredUsersQuery.loading,
    analyticsLoading,
    onLoadingChange,
  ]);

  // Handle fetching users when user groups change
  const applyLoginStatusFilter = useCallback(
    (users: FilteredUser[]) => {
      if (users.length === 0) {
        onUserDataChange([]);
        return;
      }

      if (selectedLoginStatus.length === 0) {
        onUserDataChange(users);
        return;
      }

      const thresholdDate = subDays(new Date(), 30);
      const filteredUserMap = new Map<string, FilteredUser>();

      if (selectedLoginStatus.includes("inactive")) {
        users
          .filter((user) => !user.userCredentials?.lastLogin)
          .forEach((user) => {
            filteredUserMap.set(user.id, user);
          });
      }

      if (selectedLoginStatus.includes("active")) {
        users
          .filter((user) => {
            const { lastLogin } = user.userCredentials ?? {};

            if (typeof lastLogin !== "string" || lastLogin.length === 0) {
              return false;
            }

            const lastLoginDate = new Date(lastLogin);
            return (
              Number.isFinite(lastLoginDate.getTime()) &&
              lastLoginDate < thresholdDate
            );
          })
          .forEach((user) => {
            filteredUserMap.set(user.id, user);
          });
      }

      // Filter users who never accessed selected dashboards
      if (
        selectedLoginStatus.includes("dashboard_inactive") &&
        selectedDashboards.length > 0 &&
        dashboardAnalytics
      ) {
        users
          .filter((user) => {
            const username =
              user.userCredentials?.username ||
              user.displayName ||
              user.firstName + " " + user.surname;
            return !dashboardAnalytics.userAccessCounts[username];
          })
          .forEach((user) => {
            filteredUserMap.set(user.id, user);
          });
      }

      onUserDataChange(Array.from(filteredUserMap.values()));
    },
    [
      onUserDataChange,
      selectedLoginStatus,
      selectedDashboards.length,
      dashboardAnalytics,
    ]
  );

  useEffect(() => {
    if (selectedUserGroups.length === 0) {
      setFetchedUsers([]);
      onUserDataChange([]);
      return;
    }

    const queryUsers = filteredUsersQuery.data?.users;
    const usersFromQuery = isRecord(queryUsers) ? queryUsers.users : undefined;

    if (!isFilteredUserArray(usersFromQuery)) {
      return;
    }

    setFetchedUsers(usersFromQuery);

    if (selectedLoginStatus.length > 0) {
      applyLoginStatusFilter(usersFromQuery);
    } else {
      onUserDataChange(usersFromQuery);
    }
  }, [
    selectedUserGroups,
    filteredUsersQuery.data,
    selectedLoginStatus,
    applyLoginStatusFilter,
    onUserDataChange,
  ]);

  // Handle login status filter changes
  useEffect(() => {
    // Only apply filters if we have already fetched users
    if (fetchedUsers.length > 0) {
      applyLoginStatusFilter(fetchedUsers);
    }
  }, [applyLoginStatusFilter, fetchedUsers]);

  // Handle user group selection change
  const handleUserGroupsChange = useCallback(
    ({ selected }: { selected: string[] }) => {
      // Reset fetched users when selection changes to force data update
      setFetchedUsers([]);
      setSelectedUserGroups(selected);
    },
    []
  );

  // Handle dashboard selection change
  const handleDashboardsChange = useCallback(
    ({ selected }: { selected: string[] }) => {
      setSelectedDashboards(selected);
      // Reapply filters when dashboards change
      if (fetchedUsers.length > 0) {
        applyLoginStatusFilter(fetchedUsers);
      }
    },
    [fetchedUsers, applyLoginStatusFilter]
  );

  // Handle login status selection change
  const handleLoginStatusChange = useCallback(
    ({ selected }: { selected: string[] }) => {
      const validSelections = selected.filter(isLoginStatusValue);
      setSelectedLoginStatus(validSelections);
    },
    []
  );

  // Handle any errors
  const hasError =
    (filteredUsersQuery.error && selectedUserGroups.length > 0) ||
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

        {((selectedUserGroups.length > 0 && filteredUsersQuery.loading) ||
          analyticsLoading) && (
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
