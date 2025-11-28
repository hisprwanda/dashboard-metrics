export interface UserOrganisationUnit {
  id: string;
  displayName: string;
  name: string;
  level: number | string;
  path?: string;
}

export interface UserRole {
  id: string;
  displayName: string;
}

export interface UserGroup {
  id: string;
  displayName: string;
}

export interface UserCredentials {
  username: string;
  lastLogin?: string;
  disabled: boolean;
  userRoles: UserRole[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  surname: string;
  firstName: string;
  displayName: string;
  phoneNumber?: string;
  jobTitle?: string;
  organisationUnits?: UserOrganisationUnit[];
  userCredentials?: UserCredentials;
  userGroups?: UserGroup[];
}

export interface UsersQueryResponse {
  users: {
    users: User[];
  };
}
