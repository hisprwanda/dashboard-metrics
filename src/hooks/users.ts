// file location: src/hooks/users.ts

import { useDataQuery } from "@dhis2/app-runtime";

/**
 * Hook to fetch users filtered by usernames and organization units
 * @param usernames Array of usernames to filter by
 * @param orgUnitPaths Array of organization unit paths to filter by (optional)
 * @returns Query result with loading, error, data, and refetch function
 */

export const useFilteredUsers = (usernames: string[], orgUnitPaths: string[] = []) => {
  const query = {
    users: {
      resource: "users",
      params: ({ usernames, orgUnitPaths }: { usernames: string[]; orgUnitPaths: string[]; }) => {
        const params: any = {
          paging: false,
          fields:
            "id,firstName, surname, username,name,displayName,phoneNumber,jobTitle,userCredentials[userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
        };

        const filters = [];

        if (usernames && usernames.length > 0) {
          filters.push(`userCredentials.username:in:[${usernames.join(",")}]`);
        }

        if (orgUnitPaths && orgUnitPaths.length > 0) {
          filters.push(`organisationUnits.path:in:[${orgUnitPaths.join(",")}]`);
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
    },
  });

  return result;
}

