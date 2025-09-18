"use client";

import { useEffect, useState, useMemo } from "react";

import { useDataMutation, useDataQuery } from "@dhis2/app-runtime";

export interface SqlViewParams {
  name: string;
  description: string;
  type: string;
  cacheStrategy: string;
  sqlQuery: string;
}

export interface DataStoreItem {
  name: string;
  uid: string;
  isSqlViewCreated: boolean;
  isSqlViewExecuted: boolean;
  [key: string]: any;
}

interface DHIS2Error {
  response?: {
    httpStatusCode?: number;
    response?: {
      uid?: string;
    };
  };
}

const sqlParams: SqlViewParams = {
  name: "Statistics about user access to dashboards and visualizations",
  description: "Statistics about user access to dashboards and visualizations",
  type: "MATERIALIZED_VIEW",
  cacheStrategy: "CACHE_1_MINUTE",
  sqlQuery:
    "SELECT timestamp, username, favoriteuid, eventtype FROM datastatisticsevent WHERE eventtype = 'DASHBOARD_VIEW';",
};

// SQL view for organization units by level
const orgUnitByLevelSqlParams: SqlViewParams = {
  name: "Get Organization Units By Level",
  description: "Returns organization units at a specific level that can be dynamically specified",
  type: "QUERY",
  cacheStrategy: "CACHE_1_MINUTE",
  sqlQuery:
    "SELECT ou.organisationunitid, ou.uid, ou.name, ou.code, ou.path, ous.level " +
    "FROM organisationunit ou " +
    "JOIN _orgunitstructure ous ON ou.organisationunitid = ous.organisationunitid " +
    "WHERE ous.level = ${level} " +
    "ORDER BY ou.name;",
  // Note: The level parameter should be passed in the query parameters when executing the SQL view
};

// Query to check if SQL view exists by name
const checkSqlViewQuery = {
  sqlViews: {
    resource: "sqlViews",
    params: {
      fields: "id,name,description",
      paging: false,
    },
  },
} as const;

const createSqlViewMutation = {
  resource: "sqlViews",
  type: "create",
  data: ({ name, description, type, cacheStrategy, sqlQuery }: SqlViewParams) => ({
    name,
    description,
    type,
    cacheStrategy,
    sqlQuery,
  }),
};

const createSqlViewsMutation = {
  resource: "maintenance/sqlViewsCreate",
  type: "create",
  data: {},
};

const dataStoreMutation = {
  resource: "dataStore/dashboardMetrics/appID",
  type: "create",
  data: (data: DataStoreItem) => ({
    ...data,
  }),
};

export const useSqlViewService = () => {
  const [createSqlView, { loading: createLoading, error: createError }] =
    useDataMutation(createSqlViewMutation);
  const [executeSqlViews, { loading: executeLoading, error: executeError }] =
    useDataMutation(createSqlViewsMutation);

  const useCheckSqlViewExistsQuery = (name: string) => {
    const memoizedQuery = useMemo(
      () => ({
        sqlViews: {
          resource: "sqlViews",
          params: {
            filter: `name:eq:${name}`,
            fields: "id,name,description",
            paging: false,
          },
        },
      }),
      [name]
    );

    return useDataQuery(memoizedQuery, {
      lazy: true,
    });
  };

  const useSqlViewQuery = (viewUid: string, params: Record<string, any> = {}) => {
    const memoizedQuery = useMemo(
      () => ({
        sqlViewData: {
          resource: `sqlViews/${viewUid}/data`,
          params,
        },
      }),
      [viewUid, params]
    );

    return useDataQuery(memoizedQuery, { lazy: true });
  };

  return {
    createSqlView,
    createLoading,
    createError,
    executeSqlViews,
    executeLoading,
    executeError,
    useSqlViewQuery,
    useCheckSqlViewExistsQuery,
  };
};

const deleteDataStoreMutation = {
  resource: "dataStore/dashboardMetrics/appID",
  type: "delete",
};

