// Custom hook for fetching and processing dashboard analytics data
// Used across District Engagement, User Engagement, and Inactivity Tracking tabs

import { useCallback, useMemo, useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

export interface DashboardAccessLog {
  timestamp: string;
  username: string;
  dashboardId: string;
}

export interface DashboardAnalytics {
  totalAccesses: number;
  uniqueUsers: number;
  userAccessCounts: Record<string, number>;
  userLastAccess: Record<string, string>;
}

export interface DashboardAnalyticsParams {
  sqlViewUid: string;
}

interface SqlViewResult {
  sqlViewData?: {
    listGrid?: {
      rows?: unknown[][];
    };
  };
}

/**
 * Hook to fetch and process dashboard analytics data
 * Uses useDataEngine for manual fetching to avoid dynamic query issues
 */
export const useDashboardAnalytics = ({
  sqlViewUid,
}: DashboardAnalyticsParams) => {
  const engine = useDataEngine();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [accessLogs, setAccessLogs] = useState<DashboardAccessLog[]>([]);

  const fetchDashboardAnalytics = useCallback(
    async (
      dashboardIds: string[]
    ): Promise<{
      analytics: DashboardAnalytics;
      logs: DashboardAccessLog[];
    }> => {
      const emptyAnalytics: DashboardAnalytics = {
        totalAccesses: 0,
        uniqueUsers: 0,
        userAccessCounts: {},
        userLastAccess: {},
      };

      if (!sqlViewUid || dashboardIds.length === 0) {
        setAccessLogs([]);
        return { analytics: emptyAnalytics, logs: [] };
      }

      setLoading(true);
      setError(undefined);

      try {
        // Query each dashboard ID separately in parallel to avoid AND logic
        // DHIS2 SQL view filter params on the same column are ANDed,
        // so we must issue one query per dashboard and merge results
        const results = await Promise.all(
          dashboardIds.map(
            (id) =>
              engine.query({
                sqlViewData: {
                  resource: `sqlViews/${sqlViewUid}/data`,
                  params: {
                    paging: false,
                    filter: [`favoriteuid:eq:${id}`],
                  },
                },
              }) as Promise<SqlViewResult>
          )
        );

        // Merge and deduplicate rows from all results
        const seenKeys = new Set<string>();
        const logs: DashboardAccessLog[] = [];

        for (const result of results) {
          const rows = result?.sqlViewData?.listGrid?.rows || [];
          for (const row of rows) {
            const timestamp = String(row[0] || "");
            const username = String(row[1] || "");
            const dashboardId = String(row[2] || "");
            const key = `${timestamp}|${username}|${dashboardId}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              logs.push({ timestamp, username, dashboardId });
            }
          }
        }

        setAccessLogs(logs);

        // Calculate analytics aggregations
        const userAccessCounts: Record<string, number> = {};
        const userLastAccess: Record<string, string> = {};

        logs.forEach((log) => {
          userAccessCounts[log.username] =
            (userAccessCounts[log.username] || 0) + 1;

          const currentLast = userLastAccess[log.username];
          if (!currentLast || log.timestamp > currentLast) {
            userLastAccess[log.username] = log.timestamp;
          }
        });

        const analytics: DashboardAnalytics = {
          totalAccesses: logs.length,
          uniqueUsers: Object.keys(userAccessCounts).length,
          userAccessCounts,
          userLastAccess,
        };

        return { analytics, logs };
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return { analytics: emptyAnalytics, logs: [] };
      } finally {
        setLoading(false);
      }
    },
    [engine, sqlViewUid]
  );

  const clear = useCallback(() => {
    setAccessLogs([]);
    setError(undefined);
  }, []);

  // Compute analytics from current access logs
  const analytics = useMemo<DashboardAnalytics>(() => {
    const userAccessCounts: Record<string, number> = {};
    const userLastAccess: Record<string, string> = {};

    accessLogs.forEach((log) => {
      userAccessCounts[log.username] =
        (userAccessCounts[log.username] || 0) + 1;

      const currentLast = userLastAccess[log.username];
      if (!currentLast || log.timestamp > currentLast) {
        userLastAccess[log.username] = log.timestamp;
      }
    });

    return {
      totalAccesses: accessLogs.length,
      uniqueUsers: Object.keys(userAccessCounts).length,
      userAccessCounts,
      userLastAccess,
    };
  }, [accessLogs]);

  return {
    loading,
    error,
    accessLogs,
    analytics,
    fetchDashboardAnalytics,
    clear,
  };
};

export default useDashboardAnalytics;
