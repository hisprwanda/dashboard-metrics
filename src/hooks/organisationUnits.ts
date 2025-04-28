import { useDataQuery } from "@dhis2/app-runtime";

/**
 * hook to fetch organisation units levels
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

  const result = useDataQuery(query);

  return result;
};

export const useOrganisationUnits = (levelId: string) => {
  const query = {
    organisationUnits: {
      resource: "organisationUnits",
      params: {
        paging: false,
        fields: "id,name,displayName,shortName,level",
        filter: `level:eq:${levelId}`,
      },
    },
  };

  const result = useDataQuery(query);

  return result;
};