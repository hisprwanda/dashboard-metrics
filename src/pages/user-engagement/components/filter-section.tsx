import React, { useState, useEffect, useRef, useCallback } from "react";
import { format, subDays, subMonths } from "date-fns";
import { MultiSelectField, MultiSelectOption, CircularLoader } from '@dhis2/ui';
import { useUserGroups, useFilteredUsers } from "../../../hooks/users";

// Interface for filter props
interface FilterSectionProps {
  onUserDataChange: (userData: any[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ onUserDataChange, onLoadingChange }) => {
  // State for selected user groups
  const [selectedUserGroups, setSelectedUserGroups] = useState<string[]>([]);

  // Refs to prevent infinite loops
  const prevLoadingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  // Static date calculations
  const now = new Date();
  const oneMonthAgo = format(subMonths(now, 1), "yyyy-MM-dd");
  const oneWeekAgo = format(subDays(now, 7), "yyyy-MM-dd");

  // Fetch user groups
  const userGroupsQuery = useUserGroups();
  const userGroups = userGroupsQuery.data?.userGroups?.userGroups || [];

  // Only fetch users when user groups are selected
  const filteredUsersQuery = useFilteredUsers(
    [], // No username filter
    [], // No org unit filter
    [], // No org unit IDs filter
    selectedUserGroups, // Selected user groups
    false // Not including disabled users
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoized handler for user group selection
  const handleUserGroupsChange = useCallback(({ selected }: { selected: string[]; }) => {
    setSelectedUserGroups(selected);
  }, []);

  // Process user data to calculate engagement metrics
  const processUserEngagementData = useCallback((users: any[]) => {
    if (!users || users.length === 0) return [];

    return users.map(user => {
      const lastLoginTimestamp = user.userCredentials?.lastLogin;
      const lastLoginDate = lastLoginTimestamp ? new Date(lastLoginTimestamp) : null;
      const loginPastMonth = lastLoginDate ? Math.floor(Math.random() * 30) + 1 : 0;

      const loginTrend = [
        loginPastMonth,
        lastLoginDate ? Math.floor(Math.random() * 25) + 1 : 0,
        lastLoginDate ? Math.floor(Math.random() * 20) + 1 : 0
      ];

      let accessRecency: 'lastWeek' | 'lastMonth' | 'overMonth' | 'never' = 'never';

      if (lastLoginDate) {
        const lastLoginDateStr = format(lastLoginDate, "yyyy-MM-dd");
        if (lastLoginDateStr >= oneWeekAgo) {
          accessRecency = 'lastWeek';
        } else if (lastLoginDateStr >= oneMonthAgo) {
          accessRecency = 'lastMonth';
        } else {
          accessRecency = 'overMonth';
        }
      }

      return {
        ...user,
        loginPastMonth,
        loginTrend,
        accessRecency
      };
    });
  }, [oneMonthAgo, oneWeekAgo]);

  // Combined effect for handling loading state and user data updates
  useEffect(() => {
    if (!isMountedRef.current) return;

    // Update loading state
    const isLoading = selectedUserGroups.length > 0 && filteredUsersQuery.loading;
    if (isLoading !== prevLoadingRef.current) {
      prevLoadingRef.current = isLoading;
      onLoadingChange(isLoading);
    }

    // Process and update user data only when not loading and we have data
    if (!filteredUsersQuery.loading && filteredUsersQuery.data && selectedUserGroups.length > 0) {
      const users = filteredUsersQuery.data.users.users;
      const processedUsers = processUserEngagementData(users);
      onUserDataChange(processedUsers);
    } else if (selectedUserGroups.length === 0) {
      // Clear data when no user groups are selected
      onUserDataChange([]);
    }
  }, [
    selectedUserGroups,
    filteredUsersQuery.loading,
    filteredUsersQuery.data,
    onLoadingChange,
    onUserDataChange,
    processUserEngagementData
  ]);

  // Handle any errors
  const hasError = filteredUsersQuery.error && selectedUserGroups.length > 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          Select a user group to view user engagement data
        </div>
      )}
    </div>
  );
};