import { Dashboards } from "@/types/dashboardsType";
import { useDataQuery } from "@dhis2/app-runtime";

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

  const { loading, error, data,  } = useDataQuery(query);
  return { loading, error, data };
};
