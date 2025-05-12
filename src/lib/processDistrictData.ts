// src/lib/processDistrictData.ts
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
 * Process raw data from DHIS2 into district engagement metrics
 * @param orgUnitData Organization unit data from SQL view
 * @param userData User data filtered by organization units
 * @returns Array of district engagement metrics
 */
export function processDistrictData(orgUnitData: any[], userData: any[]): DistrictEngagement[] {
  if (!orgUnitData?.length || !userData?.length) {
    return [];
  }

  return orgUnitData.map(orgUnitRow => {
    // Based on the data format received from SQL view
    const orgUnitPath = orgUnitRow[1]; // Path is at index 1
    const orgUnitName = orgUnitRow[2]; // Name is at index 0

    // Find users belonging to this organization unit
    const orgUnitUsers = userData.filter(
      (user: any) => user.organisationUnits?.some(
        (ou: any) => orgUnitPath.includes(ou.id)
      )
    );

    // Count active users (those with lastLogin)
    const activeUsers = orgUnitUsers.filter(
      (user: any) => user.userCredentials?.lastLogin
    );

    // Find the most recent login date
    const lastActivityDate = activeUsers.length > 0
      ? new Date(Math.max(...activeUsers
        .filter((user: any) => user.userCredentials?.lastLogin)
        .map((user: any) => new Date(user.userCredentials.lastLogin).getTime())
      ))
      : null;

    // Format date as string or return placeholder
    const lastActivity = lastActivityDate
      ? lastActivityDate.toLocaleDateString()
      : "No activity";

    // Calculate access percentage
    const accessPercentage = orgUnitUsers.length > 0
      ? Math.round((activeUsers.length / orgUnitUsers.length) * 100)
      : 0;

    // Determine if consistently active (more than 50% active users)
    const isConsistentlyActive = accessPercentage >= 50;

    // For this example, we're using a placeholder for dashboard views
    // In a real implementation, you would calculate this from actual dashboard analytics data
    const dashboardViews = Math.max(1, activeUsers.length * 3); // Just a placeholder calculation

    return {
      OrgUnitName: orgUnitName,
      totalUsers: orgUnitUsers.length,
      activeUsers: activeUsers.length,
      lastActivity,
      accessPercentage: `${accessPercentage}%`,
      isConsistentlyActive,
      dashboardViews,
    };
  });
}