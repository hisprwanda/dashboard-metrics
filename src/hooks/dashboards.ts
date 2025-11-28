import { useMemo } from "react";
import { useDataQuery } from "@dhis2/app-runtime";

import type { DateValueType } from "@/types/dashboard-reportType";
import type { Dashboards } from "@/types/dashboardsType";

import { formatDateToYYYYMMDD } from "../lib/utils";

export interface UseDashboardsInfoReturn {
  loading: boolean;
  error: Error | undefined;
  data: { dashboards: Dashboards } | undefined;
}

// Static query for dashboards to prevent recreation
const DASHBOARDS_QUERY = {
  dashboards: {
    resource: "dashboards",
    params: {
      paging: false,
      fields:
        "id,name,displayName,favorite,created,lastUpdated,createdBy[id,displayName],lastUpdatedBy[id,displayName],dashboardItems[visualization[id,displayName]]",
    },
  },
} as const;

export const useDashboardsInfo = (): UseDashboardsInfoReturn => {
  const { loading, error, data } = useDataQuery(DASHBOARDS_QUERY);
  return {
    loading,
    error,
    data: data as unknown as { dashboards: Dashboards } | undefined,
  };
};

export interface Params {
  datetime: DateValueType;
  criteria: string;
  sqlViewUid: string;
  orgUnitPaths?: string[];
}

// Helper function to build SQL view query
const buildSqlViewQuery = (sqlViewUid: string, filters: string[]) => ({
  sqlViewData: {
    resource: `sqlViews/${sqlViewUid}/data`,
    params: {
      paging: "false",
      filter: filters,
    },
  },
});

export const useSqlViewDataReport = ({
  datetime,
  criteria,
  sqlViewUid,
  orgUnitPaths = [],
}: Params) => {
  // Ensure we have valid dates before making the query
  const startDate = datetime.startDate
    ? formatDateToYYYYMMDD(datetime.startDate)
    : formatDateToYYYYMMDD(new Date());
  const endDate = datetime.endDate
    ? formatDateToYYYYMMDD(datetime.endDate)
    : formatDateToYYYYMMDD(new Date());

  // Memoize filters to prevent recreation on every render
  const filters = useMemo(() => {
    const filterArray = [
      `timestamp:ge:${startDate}`,
      `timestamp:le:${endDate}`,
    ];

    // Add dashboard filter if criteria is provided (extract dashboard ID from criteria)
    if (criteria) {
      // The criteria comes in format "favoriteuid%<dashboard-id>"
      const dashboardId = criteria
        .replace("favoriteuid%", "")
        .replace(/^%3A/, "");
      if (dashboardId) {
        filterArray.push(`favoriteuid:eq:${dashboardId}`);
      }
    }

    return filterArray;
  }, [startDate, endDate, orgUnitPaths, criteria]);

  // Memoize the query to prevent recreation on every render
  const query = useMemo(
    () => buildSqlViewQuery(sqlViewUid, filters),
    [sqlViewUid, filters]
  );

  const { loading, error, data, refetch } = useDataQuery(query, {
    lazy: true,
  });

  return { loading, error, data, refetch };
};
