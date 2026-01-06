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
    async (dashboardIds: string[]): Promise<DashboardAnalytics> => {
      const emptyAnalytics: DashboardAnalytics = {
        totalAccesses: 0,
        uniqueUsers: 0,
        userAccessCounts: {},
        userLastAccess: {},
      };

      if (!sqlViewUid || dashboardIds.length === 0) {
        setAccessLogs([]);
        return emptyAnalytics;
      }

      setLoading(true);
      setError(undefined);

      try {
        // Build filters for each dashboard
        const filters = dashboardIds.map((id) => `favoriteuid:eq:${id}`);

        const query = {
          sqlViewData: {
            resource: `sqlViews/${sqlViewUid}/data`,
            params: {
              paging: "false",
              filter: filters,
            },
          },
        };

        const result = (await engine.query(query)) as SqlViewResult;
        const rows = result?.sqlViewData?.listGrid?.rows || [];

        // Process raw SQL view data into structured access logs
        const logs: DashboardAccessLog[] = rows.map((row) => ({
          timestamp: String(row[0] || ""),
          username: String(row[1] || ""),
          dashboardId: String(row[2] || ""),
        }));

        setAccessLogs(logs);

        // Calculate analytics aggregations
        const userAccessCounts: Record<string, number> = {};
        const userLastAccess: Record<string, string> = {};

        logs.forEach((log) => {
          // Count accesses per user
          userAccessCounts[log.username] =
            (userAccessCounts[log.username] || 0) + 1;

          // Track last access per user
          const currentLast = userLastAccess[log.username];
          if (!currentLast || log.timestamp > currentLast) {
            userLastAccess[log.username] = log.timestamp;
          }
        });

        return {
          totalAccesses: logs.length,
          uniqueUsers: Object.keys(userAccessCounts).length,
          userAccessCounts,
          userLastAccess,
        };
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        return emptyAnalytics;
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
