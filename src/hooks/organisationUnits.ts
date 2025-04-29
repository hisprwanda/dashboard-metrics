// src/hooks/organisationUnits.ts
import { useDataQuery } from "@dhis2/app-runtime";

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
export const useOrganisationUnitsByLevel = (levelNo: string, orgUnitSqlViewUid: string) => {
  // Skip the query if no level is selected
  const enabled = !!levelNo;

  const query = {
    sqlViewData: {
      resource: `sqlViews/${orgUnitSqlViewUid}/data`,
      params: {
        paging: false,
        var: [`level:${levelNo}`],
      },
    },
  };


  return useDataQuery(query, { enabled });
};
