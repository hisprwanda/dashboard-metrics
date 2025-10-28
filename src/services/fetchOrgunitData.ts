// file location: src/services/fetchOrgunitData.ts
import { useDataQuery } from "@dhis2/app-runtime";

// Static query for org unit data to prevent recreation
const ORG_UNIT_DATA_QUERY = {
  currentUser: {
    resource: "me",
    params: {
      fields: ["organisationUnits[id, displayName]"],
    },
  },
  orgUnits: {
    resource: "organisationUnits",
    params: {
      fields: "id,displayName,path,children[id,displayName,path,level],level",
      paging: "false",
    },
  },
  orgUnitLevels: {
    resource: "organisationUnitLevels",
    params: {
      fields: "id,displayName,level",
      paging: "false",
    },
  },
  orgUnitGroups: {
    resource: "organisationUnitGroups",
    params: {
      fields: "id,displayName,organisationUnits[id,displayName]",
      paging: "false",
    },
  },
} as const;

// This service is responsible for fetching the current user and organization units
export const useOrgUnitData = () => {
  const { loading, error, data } = useDataQuery(ORG_UNIT_DATA_QUERY);
  return { loading, error, data };
};

// Static query for single org unit data to prevent recreation
const SINGLE_ORG_UNIT_DATA_QUERY = {
  currentUser: {
    resource: "me",
    params: {
      fields: ["organisationUnits[id, displayName]"],
    },
  },
  orgUnits: {
    resource: "organisationUnits",
    params: {
      fields: "id,displayName,path,children[id,displayName,path,level],level",
      paging: "false",
    },
  },
} as const;

export const useSingleOrgUnitData = () => {
  const { loading, error, data } = useDataQuery(SINGLE_ORG_UNIT_DATA_QUERY);
  return { loading, error, data };
};
