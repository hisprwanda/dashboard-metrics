import { useDataQuery } from "@dhis2/app-runtime";

// Static query for system info to prevent recreation
const SYSTEM_INFO_QUERY = {
  title: {
    resource: "systemSettings/applicationTitle",
  },
  help: {
    resource: "systemSettings/helpPageLink",
  },
  user: {
    resource: "me",
    params: {
      fields: ["authorities", "avatar", "email", "name", "settings"],
    },
  },
  apps: {
    resource: "action::menu/getModules",
  },
  notifications: {
    resource: "me/dashboard",
  },
} as const;

export const useSystemInfo = () => {
  const { loading, error, data } = useDataQuery(SYSTEM_INFO_QUERY);
  return { loading, error, data };
};

// Static query for base URL to prevent recreation
const BASE_URL_QUERY = {
  baseUrl: {
    resource: "system/info",
  },
} as const;

export const useBaseUrl = () => {
  const { loading, error, data } = useDataQuery(BASE_URL_QUERY);

  // if (loading) {
  //     return "loading...";
  // }
  // if (error) {
  //     return "error in fetching baseurl...";
  // }

  return data?.baseUrl?.contextPath;
};
