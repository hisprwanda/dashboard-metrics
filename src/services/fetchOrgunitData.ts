import { useDataQuery } from '@dhis2/app-runtime';

// This service is responsible for fetching the current user and organization units
export const useOrgUnitData = () => {
  const query = {
    currentUser: {
      resource: 'me',
      params: {
        fields: ['organisationUnits[id, displayName]'],
      },
    },
    orgUnits: {
      resource: 'organisationUnits',
      params: {
        fields: 'id,displayName,path,children[id,displayName,path,level],level',
        paging: 'false',
      },
    },
    orgUnitLevels: {
      resource: 'organisationUnitLevels',
      params: {
        fields: 'id,displayName,level',
        paging: 'false',
      },
    },
  };

  const { loading, error, data } = useDataQuery(query);
  return { loading, error, data };
};

export const useSingleOrgUnitData = () => {
  const query = {
    currentUser: {
      resource: 'me',
      params: {
        fields: ['organisationUnits[id, displayName]'],
      },
    },
    orgUnits: {
      resource: 'organisationUnits',
      params: {
        fields: 'id,displayName,path,children[id,displayName,path,level],level',
        paging: 'false',
      },
    },
  };
  const { loading, error, data } = useDataQuery(query);
  return { loading, error, data };
};
