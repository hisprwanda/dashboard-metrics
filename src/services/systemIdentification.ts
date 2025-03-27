"use client";

import { useState, useEffect } from "react";
import { useDataQuery, useDataMutation } from "@dhis2/app-runtime";

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

// Define a type for DHIS2 API errors
interface DHIS2Error {
  response?: {
    httpStatusCode?: number;
    response?: {
      uid?: string;
    };
  };
}

const sqlParams: SqlViewParams = {
  name: "ABABA Statistics about user access to dashboards and visualizations",
  description: "ABABA Statistics about user access to dashboards and visualizations",
  type: "MATERIALIZED_VIEW",
  cacheStrategy: "CACHE_1_MINUTE",
  sqlQuery:
    "SELECT timestamp, username, favoriteuid, eventtype FROM datastatisticsevent WHERE eventtype = 'DASHBOARD_VIEW';",
};

// Query to check if SQL view exists by name
const checkSqlViewQuery = {
  sqlViews: {
    resource: "sqlViews",
    params: ({ name }: { name: string; }) => ({
      filter: `name:eq:${name}`,
      fields: "id,name,description",
      paging: false,
    }),
  },
};

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

const dataStoreMutation = {
  resource: "dataStore/dashboardMetrics/appID",
  type: "create",
  data: (data: DataStoreItem) => ({
    ...data
  })
};

export const useSqlViewService = () => {
  const [createSqlView, { loading: createLoading, error: createError }] = useDataMutation(createSqlViewMutation);

  const useCheckSqlViewExistsQuery = () => {
    return useDataQuery(checkSqlViewQuery, {
      variables: { name: sqlParams.name },
      lazy: true,
    });
  };

  const useSqlViewQuery = (viewUid: string, params: Record<string, any> = {}) => {
    const query = {
      sqlViewData: {
        resource: `sqlViews/${viewUid}/data`,
        params,
      },
    };
    return useDataQuery(query, { lazy: true });
  };

  return {
    createSqlView,
    createLoading,
    createError,
    useSqlViewQuery,
    useCheckSqlViewExistsQuery,
  };
};

export const useDataStoreService = () => {
  const useDataStoreItem = () => {
    const query = {
      datastore: {
        resource: `dataStore/dashboardMetrics/appID`,
      },
    };
    return useDataQuery(query);
  };

  const [saveDataStoreItemMutation, { loading: mutateLoading, error: mutateError }] = useDataMutation(dataStoreMutation);

  const saveDataStoreItem = async (key: string, data: DataStoreItem): Promise<any> => {
    try {
      return await saveDataStoreItemMutation(data);
    } catch (error) {
      console.error("Error saving to datastore:", error);
      throw error;
    }
  };

  return {
    useDataStoreItem,
    saveDataStoreItem,
    mutateLoading,
    mutateError,
  };
};

export const useInitializeSystem = () => {
  const [initialized, setInitialized] = useState(false);
  const [sqlViewUid, setSqlViewUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  const { useDataStoreItem, saveDataStoreItem } = useDataStoreService();
  const { createSqlView, useCheckSqlViewExistsQuery } = useSqlViewService();

  const { loading: dsLoading, data: dsData } = useDataStoreItem();
  const { data: sqlViewData, refetch: checkSqlView, loading: checkSqlViewLoading } = useCheckSqlViewExistsQuery();

  useEffect(() => {
    // Prevent multiple initialization attempts
    if (initializationAttempted) {
      return;
    }

    const init = async () => {
      // Only run initialization when both queries have completed
      if (dsLoading || checkSqlViewLoading) {
        return;
      }

      try {
        setInitializationAttempted(true);
        console.log("Starting system initialization...");

        // Step 2: Check if appID exists in datastore
        if (dsData && dsData.datastore && dsData.datastore.uid) {
          console.log("Found existing SQL view in datastore:", dsData.datastore.uid);
          setSqlViewUid(dsData.datastore.uid);
          setInitialized(true);
          setLoading(false);
          return;
        }

        // Step 3: Check if SQL view with this name already exists
        console.log("Checking if SQL view exists...");
        const existingViewResponse = await checkSqlView();
        let uid: string | null = null;

        if (existingViewResponse?.sqlViews?.sqlViews?.length > 0) {
          // SQL view already exists, use its UID
          uid = existingViewResponse.sqlViews.sqlViews[0].id;
          console.log("Found existing SQL view:", uid);
        } else {
          // Step 4: Create SQL view if it doesn't exist
          console.log("Creating new SQL view...");
          try {
            const createResponse = await createSqlView(sqlParams);
            uid = createResponse.response.uid;
            console.log("Created new SQL view:", uid);
          } catch (err) {
            // Handle 409 conflict (view already exists)
            const dhisError = err as DHIS2Error;
            if (dhisError?.response?.httpStatusCode === 409 && dhisError?.response?.response?.uid) {
              uid = dhisError.response.response.uid;
              console.log("SQL view already exists (from 409):", uid);
            } else {
              console.error("Error creating SQL view:", err);
              throw err;
            }
          }
        }

        if (!uid) {
          throw new Error("Failed to get SQL view UID");
        }

        // Execute the SQL view
        // console.log("Executing SQL view:", uid);
        // const executeResult = await executeSqlView(uid);
        // console.log("SQL view execution result:", executeResult);

        // Step 5: Save to datastore
        console.log("Saving to datastore...");
        await saveDataStoreItem("appID", {
          name: sqlParams.name,
          uid,
          isSqlViewCreated: true,
          isSqlViewExecuted: false,
        });

        // Step 6: Save to state
        setSqlViewUid(uid);
        setInitialized(true);
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [
    dsData,
    dsLoading,
    checkSqlView,
    createSqlView,
    saveDataStoreItem,
    initializationAttempted,
    checkSqlViewLoading,
    sqlViewData,
  ]);

  return { initialized, sqlViewUid, loading, error };
};