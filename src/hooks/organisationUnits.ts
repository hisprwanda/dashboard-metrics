// src/hooks/organisationUnits.ts
import { useDataEngine } from "@dhis2/app-runtime";
import { useDataQuery } from "@dhis2/app-runtime";
import { useCallback, useState } from "react";

/**
 * Hook to fetch all organisation unit levels
 */
export const useOrganisationUnitLevels = () => {
  const query = {
    organisationUnitLevels: {
      resource: "organisationUnitLevels",
      params: {
        paging: false,
        fields: "id,name,displayName,level",
      },
    },
  };

  return useDataQuery(query);
};


/**
 * SQL Query Hook to fetch all organisation units in a specific level
 * @param levelNo The level number of the organisation units to fetch
 * @param orgUnitSqlViewUid The UID of the SQL view to use for fetching the data
 * @returns Results from the SQL view containing organisation units at the specified level
 */
export const useOrganisationUnitsByLevel = () => {
  const engine = useDataEngine();
  // Local states for loading, error, and data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);


  const fetchOrganisationUnitsByLevel = useCallback(async (levelNo: string, orgUnitSqlViewUid: string) => {

    const query = {
      sqlViewData: {
        resource: `sqlViews/${orgUnitSqlViewUid}/data`,
        params: {
          paging: false,
          var: [`level:${levelNo}`],
        },
      },
    };

    setLoading(true);
    setError(null);
    try {
      const result = await engine.query(query);
      setData(result); // Store the fetched data in state
      return result;
    } catch (err) {
      setError(err); // Handle any errors
      return null; // Explicitly return null or some default value
    } finally {
      setLoading(false); // Reset the loading state
    }
  }, [engine]);


  return { loading, error, data, fetchOrganisationUnitsByLevel };
};
