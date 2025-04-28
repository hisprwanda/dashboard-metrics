import { subDays, isWithinInterval, startOfWeek, endOfWeek, differenceInDays } from "date-fns";

export interface DistrictEngagement {
  id: string;
  districtName: string;
  totalUsers: number;
  activeUsers: number;
  lastActivity: string;
  hasAccess: boolean;
  accessPercentage: string;
  isConsistentlyActive: boolean;
  dashboardViews: number;
}

/**
 * Processes organization units and user data to generate district engagement metrics
 * @param orgUnits Array of organization units (districts)
 * @param userData Array of users with their organization unit assignments
 * @returns Array of DistrictEngagement objects with calculated metrics
 */
export const processDistrictEngagementData = (
  orgUnits: any[],
  userData: any[]
): DistrictEngagement[] => {
  console.log("[PROCESSING] 📊 Starting district data processing");
  console.log(`[PROCESSING] 📊 Inputs: ${orgUnits?.length || 0} org units, ${userData?.length || 0} users`);

  if (!orgUnits || !userData || orgUnits.length === 0) {
    console.log("[PROCESSING] ⚠️ No data to process, returning empty array");
    return [];
  }

  // Group users by their organization units for easier processing
  const usersByOrgUnit = new Map<string, any[]>();
  console.log("[PROCESSING] 🔄 Grouping users by organization unit...");

  userData.forEach(user => {
    if (user.organisationUnits && user.organisationUnits.length > 0) {
      user.organisationUnits.forEach((orgUnit: any) => {
        if (!usersByOrgUnit.has(orgUnit.id)) {
          usersByOrgUnit.set(orgUnit.id, []);
        }
        usersByOrgUnit.get(orgUnit.id)?.push(user);
      });
    }
  });

  console.log(`[PROCESSING] ✅ Created user mappings for ${usersByOrgUnit.size} org units`);

  // Calculate metrics for each district (organization unit)
  const result = orgUnits.map(orgUnit => {
    const districtUsers = usersByOrgUnit.get(orgUnit.id) || [];
    const totalUsers = districtUsers.length;

    console.log(`[PROCESSING] 📋 Processing ${orgUnit.displayName}: ${totalUsers} users`);

    // Active users calculation (users who have logged in)
    const activeUsers = districtUsers.filter(user =>
      user.userCredentials?.lastLogin
    ).length;

    // Find the most recent login date for this district
    let lastActivity = "Never";
    let lastActivityDate: Date | null = null;
    districtUsers.forEach(user => {
      if (user.userCredentials?.lastLogin) {
        const loginDate = new Date(user.userCredentials.lastLogin);
        if (!lastActivityDate || loginDate > lastActivityDate) {
          lastActivityDate = loginDate;
          lastActivity = loginDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      }
    });

    // District Access Coverage: Has at least one user accessing the dashboard
    const hasAccess = activeUsers > 0;
    const accessPercentage = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) + "%" : "0%";

    // Consistently Active Districts: Has at least one user logging in every week over the past month
    let isConsistentlyActive = false;

    if (districtUsers.length > 0) {
      // Define the past 4 weeks
      const today = new Date();
      const pastWeeks = [
        { start: startOfWeek(subDays(today, 28)), end: endOfWeek(subDays(today, 21)) },
        { start: startOfWeek(subDays(today, 21)), end: endOfWeek(subDays(today, 14)) },
        { start: startOfWeek(subDays(today, 14)), end: endOfWeek(subDays(today, 7)) },
        { start: startOfWeek(subDays(today, 7)), end: endOfWeek(today) }
      ];

      // Check for activity in each week
      const weeklyActivity = pastWeeks.map(week => {
        return districtUsers.some(user => {
          if (user.userCredentials?.lastLogin) {
            const loginDate = new Date(user.userCredentials.lastLogin);
            return isWithinInterval(loginDate, { start: week.start, end: week.end });
          }
          return false;
        });
      });

      // District is consistently active if there's activity in all 4 weeks
      isConsistentlyActive = weeklyActivity.every(hasActivity => hasActivity);
    }

    // Dashboard views (placeholder - in a real implementation, this would come from analytics data)
    // For this example, we'll estimate based on active users
    const dashboardViews = activeUsers > 0 ? Math.round(activeUsers * (Math.random() * 10 + 5)) : 0;

    return {
      id: orgUnit.id,
      districtName: orgUnit.displayName || orgUnit.name,
      totalUsers,
      activeUsers,
      lastActivity,
      hasAccess,
      accessPercentage,
      isConsistentlyActive,
      dashboardViews
    };
  });

  console.log(`[PROCESSING] ✅ Finished processing ${result.length} districts`);

  // Sample output debugging
  if (result.length > 0) {
    console.log(`[PROCESSING] 📋 Sample processed district:`, result[0]);
  }

  return result;
};