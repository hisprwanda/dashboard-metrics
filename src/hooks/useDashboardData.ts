// Custom hook for dashboard data fetching with proper typing and filtering

import { useMemo } from "react";
import { useDataQuery } from "@dhis2/app-runtime";

import type { DateValueType } from "@/types/dashboard-reportType";
import type { SqlViewResponse } from "@/types/dashboard-data";

import { formatDateToYYYYMMDD } from "../lib/utils";

export interface DashboardDataParams {
  datetime: DateValueType;
  dashboardId?: string;
  sqlViewUid: string;
  orgUnitPaths?: string[];
}

export const useDashboardData = ({
  datetime,
  dashboardId,
  sqlViewUid,
  orgUnitPaths = [],
}: DashboardDataParams) => {
  // Ensure we have valid dates before making the query
  const startDate = datetime.startDate
    ? formatDateToYYYYMMDD(datetime.startDate)
    : formatDateToYYYYMMDD(new Date());
  const endDate = datetime.endDate
    ? formatDateToYYYYMMDD(datetime.endDate)
    : formatDateToYYYYMMDD(new Date());

  // Build filters array
  const filters = useMemo(() => {
    const filterArray = [
      `timestamp:ge:${startDate}`,
      `timestamp:le:${endDate}`,
    ];

    // Add dashboard filter if dashboard ID is provided
    if (dashboardId) {
      filterArray.push(`favoriteuid:eq:${dashboardId}`);
    }

    return filterArray;
  }, [startDate, endDate, dashboardId]);

  // Build the query
  const query = useMemo(() => {
    if (!sqlViewUid) {
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
  }, [sqlViewUid, filters]);

  // Only make the query if we have required parameters
  const shouldSkip = !sqlViewUid || !dashboardId;

  const result = useDataQuery(query || {}, {
    lazy: shouldSkip,
  });

  // Transform data to proper type
  const data = useMemo(() => {
    if (!result.data || shouldSkip) return null;
    return result.data as unknown as SqlViewResponse;
  }, [result.data, shouldSkip]);

  return {
    ...result,
    data,
    isReady: !shouldSkip,
  };
};

export default useDashboardData;
