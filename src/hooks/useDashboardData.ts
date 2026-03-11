// Custom hook for dashboard data fetching with proper typing and filtering

import { useCallback, useMemo, useState } from "react";
import { useConfig } from "@dhis2/app-runtime";

import type { DateValueType } from "@/types/dashboard-reportType";
import type { SqlViewResponse } from "@/types/dashboard-data";

import { formatDateToYYYYMMDD } from "../lib/utils";

export interface DashboardDataParams {
  datetime: DateValueType;
  dashboardId?: string;
  sqlViewUid: string;
  orgUnitPaths?: string[];
}

interface FetchState {
  loading: boolean;
  error: Error | undefined;
  data: SqlViewResponse | null;
}

export const useDashboardData = ({
  datetime,
  dashboardId,
  sqlViewUid,
}: DashboardDataParams) => {
  const { baseUrl } = useConfig();

  const [state, setState] = useState<FetchState>({
    loading: false,
    error: undefined,
    data: null,
  });

  // Ensure we have valid dates before making the query
  const startDate = datetime.startDate
    ? formatDateToYYYYMMDD(datetime.startDate)
    : formatDateToYYYYMMDD(new Date());
  const endDate = datetime.endDate
    ? formatDateToYYYYMMDD(datetime.endDate)
    : formatDateToYYYYMMDD(new Date());

  // Only make the query if we have required parameters
  const shouldSkip = !sqlViewUid || !dashboardId;

  // Build the URL manually to prevent double-encoding of '%'
  // The '%' wildcard is needed for timestamp filtering in DHIS2 SQL Views
  const buildUrl = useCallback(() => {
    if (!sqlViewUid || !baseUrl) return null;

    // Manually encode the filter parts but preserve the '%' wildcard
    // We encode ':' as '%3A' but leave '%' as-is (not as '%25')
    const timestampGeFilter = `timestamp%3Age%3A${startDate}%`;
    const timestampLeFilter = `timestamp%3Ale%3A${endDate}%`;
    const favoriteFilter = dashboardId
      ? `favoriteuid%3Aeq%3A${dashboardId}`
      : "";

    let url = `${baseUrl}/api/sqlViews/${sqlViewUid}/data?paging=false`;
    url += `&filter=${timestampGeFilter}`;
    url += `&filter=${timestampLeFilter}`;
    if (favoriteFilter) {
      url += `&filter=${favoriteFilter}`;
    }

    return url;
  }, [baseUrl, sqlViewUid, startDate, endDate, dashboardId]);

  const refetch = useCallback(async () => {
    if (shouldSkip) return;

    const url = buildUrl();
    if (!url) return;

    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();

      // Transform to match expected SqlViewResponse structure
      const transformedData: SqlViewResponse = {
        sqlViewData: {
          listGrid: jsonData.listGrid || { headers: [], rows: [] },
        },
      };

      setState({
        loading: false,
        error: undefined,
        data: transformedData,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({
        loading: false,
        error,
        data: null,
      });
    }
  }, [shouldSkip, buildUrl]);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    refetch,
    isReady: !shouldSkip,
  };
};

export default useDashboardData;
