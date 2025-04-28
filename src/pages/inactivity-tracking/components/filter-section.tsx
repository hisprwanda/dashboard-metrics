import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { MultiSelectField, MultiSelectOption, CircularLoader } from '@dhis2/ui';
import { useUserGroups, useFilteredUsers, useUsersByLoginStatus } from "./../../../hooks/users";

// Interface for user login status options
interface UserLoginStatusOption {
  id: string;
  label: string;
  value: string;
  description: string;
}

// Interface for filter props
interface FilterSectionProps {
  onUserDataChange: (userData: any) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ onUserDataChange, onLoadingChange }) => {
  // State for selected user groups
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);

  // State for selected login status
  const [selectedLoginStatus, setSelectedLoginStatus] = useState<string[]>([]);

  // State to track fetched users
  const [fetchedUsers, setFetchedUsers] = useState<any[]>([]);

  // Fetch user groups
  const userGroupsQuery = useUserGroups();
  const userGroups = userGroupsQuery.data?.userGroups?.userGroups || [];

  // Login status options
  const loginStatusOptions: UserLoginStatusOption[] = [
    {
      id: "never_logged_in",
      label: "Never Logged In",
      value: "inactive",
      description: "Users who have never logged in"
    },
    {
      id: "inactive_30_days",
      label: "Inactive (30+ Days)",
      value: "active",
      description: "Users who haven't logged in for the past 30 days"
    }
  ];

  // Calculate the date 30 days ago
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  // Only fetch users when user groups are selected
  const filteredUsersQuery = useFilteredUsers(
    [], // No username filter
    [], // No org unit filter
    selectedUserGroups, // Selected user groups
    false // Not including disabled users
  );

  // Update loading state based on query status
  useEffect(() => {
    const isLoading = selectedUserGroups.length > 0 && filteredUsersQuery.loading;
    onLoadingChange(isLoading);
  }, [
    selectedUserGroups,
    filteredUsersQuery.loading,
    onLoadingChange
  ]);

  // Handle fetching users when user groups change
  useEffect(() => {
    if (selectedUserGroups.length > 0 && filteredUsersQuery.data) {
      // Store the fetched users
      const users = filteredUsersQuery.data.users.users;
      setFetchedUsers(users);

      // Apply any existing login status filters to the fetched users
      if (selectedLoginStatus.length > 0) {
        applyLoginStatusFilter(users);
      } else {
        // If no login status filter, show all users from selected groups
        onUserDataChange(users);
      }
    } else if (selectedUserGroups.length === 0) {
      // If no user groups selected, clear the user data
      setFetchedUsers([]);
      onUserDataChange([]);
    }
  }, [
    selectedUserGroups,
    filteredUsersQuery.data,
  ]);

  // Apply login status filters to the fetched users
  const applyLoginStatusFilter = (users: any[]) => {
    if (!users || users.length === 0) return;

    let filteredUsers: any[] = [];

    // Apply filters based on login status
    if (selectedLoginStatus.includes("inactive")) {
      // Filter for users who have never logged in
      const neverLoggedIn = users.filter(user =>
        !user.userCredentials?.lastLogin
      );
      filteredUsers = [...neverLoggedIn];
    }

    if (selectedLoginStatus.includes("active")) {
      // Filter for users who are inactive for 30+ days
      const inactiveUsers = users.filter(user => {
        const lastLogin = user.userCredentials?.lastLogin;
        if (!lastLogin) return false;

        const lastLoginDate = new Date(lastLogin);
        const thirtyDaysAgoDate = subDays(new Date(), 30);
        return lastLoginDate < thirtyDaysAgoDate;
      });

      // Combine with existing filtered users, avoiding duplicates
      const existingIds = filteredUsers.map(u => u.id);
      inactiveUsers.forEach(user => {
        if (!existingIds.includes(user.id)) {
          filteredUsers.push(user);
        }
      });
    }

    // If no specific login status is selected, use all fetched users
    if (selectedLoginStatus.length === 0) {
      filteredUsers = users;
    }

    // Update the user data
    onUserDataChange(filteredUsers);
  };

  // Handle login status filter changes
  useEffect(() => {
    // Only apply filters if we have already fetched users
    if (fetchedUsers.length > 0) {
      applyLoginStatusFilter(fetchedUsers);
    }
  }, [selectedLoginStatus]);

  // Handle user group selection change
  const handleUserGroupsChange = ({ selected }: { selected: string[]; }) => {
    setSelectedUserGroups(selected);
  };

  // Handle login status selection change
  const handleLoginStatusChange = ({ selected }: { selected: string[]; }) => {
    setSelectedLoginStatus(selected);
  };

  // Handle any errors
  const hasError = filteredUsersQuery.error && selectedUserGroups.length > 0;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
        {/* User Groups Selector */}
        <div>
          <MultiSelectField
            label="User Groups"
            onChange={handleUserGroupsChange}
            selected={selectedUserGroups}
            loading={userGroupsQuery.loading}
            filterable
            clearable
            placeholder="Select user groups"
            noMatchText="No user groups found"
            className="mb-4"
            dataTest="user-groups-selector"
          >
            {userGroups.map((group: any) => (
              <MultiSelectOption
                key={group.id}
                label={group.displayName}
                value={group.id}
              />
            ))}
          </MultiSelectField>
        </div>

        {/* Login Status Selector */}
        <div>
          <MultiSelectField
            label="Login Status"
            onChange={handleLoginStatusChange}
            selected={selectedLoginStatus}
            clearable
            placeholder="Select login status"
            className="mb-4"
            dataTest="login-status-selector"
          >
            {loginStatusOptions.map(option => (
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
            An error occurred while fetching user data. Please try again.
          </div>
        )}

        {selectedUserGroups.length > 0 && filteredUsersQuery.loading && (
          <div className="flex items-center">
            <CircularLoader small />
            <span className="ml-2">Fetching user data...</span>
          </div>
        )}
      </div>

      {selectedUserGroups.length === 0 && (
        <div className="p-4 text-center">
          Select a user group to view user data
        </div>
      )}
    </div>
  );
};