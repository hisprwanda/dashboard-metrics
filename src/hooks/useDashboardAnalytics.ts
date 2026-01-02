// Custom hook for fetching and processing dashboard analytics data
// Used across District Engagement, User Engagement, and Inactivity Tracking tabs

import { useMemo } from "react";
import { useDataQuery } from "@dhis2/app-runtime";

import type { SqlViewResponse } from "@/types/dashboard-data";

import { formatDateToYYYYMMDD } from "../lib/utils";

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
  dashboardIds: string[];
  sqlViewUid: string;
  enabled?: boolean;
}

export const useDashboardAnalytics = ({
  dashboardIds,
  sqlViewUid,
  enabled = true,
}: DashboardAnalyticsParams) => {
  // Build filters array for SQL view query
  const filters = useMemo(() => {
    const filterArray: string[] = [];

    // Add dashboard filters - one for each selected dashboard
    if (dashboardIds.length > 0) {
      dashboardIds.forEach((dashboardId) => {
        filterArray.push(`favoriteuid:eq:${dashboardId}`);
      });
    }

    return filterArray;
  }, [dashboardIds]);

  // Build the query
  const query = useMemo(() => {
    if (!sqlViewUid || dashboardIds.length === 0) {
      return null;
    }

    return {
      sqlViewData: {
        resource: `sqlViews/${sqlViewUid}/data`,
        params: {
          paging: "false",
          filter: filters,
        },
      },
    };
  }, [sqlViewUid, filters, dashboardIds.length]);

  // Only make the query if enabled and we have required parameters
  const shouldSkip = !enabled || !sqlViewUid || dashboardIds.length === 0;

  const result = useDataQuery(query || {}, {
    lazy: shouldSkip,
  });

  // Process raw SQL view data into structured access logs
  const accessLogs = useMemo<DashboardAccessLog[]>(() => {
    if (!result.data || shouldSkip) return [];

    const rows = result.data.sqlViewData?.listGrid?.rows || [];

    return rows.map((row) => ({
      timestamp: String(row[0] || ""),
      username: String(row[1] || ""),
      dashboardId: String(row[2] || ""),
    }));
  }, [result.data, shouldSkip]);

  // Calculate analytics aggregations
  const analytics = useMemo<DashboardAnalytics>(() => {
    const userAccessCounts: Record<string, number> = {};
    const userLastAccess: Record<string, string> = {};

    accessLogs.forEach((log) => {
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
      totalAccesses: accessLogs.length,
      uniqueUsers: Object.keys(userAccessCounts).length,
      userAccessCounts,
      userLastAccess,
    };
  }, [accessLogs]);

  return {
    loading: result.loading,
    error: result.error,
    refetch: result.refetch,
    accessLogs,
    analytics,
    isReady: !shouldSkip,
  };
};

export default useDashboardAnalytics;
