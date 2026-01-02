// src/lib/processDistrictData.ts

/**
 * Interface for processed organization unit data
 */
export interface ProcessedOrgUnit {
  uid: string;
  name: string;
  path: string;
}

/**
 * Interface for user data from DHIS2 API
 */
export interface UserData {
  id: string;
  name: string;
  organisationUnits?: Array<{ id: string; name: string }>;
  userCredentials?: {
    username?: string;
    lastLogin?: string;
  };
}

/**
 * Interface for dashboard analytics data
 */
export interface DashboardAnalytics {
  userAccessCounts: Record<string, number>;
  userLastAccess: Record<string, string>;
}

/**
 * Interface representing district engagement metrics
 */
export interface DistrictEngagement {
  OrgUnitName: string;
  totalUsers: number;
  activeUsers: number;
  lastActivity: string;
  accessPercentage: string;
  isConsistentlyActive: boolean;
  dashboardViews: number;
  dashboardAccessRate: string;
}

/**
 * Process organization unit and user data into district engagement metrics
 * @param orgUnitData Processed organization unit data with { uid, name, path } structure or raw arrays
 * @param userData User data filtered by organization units
 * @param dashboardAnalytics Optional dashboard analytics data with user access counts
 * @returns Array of district engagement metrics
 */
export function processDistrictData(
  orgUnitData: (ProcessedOrgUnit | unknown[])[],
  userData: UserData[],
  dashboardAnalytics?: DashboardAnalytics
): DistrictEngagement[] {
  if (!orgUnitData?.length || !userData?.length) {
    return [];
  }

  return orgUnitData.map((orgUnit) => {
    // Type guard to check if orgUnit is a ProcessedOrgUnit
    const isProcessedOrgUnit = (
      unit: ProcessedOrgUnit | unknown[]
    ): unit is ProcessedOrgUnit => {
      return (
        typeof unit === "object" &&
        unit !== null &&
        "uid" in unit &&
        "name" in unit &&
        "path" in unit
      );
    };

    // Handle both processed objects { uid, name, path } and raw arrays
    let orgUnitUid: string;
    let orgUnitName: string;
    let orgUnitPath: string;

    if (isProcessedOrgUnit(orgUnit)) {
      // New format: processed objects
      orgUnitUid = orgUnit.uid;
      orgUnitName = orgUnit.name;
      orgUnitPath = orgUnit.path;
    } else {
      // Legacy format: raw arrays [name, uid, ?, ?, path, level]
      const unitArray = orgUnit as unknown[];
      orgUnitUid = String(unitArray[1] || "");
      orgUnitName = String(unitArray[0] || "");
      orgUnitPath = String(unitArray[4] || "");
    }

    // Find users belonging to this organization unit by checking if the org unit UID is in user's organisation units
    // This correctly handles users assigned to multiple organization units
    const orgUnitUsers = userData.filter((user) => {
      const hasOrgUnit = user.organisationUnits?.some(
        (ou) => ou.id === orgUnitUid
      );
      return hasOrgUnit;
    });

    // Count active users (those with lastLogin)
    const activeUsers = orgUnitUsers.filter(
      (user) => user.userCredentials?.lastLogin
    );

    // Find the most recent login date
    const lastActivityDate =
      activeUsers.length > 0
        ? new Date(
            Math.max(
              ...activeUsers
                .filter((user) => user.userCredentials?.lastLogin)
                .map((user) =>
                  new Date(user.userCredentials.lastLogin!).getTime()
                )
            )
          )
        : null;

    // Format date as string or return placeholder
    const lastActivity = lastActivityDate
      ? lastActivityDate.toLocaleDateString()
      : "No activity";

    // Calculate access percentage
    const accessPercentage =
      orgUnitUsers.length > 0
        ? Math.round((activeUsers.length / orgUnitUsers.length) * 100)
        : 0;

    // Determine if consistently active (more than 50% active users)
    const isConsistentlyActive = accessPercentage >= 50;

    // Calculate dashboard views and access rate from analytics data
    let dashboardViews = 0;
    let usersWithDashboardAccess = 0;

    if (dashboardAnalytics) {
      orgUnitUsers.forEach((user) => {
        const username = user.userCredentials?.username;
        if (username && dashboardAnalytics.userAccessCounts[username]) {
          dashboardViews += dashboardAnalytics.userAccessCounts[username];
          usersWithDashboardAccess++;
        }
      });
    }

    const dashboardAccessRate =
      orgUnitUsers.length > 0
        ? `${Math.round((usersWithDashboardAccess / orgUnitUsers.length) * 100)}%`
        : "0%";

    const result = {
      OrgUnitName: orgUnitName,
      totalUsers: orgUnitUsers.length,
      activeUsers: activeUsers.length,
      lastActivity,
      accessPercentage: `${accessPercentage}%`,
      isConsistentlyActive,
      dashboardViews,
      dashboardAccessRate,
    };

    return result;
  });
}
