// Types for dashboard data processing

export interface SqlViewListGrid {
  headers: Array<{
    name: string;
    column: string;
    type: string;
  }>;
  rows: Array<Array<string | number>>;
}

export interface SqlViewResponse {
  sqlViewData: {
    listGrid: SqlViewListGrid;
  };
}

export interface UserResponse {
  users: {
    users: Array<{
      id: string;
      firstName?: string;
      surname?: string;
      displayName: string;
      userCredentials?: {
        username: string;
        lastLogin?: string;
      };
      organisationUnits?: Array<{
        id: string;
        displayName: string;
        path?: string;
      }>;
    }>;
  };
}

export interface DashboardUsageRow {
  timestamp: string;
  username: string;
  favoriteuid: string;
  eventtype: string;
}
