// file location: src/pages/home/components/report-dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useSqlViewDataReport } from "../../../hooks/dashboards";
import { useFilteredUsers } from "../../../hooks/users";
import type { LinkedUser, VisitDetails } from "../../../types/dashboard-reportType";
import DashboardUserDetails from "./dashboard-user-details";
import { useSystem } from "../../../context/SystemContext";
import { useDashboard } from "../../../context/DashboardContext";

export default function DashboardReport() {
  const { state } = useDashboard();
  const { row, value, orgUnitPaths } = state;
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [visitDetails, setVisitDetails] = useState<VisitDetails[]>([]);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalVisits: 0,
    topUsers: [] as { username: string; visits: number; firstName?: string; surname?: string; }[],
    topDay: { date: null as Date | null, count: 0 },
    topWeek: { startDate: null as Date | null, endDate: null as Date | null, count: 0 },
    topMonth: { month: "", year: "", count: 0 },
  });
  const { sqlViewUid } = useSystem();

  const favoriteuid = row?.id;
  const criteria = favoriteuid ? `favoriteuid%${encodeURIComponent(favoriteuid)}` : '';

  // User data query with optional orgUnitPaths
  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useFilteredUsers(uniqueUsernames);

  const {
    loading: dashboardLoading,
    error: dashboardError,
    data: dashboardData,
    refetch: refetchDashboard,
  } = useSqlViewDataReport({
    datetime: value,
    criteria,
    sqlViewUid: sqlViewUid || "",
    orgUnitPaths: orgUnitPaths
  });

  // Initial report fetch
  useEffect(() => {
    if (value?.startDate && value?.endDate && row?.id && sqlViewUid) {
      refetchDashboard({
        criteria,
        datetime: value,
        orgUnitPaths: orgUnitPaths
      });
    }
  }, [value, row, sqlViewUid, orgUnitPaths, refetchDashboard, criteria]);

  // Process dashboard data
  useEffect(() => {
    if (!dashboardLoading && dashboardData?.rows) {
      // Extract unique usernames from dashboard data
      const usernames = [...new Set(dashboardData.rows.map((row: any[]) => row[2]))];
      setUniqueUsernames(usernames as string[]);

      // Calculate visit details
      const userVisits: { [key: string]: { count: number; lastVisit: string; }; } = {};

      dashboardData.rows.forEach((row: any[]) => {
        const username = row[2];
        const visitTime = row[0];

        if (!userVisits[username]) {
          userVisits[username] = { count: 0, lastVisit: visitTime };
        }

        userVisits[username].count += 1;

        // Update last visit if more recent
        if (new Date(visitTime) > new Date(userVisits[username].lastVisit)) {
          userVisits[username].lastVisit = visitTime;
        }
      });

      // Convert to array for easier rendering
      const visitDetailsArray: VisitDetails[] = Object.entries(userVisits).map(([username, data]) => ({
        username,
        visits: data.count,
        lastVisit: data.lastVisit
      }));

      setVisitDetails(visitDetailsArray);

      // Calculate total visits
      const totalVisits = dashboardData.rows.length;

      // Find top users
      const topUsers = [...visitDetailsArray]
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

      // Set dashboard statistics
      setDashboardStats(prev => ({
        ...prev,
        totalVisits,
        topUsers: topUsers.map(user => ({
          username: user.username,
          visits: user.visits
        }))
      }));
    }
  }, [dashboardLoading, dashboardData]);

  // Link user details once user data is loaded
  useEffect(() => {
    if (!userLoading && userData?.users?.users && visitDetails.length > 0) {
      const users = userData.users.users;

      // Map visit details to user information
      const linkedUsersData = visitDetails.map(visit => {
        const user = users.find((u: any) => u.userCredentials?.username === visit.username);

        if (user) {
          return {
            ...user,
            visits: visit.visits,
            lastVisit: visit.lastVisit
          };
        }

        // Fallback for users not found
        return {
          name: visit.username,
          displayName: visit.username,
          firstName: '',
          surname: '',
          username: visit.username,
          id: '',
          organisationUnits: [],
          userCredentials: { userRoles: [] },
          userGroups: [],
          visits: visit.visits,
          lastVisit: visit.lastVisit
        };
      });

      setLinkedUsers(linkedUsersData);

      // Update top users with names
      const updatedTopUsers = dashboardStats.topUsers.map(topUser => {
        const userDetails = linkedUsersData.find(u => u.username === topUser.username);
        return {
          ...topUser,
          firstName: userDetails?.firstName || '',
          surname: userDetails?.surname || ''
        };
      });

      setDashboardStats(prev => ({
        ...prev,
        topUsers: updatedTopUsers
      }));
    }
  }, [userLoading, userData, visitDetails, dashboardStats.topUsers]);

  if (!row || !value) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        No dashboard selected or date range specified.
      </div>
    );
  }

  return (
    <DashboardUserDetails
      linkedUsers={linkedUsers}
      row={row}
      value={value}
      loading={dashboardLoading || userLoading}
      hasOrgUnitFilter={orgUnitPaths.length > 0}
      dashboardStats={dashboardStats}
    />
  );
}