const orgUnitDataStoreMutation = {
  resource: "dataStore/dashboardMetrics/OrgSqlQueryId",
  type: "create",
  data: (data: DataStoreItem) => ({
    ...data,
  }),
};

const deleteOrgUnitDataStoreMutation = {
  resource: "dataStore/dashboardMetrics/OrgSqlQueryId",
  type: "delete",
};

export const useDataStoreService = () => {
  const useDataStoreItem = () => {
    const query = {
      datastore: {
        resource: "dataStore/dashboardMetrics/appID",
      },
    };
    return useDataQuery(query);
  };

  const useOrgUnitDataStoreItem = () => {
    const query = {
      datastore: {
        resource: "dataStore/dashboardMetrics/OrgSqlQueryId",
      },
    };
    return useDataQuery(query);
  };

  const [saveDataStoreItemMutation, { loading: mutateLoading, error: mutateError }] =
    useDataMutation(dataStoreMutation);
  const [
    saveOrgUnitDataStoreItemMutation,
    { loading: orgUnitMutateLoading, error: orgUnitMutateError },
  ] = useDataMutation(orgUnitDataStoreMutation);

  const [deleteDataStoreItemMutation, { loading: deleteLoading, error: deleteError }] =
    useDataMutation(deleteDataStoreMutation);
  const [
    deleteOrgUnitDataStoreItemMutation,
    { loading: deleteOrgUnitLoading, error: deleteOrgUnitError },
  ] = useDataMutation(deleteOrgUnitDataStoreMutation);

  const deleteDataStoreItem = async (): Promise<any> => {
    try {
      return await deleteDataStoreItemMutation({});
    } catch (error) {
      console.error("Error deleting from datastore:", error);
      throw error;
    }
  };

  const deleteOrgUnitDataStoreItem = async (): Promise<any> => {
    try {
      return await deleteOrgUnitDataStoreItemMutation({});
    } catch (error) {
      console.error("Error deleting org unit from datastore:", error);
      throw error;
    }
  };

  const saveDataStoreItem = async (key: string, data: DataStoreItem): Promise<any> => {
    try {
      return await saveDataStoreItemMutation(data);
    } catch (error) {
      console.error("Error saving to datastore:", error);
      throw error;
    }
  };

  const saveOrgUnitDataStoreItem = async (key: string, data: DataStoreItem): Promise<any> => {
    try {
      return await saveOrgUnitDataStoreItemMutation(data);
    } catch (error) {
      console.error("Error saving org unit to datastore:", error);
      throw error;
    }
  };

  return {
    useDataStoreItem,
    useOrgUnitDataStoreItem,
    saveDataStoreItem,
    saveOrgUnitDataStoreItem,
    deleteDataStoreItem,
    deleteOrgUnitDataStoreItem,
    mutateLoading,
    mutateError,
    deleteLoading,
    deleteError,
  };
};

