export interface Dashboards {
    dashboards: Dashboard[];
}

export interface Dashboard {
    name:           string;
    created:        Date;
    lastUpdated:    Date;
    createdBy:      AtedBy;
    lastUpdatedBy:  AtedBy;
    displayName:    string;
    favorite:       boolean;
    id:             string;
    dashboardItems: DashboardItem[];
}

export interface AtedBy {
    id:          string;
    code:        null | string;
    name:        string;
    displayName: string;
    username:    string;
}

export interface DashboardItem {
    visualization?: Visualization;
}

export interface Visualization {
    displayName: string;
    id:          string;
}

export interface DashboardConverted {
    name:           string;
    created:        Date;
    lastUpdated:    Date;
    createdBy:      AtedBy;
    lastUpdatedBy:  AtedBy;
    displayName:    string;
    favorite:       boolean;
    id:             string;
    visualizations: Visualization[];
}


  
