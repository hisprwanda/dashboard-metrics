// file location: src/hooks/users.ts

import { useMemo } from "react";
import { useDataQuery, useDataMutation } from "@dhis2/app-runtime";

// Static query builder function to avoid recreation
const buildUsersQuery = (
  usernames: string[],
  orgUnitPaths: string[],
  orgUnitIds: string[],
  userGroups: string[],
  disabled?: boolean
) => {
  const params: any = {
    paging: false,
    fields:
      "id,firstName,surname,username,name,displayName,phoneNumber,jobTitle,userCredentials[username,lastLogin,disabled,userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
  };

  const filters = [];

  if (usernames && usernames.length > 0) {
    filters.push(`userCredentials.username:in:[${usernames.join(",")}]`);
  }

  if (orgUnitPaths && orgUnitPaths.length > 0) {
    filters.push(`organisationUnits.path:in:[${orgUnitPaths.join(",")}]`);
  }

  if (orgUnitIds && orgUnitIds.length > 0) {
    filters.push(`organisationUnits.id:in:[${orgUnitIds.join(",")}]`);
  }

  if (userGroups && userGroups.length > 0) {
    filters.push(`userGroups.id:in:[${userGroups.join(",")}]`);
  }

  if (disabled) {
    filters.push("userCredentials.disabled:eq:true");
  }

  if (filters.length > 0) {
    params.filter = filters;
  }

  return {
    users: {
      resource: "users",
      params,
    },
  };
};

/**
 * Hook to fetch users filtered by usernames, organization units, user groups, and disabled status
 * @param usernames Array of usernames to filter by (optional)
 * @param orgUnitPaths Array of organization unit paths to filter by (optional)
 * @param orgUnitIds Array of organization unit IDs to filter by (optional)
 * @param userGroups Array of user group IDs to filter by (optional)
 * @param disabled Boolean to filter disabled users (optional)
 * @returns Query result with loading, error, data, and refetch function
 */
export const useFilteredUsers = (
  usernames: string[] = [],
  orgUnitPaths: string[] = [],
  orgUnitIds: string[] = [],
  userGroups: string[] = [],
  disabled?: boolean
) => {
  // Memoize the query to prevent recreation on every render
  const query = useMemo(
    () => buildUsersQuery(usernames, orgUnitPaths, orgUnitIds, userGroups, disabled),
    [usernames, orgUnitPaths, orgUnitIds, userGroups, disabled]
  );

  // Only run the query if we have meaningful filters or need all users
  const shouldSkip =
    usernames.length === 0 &&
    orgUnitPaths.length === 0 &&
    orgUnitIds.length === 0 &&
    userGroups.length === 0 &&
    disabled === undefined;

  const result = useDataQuery(query, {
    lazy: shouldSkip, // Skip initial query if no filters
  });

  return result;
};

// Static query for user groups to prevent recreation
const USER_GROUPS_QUERY = {
  userGroups: {
    resource: "userGroups",
    params: {
      paging: false,
      fields: "id,code,name,displayName",
    },
  },
} as const;

/**
 * Hook to fetch all user groups with basic information
 * @returns Query result with loading, error, data, and refetch function containing user groups
 */
export const useUserGroups = () => {
  return useDataQuery(USER_GROUPS_QUERY);
};

// Static query builder for login status filtering
const buildLoginStatusQuery = (
  lastLoginStatus: "all" | "active" | "inactive",
  lastLoginDate?: string,
  inactiveSince?: string,
  disabled?: boolean
) => {
  const params: any = {
    paging: false,
    fields:
      "id,firstName,surname,username,name,displayName,phoneNumber,jobTitle,userCredentials[username,lastLogin,disabled,userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
  };

  const filters = [];

  // Filter by login status
  if (lastLoginStatus === "inactive") {
    filters.push("userCredentials.lastLogin:null");
  } else if (lastLoginStatus === "active" && lastLoginDate) {
    params.lastLogin = lastLoginDate;
  }

  // Filter by inactive since date
  if (inactiveSince) {
    params.inactiveSince = inactiveSince;
  }

  // Filter disabled users
  if (disabled) {
    filters.push("userCredentials.disabled:eq:true");
  }

  if (filters.length > 0) {
    params.filter = filters;
  }

  return {
    users: {
      resource: "users",
      params,
    },
  };
};

/**
 * Hook to fetch users filtered by their last login status or date
 * @param lastLoginStatus 'all' to fetch all users, 'active' for users who have logged in, 'inactive' for users who have never logged in
 * @param lastLoginDate Date in YYYY-MM-DD format to filter users who logged in after this date (only used when lastLoginStatus is 'active')
 * @param inactiveSince Date in YYYY-MM-DD format to filter users who haven't logged in since this date
 * @param disabled Boolean to filter disabled users (optional)
 * @returns Query result with loading, error, data, and refetch function
 */
export const useUsersByLoginStatus = (
  lastLoginStatus: "all" | "active" | "inactive" = "all",
  lastLoginDate?: string,
  inactiveSince?: string,
  disabled?: boolean
) => {
  // Memoize the query to prevent recreation on every render
  const query = useMemo(
    () => buildLoginStatusQuery(lastLoginStatus, lastLoginDate, inactiveSince, disabled),
    [lastLoginStatus, lastLoginDate, inactiveSince, disabled]
  );

  const result = useDataQuery(query);

  return result;
};
