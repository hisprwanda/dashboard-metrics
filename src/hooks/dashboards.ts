import { useCallback, useMemo, useState } from "react";
import { useConfig, useDataQuery } from "@dhis2/app-runtime";

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

interface SqlViewFetchState {
  loading: boolean;
  error: Error | undefined;
  data: unknown;
}

export const useSqlViewDataReport = ({
  datetime,
  criteria,
  sqlViewUid,
}: Params) => {
  const { baseUrl } = useConfig();

  const [state, setState] = useState<SqlViewFetchState>({
    loading: false,
    error: undefined,
    data: undefined,
  });

  // Ensure we have valid dates before making the query
  const startDate = datetime.startDate
    ? formatDateToYYYYMMDD(datetime.startDate)
    : formatDateToYYYYMMDD(new Date());
  const endDate = datetime.endDate
    ? formatDateToYYYYMMDD(datetime.endDate)
    : formatDateToYYYYMMDD(new Date());

  // Extract dashboard ID from criteria
  const dashboardId = useMemo(() => {
    if (!criteria) return "";
    // The criteria comes in format "favoriteuid%<dashboard-id>"
    return criteria.replace("favoriteuid%", "").replace(/^%3A/, "");
  }, [criteria]);

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

      setState({
        loading: false,
        error: undefined,
        data: {
          sqlViewData: {
            listGrid: jsonData.listGrid || { headers: [], rows: [] },
          },
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({
        loading: false,
        error,
        data: undefined,
      });
    }
  }, [buildUrl]);

  return {
    loading: state.loading,
    error: state.error,
    data: state.data,
    refetch,
  };
};
