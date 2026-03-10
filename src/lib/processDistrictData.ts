// src/lib/processDistrictData.ts
import { subDays } from "date-fns";

import type { OrganisationUnit } from "../hooks/organisationUnits";
import type { DistrictUser } from "../hooks/users";

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
  uid: string;
  OrgUnitName: string;
  totalUsers: number;
  activeUsers: number;
  neverLoggedIn: number;
  lastActivity: string;
  accessPercentage: string;
  isConsistentlyActive: boolean;
  dashboardViews: number;
  dashboardViewers: number;
  dashboardAccessRate: string;
  usernames: string[];
}

/**
 * Aggregate users by organisation unit
 * @param users Array of users with their org unit assignments
 * @param orgUnitsAtLevel Array of org units at the selected level
 * @returns Array of district engagement metrics
 */
export function aggregateByOrgUnit(
  users: DistrictUser[],
  orgUnitsAtLevel: OrganisationUnit[]
): DistrictEngagement[] {
  const levelOrgUnitIds = new Set(orgUnitsAtLevel.map((ou) => ou.id));
  const orgUnitMap = new Map<string, DistrictEngagement>();
  const thirtyDaysAgo = subDays(new Date(), 30);

  // Initialize all org units at level (even those with 0 users)
  orgUnitsAtLevel.forEach((ou) => {
    orgUnitMap.set(ou.id, {
      uid: ou.id,
      OrgUnitName: ou.displayName || ou.name,
      totalUsers: 0,
      activeUsers: 0,
      neverLoggedIn: 0,
      lastActivity: "No activity",
      accessPercentage: "0%",
      isConsistentlyActive: false,
      dashboardViews: 0,
      dashboardViewers: 0,
      dashboardAccessRate: "0%",
      usernames: [],
    });
  });

  // Track last activity date per org unit
  const lastActivityDates = new Map<string, Date>();

  users.forEach((user) => {
    const lastLoginStr = user.userCredentials?.lastLogin;
    const lastLogin = lastLoginStr ? new Date(lastLoginStr) : null;
    const username = user.userCredentials?.username || user.username || "";

    user.organisationUnits
      ?.filter((ou) => levelOrgUnitIds.has(ou.id))
      .forEach((ou) => {
        const existing = orgUnitMap.get(ou.id);
        if (!existing) return;

        existing.totalUsers++;
        if (username) {
          existing.usernames.push(username);
        }

        if (!lastLogin) {
          existing.neverLoggedIn++;
        } else {
          if (lastLogin >= thirtyDaysAgo) {
            existing.activeUsers++;
          }

          const currentLastActivity = lastActivityDates.get(ou.id);
          if (!currentLastActivity || lastLogin > currentLastActivity) {
            lastActivityDates.set(ou.id, lastLogin);
          }
        }
      });
  });

  // Calculate percentages and format last activity
  orgUnitMap.forEach((metrics, ouId) => {
    const lastActivityDate = lastActivityDates.get(ouId);
    if (lastActivityDate) {
      metrics.lastActivity = lastActivityDate.toLocaleDateString();
    }

    if (metrics.totalUsers > 0) {
      const percentage = Math.round(
        (metrics.activeUsers / metrics.totalUsers) * 100
      );
      metrics.accessPercentage = `${percentage}%`;
      metrics.isConsistentlyActive = percentage >= 50;
    }
  });

  return Array.from(orgUnitMap.values());
}

/**
 * Enrich district data with dashboard analytics
 * @param districts Array of district engagement metrics
 * @param analytics Dashboard analytics data
 * @returns Enriched district engagement metrics
 */
export function enrichWithDashboardData(
  districts: DistrictEngagement[],
  analytics: DashboardAnalytics | undefined
): DistrictEngagement[] {
  if (!analytics) return districts;

  return districts.map((d) => {
    const viewers = d.usernames.filter(
      (u) => analytics.userAccessCounts[u] > 0
    );
    const dashboardViews = viewers.reduce(
      (sum, u) => sum + (analytics.userAccessCounts[u] || 0),
      0
    );

    return {
      ...d,
      dashboardViewers: viewers.length,
      dashboardViews,
      dashboardAccessRate:
        d.totalUsers > 0
          ? `${Math.round((viewers.length / d.totalUsers) * 100)}%`
          : "0%",
    };
  });
}
