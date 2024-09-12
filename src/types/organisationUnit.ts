export interface OrgUnit {
    id: string;
    displayName: string;
    path: string;
    level: number;
    children?: OrgUnit[];
  }
  