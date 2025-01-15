import { DateValueType } from "@/types/dashboard-reportType";
import { formatDateToYYYYMMDD } from "../lib/utils";
import { Dashboards } from "@/types/dashboardsType";
import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useState } from "react";

export type UseDashboardsInfoReturn = {
  loading: boolean;
  error: Error | undefined;
  data: { dashboards: Dashboards } | undefined;
};

export const useDashboardsInfo = (): UseDashboardsInfoReturn => {
  const query = {
    dashboards: {
      resource: "dashboards",
      params: {
        paging: false,
        fields:
          "id,name,displayName,favorite,created,lastUpdated,createdBy[id,displayName],lastUpdatedBy[id,displayName],dashboardItems[visualization[id,displayName]]",
      },
    },
  };

  const { loading, error, data } = useDataQuery(query);
  return { loading, error, data };
};


 export interface Params {
    datetime: DateValueType;
    criteria: string;
  }

export const usesqlViewDataReport = ({
  datetime,
  criteria,
}: Params) => {
  const query = {
    sqlViewData: {
      resource: 'sqlViews/gO9r9r4Vc9l/data',
      params: ({
        datetime,
        criteria,
      }: Params) => ({
        paging: "false",
        criteria:criteria,
        filter: [
          `timestamp:ge:${formatDateToYYYYMMDD(datetime.startDate?datetime.startDate:new Date())}`,
          `timestamp:le:${formatDateToYYYYMMDD(datetime.endDate?datetime.endDate:new Date())}`,
          // `timestamp:ge:2020-11-01`,
          // `timestamp:le:2024-12-03`,
        ]
      }),
    },
  };
  // const { loading, error, data,refetch } = useDataQuery(query);
  const { loading, error, data, refetch } = useDataQuery(query, { lazy: true, enabled: false });
  return { loading, error, data,refetch };
};

export const usesqlVisualizationDataReport = ({
  datetime,
  criteria,
}: Params) => {
  const query = {
    sqlViewData: {
      resource: 'sqlViews/MfeSi4i0vCP/data',
      params: ({
        datetime,
        criteria,
      }: Params) => ({
        paging: "false",
        criteria:criteria,
        filter: [
          `timestamp:ge:${formatDateToYYYYMMDD(datetime.startDate?datetime.startDate:new Date())}`,
          `timestamp:le:${formatDateToYYYYMMDD(datetime.endDate?datetime.endDate:new Date())}`,
          // `timestamp:ge:2020-11-01`,
          // `timestamp:le:2024-12-03`,
        ]
      }),
    },
  };
  // const { loading, error, data,refetch } = useDataQuery(query);
  const { loading, error, data, refetch } = useDataQuery(query, { lazy: true, enabled: false });
  return { loading, error, data,refetch };
};
