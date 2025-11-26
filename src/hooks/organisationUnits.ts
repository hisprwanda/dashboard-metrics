// src/hooks/organisationUnits.ts
import { useCallback, useState } from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";

// Define proper types for the hook responses
interface OrganisationUnitLevel {
  id: string;
  name: string;
  displayName: string;
  level: number;
}

interface OrganisationUnitLevelsResponse {
  organisationUnitLevels: {
    organisationUnitLevels: OrganisationUnitLevel[];
  };
}

interface SqlViewResponse {
  sqlViewData: {
    listGrid: {
      rows: unknown[][];
      headers: Array<{ name: string; column: string; type: string }>;
    };
  };
}

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
  return useDataQuery<OrganisationUnitLevelsResponse>(ORG_UNIT_LEVELS_QUERY);
};

/**
 * Hook to fetch organisation units by level using SQL view
 * @returns Object with loading state, error, data, and fetch function
 */
export const useOrganisationUnitsByLevel = () => {
  const engine = useDataEngine();

  // Local states for loading, error, and data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<SqlViewResponse | null>(null);

  const fetchOrganisationUnitsByLevel = useCallback(
    async (levelNo: string, orgUnitSqlViewUid: string): Promise<SqlViewResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        // Create a dynamic query for this specific request
        const dynamicQuery = {
          sqlViewData: {
            resource: `sqlViews/${orgUnitSqlViewUid}/data`,
            params: {
              paging: false,
              var: [`level:${levelNo}`],
            },
          },
        };

        // Use engine.query instead of manual fetch
        const result = await engine.query(dynamicQuery);

        setData(result as SqlViewResponse);
        return result as SqlViewResponse;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [engine]
  );

  return { loading, error, data, fetchOrganisationUnitsByLevel };
};
