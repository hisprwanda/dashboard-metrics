// src/hooks/organisationUnits.ts
import { useCallback, useState } from "react";

import { useDataQuery, useDataMutation } from "@dhis2/app-runtime";

// Static query definition to prevent recreation
const ORG_UNIT_LEVELS_QUERY = {
  organisationUnitLevels: {
    resource: "organisationUnitLevels",
    params: {
      paging: false,
      fields: "id,name,displayName,level",
    },
  },
} as const;

/**
 * Hook to fetch all organisation unit levels
 */
export const useOrganisationUnitLevels = () => {
  return useDataQuery(ORG_UNIT_LEVELS_QUERY);
};

// Static mutation definition to prevent recreation
const SQL_VIEW_MUTATION = {
  resource: "sqlViews",
  type: "read",
} as const;

/**
 * SQL Query Hook to fetch all organisation units in a specific level
 * @param levelNo The level number of the organisation units to fetch
 * @param orgUnitSqlViewUid The UID of the SQL view to use for fetching the data
 * @returns Results from the SQL view containing organisation units at the specified level
 */
export const useOrganisationUnitsByLevel = () => {
  // Local states for loading, error, and data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  // Use static mutation for dynamic queries
  const [mutate] = useDataMutation(SQL_VIEW_MUTATION);

  const fetchOrganisationUnitsByLevel = useCallback(
    async (levelNo: string, orgUnitSqlViewUid: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutate({
          id: `${orgUnitSqlViewUid}/data`,
          params: {
            paging: false,
            var: [`level:${levelNo}`],
          },
        });
        setData(result); // Store the fetched data in state
        return result;
      } catch (err) {
        setError(err); // Handle any errors
        return null; // Explicitly return null or some default value
      } finally {
        setLoading(false); // Reset the loading state
      }
    },
    [mutate]
  );

  return { loading, error, data, fetchOrganisationUnitsByLevel };
};
