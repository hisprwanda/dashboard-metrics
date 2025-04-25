"use client";

import { useEffect, useState, useRef } from "react";
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

  // Add a ref to track if dashboard data was processed
  const dashboardDataProcessed = useRef(false);

  const favoriteuid = row?.id;
  const criteria = favoriteuid ? `favoriteuid%${encodeURIComponent(favoriteuid)}` : '';

  console.log("DashboardReport - Initial render with:", {
    rowId: row?.id,
    dateRange: value,
    orgUnitPaths,
    uniqueUsernames
  });

  // Dashboard data query
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

  // User data query with the extracted usernames
  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUsers
  } = useFilteredUsers(uniqueUsernames, orgUnitPaths);

  // Log dashboard query results
  useEffect(() => {
    console.log("Dashboard data query state:", {
      loading: dashboardLoading,
      hasError: !!dashboardError,
      hasData: !!dashboardData,
      dataStructure: dashboardData ? Object.keys(dashboardData) : []
    });

    if (dashboardError) {
      console.error("Dashboard data error:", dashboardError);
    }
  }, [dashboardLoading, dashboardError, dashboardData]);

  // Initial report fetch
  useEffect(() => {
    if (value?.startDate && value?.endDate && row?.id && sqlViewUid) {
      console.log("Fetching dashboard data with:", {
        criteria,
        dateRange: value,
        orgUnitPaths
      });

      refetchDashboard({
        criteria,
        datetime: value,
        orgUnitPaths: orgUnitPaths
      });
    }
  }, [value, row, sqlViewUid, orgUnitPaths, refetchDashboard, criteria]);

  // Process dashboard data and extract usernames
  useEffect(() => {
    // Check if data is available in the correct structure
    if (!dashboardLoading && dashboardData?.sqlViewData?.listGrid?.rows && !dashboardDataProcessed.current) {
      console.log("Processing dashboard data rows:", dashboardData.sqlViewData.listGrid.rows.length);

      const rows = dashboardData.sqlViewData.listGrid.rows;

      // Extract unique usernames from dashboard data (username is at index 1)
      const usernames = [...new Set(rows.map((row: any[]) => row[1]))];
      console.log("Extracted unique usernames:", usernames);

      // Set the unique usernames state
      setUniqueUsernames(usernames);

      // Calculate visit details
      const userVisits: { [key: string]: { count: number; lastVisit: string; }; } = {};

      rows.forEach((row: any[]) => {
        const timestamp = row[0]; // Timestamp is at index 0
        const username = row[1];  // Username is at index 1

        if (!userVisits[username]) {
          userVisits[username] = { count: 0, lastVisit: timestamp };
        }

        userVisits[username].count += 1;

        // Update last visit if more recent
        if (new Date(timestamp) > new Date(userVisits[username].lastVisit)) {
          userVisits[username].lastVisit = timestamp;
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
      const totalVisits = rows.length;

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

      // Mark as processed to avoid duplicate processing
      dashboardDataProcessed.current = true;
    }
  }, [dashboardLoading, dashboardData]);

  // Effect to manually trigger users refetch when usernames change
  useEffect(() => {
    if (uniqueUsernames.length > 0) {
      console.log("Triggering users API call with usernames:", uniqueUsernames);

      // Explicitly refetch with the new usernames
      refetchUsers({
        usernames: uniqueUsernames,
        orgUnitPaths: orgUnitPaths
      });
    }
  }, [uniqueUsernames, orgUnitPaths, refetchUsers]);

  // Log user data query results
  useEffect(() => {
    console.log("User data query state:", {
      loading: userLoading,
      hasError: !!userError,
      hasData: !!userData,
      userCount: userData?.users?.users?.length || 0
    });

    if (userError) {
      console.error("User data error:", userError);
    }
  }, [userLoading, userError, userData]);

  // Link user details once user data is loaded
  useEffect(() => {
    if (!userLoading && userData?.users?.users && visitDetails.length > 0) {
      console.log("Linking user details with visit data");
      const users = userData.users.users;

      console.log("Available users to link:", users.length);

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

  // Reset processed flag when row or value changes
  useEffect(() => {
    dashboardDataProcessed.current = false;
  }, [row, value, orgUnitPaths]);

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