export const useInitializeSystem = () => {
  const [initialized, setInitialized] = useState(false);
  const [sqlViewUid, setSqlViewUid] = useState<string | null>(null);
  const [orgUnitSqlViewUid, setOrgUnitSqlViewUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  const {
    useDataStoreItem,
    useOrgUnitDataStoreItem,
    saveDataStoreItem,
    saveOrgUnitDataStoreItem,
    deleteDataStoreItem,
    deleteOrgUnitDataStoreItem,
  } = useDataStoreService();

  const { createSqlView, executeSqlViews, useCheckSqlViewExistsQuery } = useSqlViewService();

  const { loading: dsLoading, data: dsData } = useDataStoreItem();
  const { loading: orgUnitDsLoading, data: orgUnitDsData } = useOrgUnitDataStoreItem();

  const {
    data: sqlViewData,
    refetch: checkSqlView,
    loading: checkSqlViewLoading,
  } = useCheckSqlViewExistsQuery(sqlParams.name);

  const checkOrgUnitSqlViewQuery = {
    sqlViews: {
      resource: "sqlViews",
      params: {
        filter: `name:eq:${orgUnitByLevelSqlParams.name}`,
        fields: "id,name,description",
        paging: false,
      },
    },
  };
  const {
    data: orgUnitSqlViewData,
    refetch: checkOrgUnitSqlView,
    loading: checkOrgUnitSqlViewLoading,
  } = useDataQuery(checkOrgUnitSqlViewQuery, { lazy: true });

  useEffect(() => {
    if (initializationAttempted) {
      return;
    }

    const init = async () => {
      if (dsLoading || checkSqlViewLoading || orgUnitDsLoading || checkOrgUnitSqlViewLoading) {
        return;
      }

      try {
        setInitializationAttempted(true);

        // Initialize dashboard SQL view
        const dashboardViewUid = await initializeSqlView(
          dsData?.datastore,
          sqlParams,
          checkSqlView,
          saveDataStoreItem,
          deleteDataStoreItem,
          "appID"
        );

        // Initialize organization unit SQL view
        const orgUnitViewUid = await initializeSqlView(
          orgUnitDsData?.datastore,
          orgUnitByLevelSqlParams,
          checkOrgUnitSqlView,
          saveOrgUnitDataStoreItem,
          deleteOrgUnitDataStoreItem,
          "OrgSqlQueryId"
        );

        // Save to state
        setSqlViewUid(dashboardViewUid);
        setOrgUnitSqlViewUid(orgUnitViewUid);
        setInitialized(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    // Helper function to initialize a SQL view
    const initializeSqlView = async (
      dataStoreData: any,
      params: SqlViewParams,
      checkFunction: Function,
      saveFunction: Function,
      deleteFunction: Function,
      key: string
    ): Promise<string | null> => {
      // Step 1: Check if view exists in datastore
      if (dataStoreData?.uid) {
        const existingViewResponse = await checkFunction();
        const existingSqlViews = existingViewResponse?.sqlViews?.sqlViews;

        if (existingSqlViews?.length > 0 && existingSqlViews[0].name === params.name) {
          // SQL view exists and matches our name, use it
          return dataStoreData.uid;
        }
        // SQL view doesn't exist or name doesn't match, delete the datastore item
        await deleteFunction();
        // Continue with the rest of the initialization
      }

      // Step 2: Check if SQL view with this name already exists
      const existingViewResponse = await checkFunction();
      let uid: string | null = null;

      if (existingViewResponse?.sqlViews?.sqlViews?.length > 0) {
        // SQL view already exists, use its UID
        uid = existingViewResponse.sqlViews.sqlViews[0].id;
      } else {
        // Step 3: Create SQL view if it doesn't exist
        try {
          const createResponse = await createSqlView(params);
          uid = createResponse.response.uid;
        } catch (err) {
          // Handle 409 conflict (view already exists)
          const dhisError = err as DHIS2Error;
          if (dhisError?.response?.httpStatusCode === 409 && dhisError?.response?.response?.uid) {
            uid = dhisError.response.response.uid;
          } else {
            console.error(`Error creating SQL view for ${params.name}:`, err);
            throw err;
          }
        }
      }

      if (!uid) {
        throw new Error(`Failed to get SQL view UID for ${params.name}`);
      }

      // Step 4: Execute the SQL views creation via maintenance endpoint
      try {
        await executeSqlViews({});
      } catch (err) {
        console.error("Error creating SQL views:", err);
      }

      // Step 5: Save to datastore
      await saveFunction(key, {
        name: params.name,
        uid,
        isSqlViewCreated: true,
        isSqlViewExecuted: true,
      });

      return uid;
    };

    init();
  }, [
    dsData,
    dsLoading,
    orgUnitDsData,
    orgUnitDsLoading,
    checkSqlView,
    checkOrgUnitSqlView,
    createSqlView,
    executeSqlViews,
    saveDataStoreItem,
    saveOrgUnitDataStoreItem,
    deleteDataStoreItem,
    deleteOrgUnitDataStoreItem,
    initializationAttempted,
    checkSqlViewLoading,
    checkOrgUnitSqlViewLoading,
    sqlViewData,
    orgUnitSqlViewData,
  ]);

  return { initialized, sqlViewUid, orgUnitSqlViewUid, loading, error };
};
