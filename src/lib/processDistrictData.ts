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
    lastLogin?: string;
  };
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
}

/**
 * Process organization unit and user data into district engagement metrics
 * @param orgUnitData Processed organization unit data with { uid, name, path } structure or raw arrays
 * @param userData User data filtered by organization units
 * @returns Array of district engagement metrics
 */
export function processDistrictData(
  orgUnitData: (ProcessedOrgUnit | unknown[])[],
  userData: UserData[]
): DistrictEngagement[] {
  if (!orgUnitData?.length || !userData?.length) {
    return [];
  }

  return orgUnitData.map((orgUnit) => {
    // Type guard to check if orgUnit is a ProcessedOrgUnit
    const isProcessedOrgUnit = (unit: ProcessedOrgUnit | unknown[]): unit is ProcessedOrgUnit => {
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
      const hasOrgUnit = user.organisationUnits?.some((ou) => ou.id === orgUnitUid);
      return hasOrgUnit;
    });

    // Count active users (those with lastLogin)
    const activeUsers = orgUnitUsers.filter((user) => user.userCredentials?.lastLogin);

    // Find the most recent login date
    const lastActivityDate =
      activeUsers.length > 0
        ? new Date(
            Math.max(
              ...activeUsers
                .filter((user) => user.userCredentials?.lastLogin)
                .map((user) => new Date(user.userCredentials.lastLogin!).getTime())
            )
          )
        : null;

    // Format date as string or return placeholder
    const lastActivity = lastActivityDate ? lastActivityDate.toLocaleDateString() : "No activity";

    // Calculate access percentage
    const accessPercentage =
      orgUnitUsers.length > 0 ? Math.round((activeUsers.length / orgUnitUsers.length) * 100) : 0;

    // Determine if consistently active (more than 50% active users)
    const isConsistentlyActive = accessPercentage >= 50;

    // For this example, we're using a placeholder for dashboard views
    // In a real implementation, you would calculate this from actual dashboard analytics data
    const dashboardViews = Math.max(1, activeUsers.length * 3); // Just a placeholder calculation

    const result = {
      OrgUnitName: orgUnitName,
      totalUsers: orgUnitUsers.length,
      activeUsers: activeUsers.length,
      lastActivity,
      accessPercentage: `${accessPercentage}%`,
      isConsistentlyActive,
      dashboardViews,
    };

    return result;
  });
}
