import { DateValueType } from "@/types/dashboard-reportType";
import { formatDateToYYYYMMDD } from "../lib/utils";
import { Dashboards } from "@/types/dashboardsType";
import { useDataQuery } from "@dhis2/app-runtime";

export type UseDashboardsInfoReturn = {
  loading: boolean;
  error: Error | undefined;
  data: { dashboards: Dashboards; } | undefined;
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
  sqlViewUid: string;
  orgUnitPaths?: string[];
}

export const useSqlViewDataReport = ({ datetime, criteria, sqlViewUid, orgUnitPaths = [] }: Params) => {
  // Ensure we have valid dates before making the query
  const startDate = datetime.startDate ? formatDateToYYYYMMDD(datetime.startDate) : formatDateToYYYYMMDD(new Date());
  const endDate = datetime.endDate ? formatDateToYYYYMMDD(datetime.endDate) : formatDateToYYYYMMDD(new Date());

  // Build filter array
  const filters = [
    `timestamp:ge:${startDate}`,
    `timestamp:le:${endDate}`
  ];

  // Add organization unit filters if applicable
  if (orgUnitPaths && orgUnitPaths.length > 0) {
    // Add organization unit path filtering logic here if needed
    // Example: filters.push(`orgUnit:in:[${orgUnitPaths.join(',')}]`);
  }

  const query = {
    sqlViewData: {
      resource: `sqlViews/${sqlViewUid}/data`,
      params: {
        paging: "false",
        criteria,
        filter: filters,
      },
    },
  };

  const { loading, error, data, refetch } = useDataQuery(query, {
    lazy: true,
    onComplete: (data: any) => {
      console.log("Query completed successfully");
    },
    onError: (error: any) => {
      console.error("Query error:", error);
    },
  });

  return { loading, error, data, refetch };
};
