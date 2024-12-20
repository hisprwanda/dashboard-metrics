import { DashboardConverted } from "./dashboardsType";


  
  export interface DateValueType {
    startDate: Date | null;
    endDate: Date | null;
  }
  
  export interface VisitDetails {
    username: string;
    visits: number;
    lastVisit: string;
  }
  
  export interface User {
    name: string;
    username: string;
    phoneNumber?: string;
    organisationUnits: { displayName: string; id: string }[];
    userCredentials: { userRoles: { displayName: string; id: string }[] };
    displayName: string;
    id: string;
    userGroups: { displayName: string; id: string }[];
    visits: number;
    lastVisit: string;
  }
  
  export interface LinkedUser extends User {}