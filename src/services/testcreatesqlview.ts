import { useDataMutation } from "@dhis2/app-runtime";

const createMutation = {
  resource: "sqlViews",
  type: "create",
  data: ({ name, description, type, cacheStrategy, sqlQuery }: { name: string; description: string; type: string; cacheStrategy: string; sqlQuery: string; }) => ({
    name,
    description,
    type,
    cacheStrategy,
    sqlQuery,
  }),
};

const executeMutation = {
  resource: "sqlViews",
  type: "create",
  data: () => ({}),
};

const testSqlParams = {
  name: "AAAAAAAAStatistics about user access to dashboards and visualizations",
  description: "Statistics about user access to dashboards and visualizations",
  type: "MATERIALIZED_VIEW",
  cacheStrategy: "CACHE_1_MINUTE",
  sqlQuery:
    "SELECT timestamp, username, favoriteuid, eventtype FROM datastatisticsevent WHERE eventtype = 'DASHBOARD_VIEW';",
};

export const useTestSqlView = () => {
  const [createSqlView] = useDataMutation(createMutation);
  const [executeSqlView] = useDataMutation(executeMutation);

  const createTestView = async () => {
    try {
      const createResponse = await createSqlView(testSqlParams);
      console.log("SQL View created:", createResponse);

      const uid = createResponse.response.uid;
      const executeResponse = await executeSqlView({}, {
        variables: {},
        resource: `sqlViews/${uid}/execute`
      });
      console.log("SQL View executed:", executeResponse);

      return { success: true, uid };
    } catch (error) {
      console.error("Error creating test SQL view:", error);
      return { success: false, error };
    }
  };

  return { createTestView };
};
