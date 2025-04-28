import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { MultiSelectField, MultiSelectOption } from '@dhis2/ui';
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
}

export const FilterSection: React.FC<FilterSectionProps> = ({ onUserDataChange }) => {
  // State for selected user groups
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);

  // State for selected login status
  const [selectedLoginStatus, setSelectedLoginStatus] = useState<string[]>([]);

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

  // Fetch users by selected filters
  const filteredUsersQuery = useFilteredUsers(
    [], // No username filter
    [], // No org unit filter
    selectedUserGroups, // Selected user groups
    false // Not including disabled users
  );

  // Fetch users by login status
  const neverLoggedInQuery = useUsersByLoginStatus(
    selectedLoginStatus.includes("inactive") ? "inactive" : undefined,
    undefined,
    undefined,
    false
  );

  // Fetch inactive users (logged in before but not in past 30 days)
  const inactiveUsersQuery = useUsersByLoginStatus(
    selectedLoginStatus.includes("active") ? "active" : undefined,
    undefined,
    thirtyDaysAgo,
    false
  );

  // Combine and filter user data based on selections
  useEffect(() => {
    let combinedUsers: any[] = [];

    // First check if any filters are applied
    const hasFilters = selectedUserGroups.length > 0 || selectedLoginStatus.length > 0;

    if (!hasFilters) {
      // No filters applied, don't update data
      return;
    }

    // Process user groups filter
    if (selectedUserGroups.length > 0 && filteredUsersQuery.data) {
      combinedUsers = [...filteredUsersQuery.data.users.users];
    }

    // Process login status filter
    if (selectedLoginStatus.includes("inactive") && neverLoggedInQuery.data) {
      const neverLoggedIn = neverLoggedInQuery.data.users.users;

      if (selectedUserGroups.length > 0) {
        // Filter never logged in users by selected user groups
        combinedUsers = combinedUsers.filter(user =>
          neverLoggedIn.some((u: any) => u.id === user.id)
        );
      } else {
        combinedUsers = [...neverLoggedIn];
      }
    }

    if (selectedLoginStatus.includes("active") && inactiveUsersQuery.data) {
      const inactiveUsers = inactiveUsersQuery.data.users.users;

      if (combinedUsers.length > 0) {
        // Combine with existing filtered users
        const inactiveIds = inactiveUsers.map((u: any) => u.id);
        const existingIds = combinedUsers.map((u: any) => u.id);

        // Add inactive users that aren't already in the combined list
        inactiveUsers.forEach((user: any) => {
          if (!existingIds.includes(user.id)) {
            combinedUsers.push(user);
          }
        });
      } else if (selectedUserGroups.length > 0) {
        // Filter inactive users by selected user groups
        combinedUsers = inactiveUsers.filter((user: any) =>
          user.userGroups.some((group: any) => selectedUserGroups.includes(group.id))
        );
      } else {
        combinedUsers = [...inactiveUsers];
      }
    }

    // Pass the filtered users to the parent component
    onUserDataChange(combinedUsers);
  }, [
    selectedUserGroups,
    selectedLoginStatus,
    filteredUsersQuery.data,
    neverLoggedInQuery.data,
    inactiveUsersQuery.data
  ]);

  // Handle user group selection change
  const handleUserGroupsChange = ({ selected }: { selected: string[]; }) => {
    setSelectedUserGroups(selected);
  };

  // Handle login status selection change
  const handleLoginStatusChange = ({ selected }: { selected: string[]; }) => {
    setSelectedLoginStatus(selected);
  };

  return (
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
        // helpText="Filter users by their login activity"
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
  );
};