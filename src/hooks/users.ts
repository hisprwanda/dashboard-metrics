// file location: src/hooks/users.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";

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
  // Create stable string keys for comparison to detect actual value changes
  const usernamesKey = usernames.join(",");
  const orgUnitPathsKey = orgUnitPaths.join(",");
  const orgUnitIdsKey = orgUnitIds.join(",");
  const userGroupsKey = userGroups.join(",");

  // Only run the query if we have meaningful filters
  const shouldSkip =
    usernames.length === 0 &&
    orgUnitPaths.length === 0 &&
    orgUnitIds.length === 0 &&
    userGroups.length === 0 &&
    disabled === undefined;

  // Build the query with current filter values
  const query = useMemo(() => {
    const filters: string[] = [];

    if (usernames.length > 0) {
      filters.push(`userCredentials.username:in:[${usernames.join(",")}]`);
    }
    if (orgUnitPaths.length > 0) {
      filters.push(`organisationUnits.path:in:[${orgUnitPaths.join(",")}]`);
    }
    if (orgUnitIds.length > 0) {
      filters.push(`organisationUnits.id:in:[${orgUnitIds.join(",")}]`);
    }
    if (userGroups.length > 0) {
      filters.push(`userGroups.id:in:[${userGroups.join(",")}]`);
    }
    if (disabled) {
      filters.push("userCredentials.disabled:eq:true");
    }

    return {
      users: {
        resource: "users",
        params: {
          paging: false,
          fields:
            "id,firstName,surname,username,name,displayName,phoneNumber,jobTitle,userCredentials[username,lastLogin,disabled,userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
          ...(filters.length > 0 ? { filter: filters } : {}),
        },
      },
    };
  }, [usernamesKey, orgUnitPathsKey, orgUnitIdsKey, userGroupsKey, disabled]);

  const result = useDataQuery(query, {
    lazy: shouldSkip,
  });

  // Track previous key to detect changes
  const prevKeyRef = useRef<string>("");
  const currentKey = `${usernamesKey}|${orgUnitPathsKey}|${orgUnitIdsKey}|${userGroupsKey}|${disabled}`;

  // Refetch when filters change and we have meaningful filters
  useEffect(() => {
    if (!shouldSkip && currentKey !== prevKeyRef.current) {
      prevKeyRef.current = currentKey;
      result.refetch();
    }
  }, [currentKey, shouldSkip, result.refetch]);

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
    () =>
      buildLoginStatusQuery(
        lastLoginStatus,
        lastLoginDate,
        inactiveSince,
        disabled
      ),
    [lastLoginStatus, lastLoginDate, inactiveSince, disabled]
  );

  const result = useDataQuery(query);

  return result;
};

// User type for district engagement
export interface DistrictUser {
  id: string;
  username?: string;
  displayName?: string;
  userCredentials?: {
    username?: string;
    lastLogin?: string | null;
  };
  organisationUnits?: Array<{ id: string; name: string }>;
}

// User type for user engagement
export interface EngagementUser {
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

/**
 * Hook to fetch users by user groups (imperative style)
 * Uses useDataEngine for manual fetching to avoid dynamic query issues
 */
export const useUsersByUserGroups = () => {
  const engine = useDataEngine();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<EngagementUser[]>([]);

  const fetchUsersByUserGroups = useCallback(
    async (userGroupIds: string[]): Promise<EngagementUser[]> => {
      if (userGroupIds.length === 0) {
        setData([]);
        return [];
      }

      setLoading(true);
      setError(undefined);

      try {
        const query = {
          users: {
            resource: "users",
            params: {
              paging: false,
              fields:
                "id,displayName,userCredentials[username,lastLogin,userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
              filter: `userGroups.id:in:[${userGroupIds.join(",")}]`,
            },
          },
        };

        const result = await engine.query(query);
        const users =
          (result?.users as { users: EngagementUser[] })?.users || [];

        setData(users);
        return users;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [engine]
  );

  const clear = useCallback(() => {
    setData([]);
    setError(undefined);
  }, []);

  return { loading, error, data, fetchUsersByUserGroups, clear };
};

/**
 * Hook to fetch users by organisation unit IDs
 * Uses useDataEngine for manual fetching to avoid dynamic query issues
 */
export const useUsersByOrgUnitIds = () => {
  const engine = useDataEngine();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<DistrictUser[]>([]);

  const fetchUsersByOrgUnitIds = useCallback(
    async (orgUnitIds: string[]): Promise<DistrictUser[]> => {
      if (orgUnitIds.length === 0) {
        setData([]);
        return [];
      }

      setLoading(true);
      setError(undefined);

      try {
        const query = {
          users: {
            resource: "users",
            params: {
              paging: false,
              fields:
                "id,username,displayName,userCredentials[username,lastLogin],organisationUnits[id,name]",
              filter: `organisationUnits.id:in:[${orgUnitIds.join(",")}]`,
            },
          },
        };

        const result = await engine.query(query);
        const users = (result?.users as { users: DistrictUser[] })?.users || [];

        setData(users);
        return users;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [engine]
  );

  const clear = useCallback(() => {
    setData([]);
    setError(undefined);
  }, []);

  return { loading, error, data, fetchUsersByOrgUnitIds, clear };
};
