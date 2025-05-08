// file location: src/hooks/users.ts

import { useDataQuery } from "@dhis2/app-runtime";

/**
 * Hook to fetch users filtered by usernames, organization units, user groups, and disabled status
 * @param usernames Array of usernames to filter by (optional)
 * @param orgUnitPaths Array of organization unit paths to filter by (optional)
 * @param orgUnitIds Array of organization unit IDs to filter by (optional)
 * @param userGroups Array of user group IDs to filter by (optional)
 * @param disabled Boolean to filter disabled users (optional)
 * @returns Query result with loading, error, data, and refetch function
 */
export const useFilteredUsers = (usernames: string[] = [], orgUnitPaths: string[] = [], orgUnitIds: string[] = [], userGroups: string[] = [], disabled?: boolean) => {
  const query = {
    users: {
      resource: "users",
      params: ({ usernames, orgUnitPaths, orgUnitIds, userGroups, disabled }: { usernames: string[]; orgUnitPaths: string[]; orgUnitIds: string[]; userGroups: string[]; disabled: boolean; }) => {
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
          filters.push(`userCredentials.disabled:eq:true`);
        }

        if (filters.length > 0) {
          params.filter = filters;
        }

        return params;
      },
    },
  };


  const result = useDataQuery(query, {
    variables: {
      usernames: usernames || [],
      orgUnitPaths: orgUnitPaths || [],
      orgUnitIds: orgUnitIds || [],
      userGroups: userGroups || [],
      disabled: disabled || false,
    },
  });

  return result;
};


/**
 * Hook to fetch all user groups with basic information
 * @returns Query result with loading, error, data, and refetch function containing user groups
 */
export const useUserGroups = () => {
  const query = {
    userGroups: {
      resource: "userGroups",
      params: {
        paging: false,
        fields: "id,code,name,displayName",
      },
    },
  };

  const result = useDataQuery(query);

  return result;
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
  lastLoginStatus: 'all' | 'active' | 'inactive' = 'all',
  lastLoginDate?: string,
  inactiveSince?: string,
  disabled?: boolean
) => {
  const query = {
    users: {
      resource: "users",
      params: ({ lastLoginStatus, lastLoginDate, inactiveSince, disabled }: {
        lastLoginStatus: 'all' | 'active' | 'inactive';
        lastLoginDate?: string;
        inactiveSince?: string;
        disabled?: boolean;
      }) => {
        const params: any = {
          paging: false,
          fields:
            "id,firstName,surname,username,name,displayName,phoneNumber,jobTitle,userCredentials[username,lastLogin,disabled,userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
        };

        const filters = [];

        // Filter by login status
        if (lastLoginStatus === 'inactive') {
          filters.push('userCredentials.lastLogin:null');
        } else if (lastLoginStatus === 'active' && lastLoginDate) {
          params.lastLogin = lastLoginDate;
        }

        // Filter by inactive since date
        if (inactiveSince) {
          params.inactiveSince = inactiveSince;
        }

        // Filter disabled users
        if (disabled) {
          filters.push(`userCredentials.disabled:eq:true`);
        }

        if (filters.length > 0) {
          params.filter = filters;
        }

        return params;
      },
    },
  };

  const result = useDataQuery(query, {
    variables: {
      lastLoginStatus,
      lastLoginDate,
      inactiveSince,
      disabled,
    },
  });

  return result;
};
