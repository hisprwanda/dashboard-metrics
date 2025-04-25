// file loaded from: src/services/DataSourceHooks.tsx

import { useDataQuery } from '@dhis2/app-runtime';

export const useDataSourceData = () => {

    const query = {
        dataStore: {
            resource: 'dataStore/r-data-source',
            params: () => ({
                fields: '.',
            }),
        },
    };

    const { data, loading, error, isError, refetch } = useDataQuery(query);

    return { data, loading, error, isError, refetch };

};