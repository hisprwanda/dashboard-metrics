"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useDashboard } from "../../../context/DashboardContext";
import { useSystem } from "../../../context/SystemContext";
import { useSqlViewDataReport } from "../../../hooks/dashboards";
import { useFilteredUsers } from "../../../hooks/users";
import type { LinkedUser, VisitDetails } from "../../../types/dashboard-reportType";

import DashboardUserDetails from "./dashboard-user-details";

export default function DashboardReport() {
  const { state } = useDashboard();
  const { row, value, orgUnitPaths } = state;

  // Memoize orgUnitPaths to prevent array recreation on every render
  const stableOrgUnitPaths = useMemo(() => orgUnitPaths, [orgUnitPaths]);

  // Memoize value (date range) to prevent object recreation on every render
  const stableDateRange = useMemo(() => value, [value]);

  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [visitDetails, setVisitDetails] = useState<VisitDetails[]>([]);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalVisits: 0,
    topUsers: [] as { username: string; visits: number; firstName?: string; surname?: string }[],
    topDay: { date: null as Date | null, count: 0 },
    topWeek: { startDate: null as Date | null, endDate: null as Date | null, count: 0 },
    topMonth: { month: "", year: "", count: 0 },
  });
  const { sqlViewUid } = useSystem();

  // Add a ref to track if dashboard data was processed
  const dashboardDataProcessed = useRef(false);
  // Add a ref to track if top users have been updated
  const topUsersUpdated = useRef(false);

  // Memoize criteria to prevent recreating the query on every render
  const criteria = useMemo(() => {
    const favoriteuid = row?.id;
    return favoriteuid ? `favoriteuid%${encodeURIComponent(favoriteuid)}` : "";
  }, [row?.id]);

  // Memoize dashboard query parameters to prevent query recreation
  const dashboardQueryParams = useMemo(
    () => ({
      datetime: stableDateRange,
      criteria,
      sqlViewUid: sqlViewUid || "",
      orgUnitPaths: stableOrgUnitPaths,
    }),
    [stableDateRange, criteria, sqlViewUid, stableOrgUnitPaths]
  );

  // Dashboard data query
  const {
    loading: dashboardLoading,
    error: dashboardError,
    data: dashboardData,
    refetch: refetchDashboard,
  } = useSqlViewDataReport(dashboardQueryParams);

  // User data query with the extracted usernames - memoize parameters
  const userQueryParams = useMemo(
    () => [uniqueUsernames, stableOrgUnitPaths],
    [uniqueUsernames, stableOrgUnitPaths]
  );

  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUsers,
  } = useFilteredUsers(...userQueryParams);

  // Log dashboard query results
  useEffect(() => {
    if (dashboardError) {
      console.error("Dashboard data error:", dashboardError);
    }
  }, [dashboardLoading, dashboardError, dashboardData]);

  // Initial report fetch
  useEffect(() => {
    if (stableDateRange?.startDate && stableDateRange?.endDate && row?.id && sqlViewUid) {
      refetchDashboard();

      // Reset processing flags when inputs change
      dashboardDataProcessed.current = false;
      topUsersUpdated.current = false;
    }
  }, [stableDateRange, row?.id, sqlViewUid, stableOrgUnitPaths, refetchDashboard]);

  // Process dashboard data and extract usernames
  useEffect(() => {
    // Check if data is available in the correct structure and hasn't been processed yet
    if (
      !dashboardLoading &&
      dashboardData?.sqlViewData?.listGrid?.rows &&
      !dashboardDataProcessed.current
    ) {
      const { rows } = dashboardData.sqlViewData.listGrid;

      // Extract unique usernames from dashboard data (username is at index 1)
      const usernames = [...new Set(rows.map((row: any[]) => row[1] as string))];

      // Set the unique usernames state
      setUniqueUsernames(usernames as string[]);

      // Calculate visit details
      const userVisits: { [key: string]: { count: number; lastVisit: string } } = {};

      rows.forEach((row: any[]) => {
        const timestamp = row[0]; // Timestamp is at index 0
        const username = row[1]; // Username is at index 1

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
      const visitDetailsArray: VisitDetails[] = Object.entries(userVisits).map(
        ([username, data]) => ({
          username,
          visits: data.count,
          lastVisit: data.lastVisit,
        })
      );

      // Calculate total visits
      const totalVisits = rows.length;

      // Find top users
      const topUsers = [...visitDetailsArray].sort((a, b) => b.visits - a.visits).slice(0, 5);

      // Update states in a single batch to avoid cascading updates
      setVisitDetails(visitDetailsArray);
      setDashboardStats((prev) => ({
        ...prev,
        totalVisits,
        topUsers: topUsers.map((user) => ({
          username: user.username,
          visits: user.visits,
        })),
      }));

      // Mark as processed to avoid duplicate processing
      dashboardDataProcessed.current = true;
    }
  }, [dashboardLoading, dashboardData]);

  // Effect to manually trigger users refetch when usernames change
  useEffect(() => {
    if (uniqueUsernames.length > 0) {
      // Explicitly refetch with the current hook configuration
      refetchUsers();
    }
  }, [uniqueUsernames, stableOrgUnitPaths, refetchUsers]);

  // Log user data query results
  useEffect(() => {
    if (userError) {
      console.error("User data error:", userError);
    }
  }, [userLoading, userError, userData]);

  // Link user details once user data is loaded
  useEffect(() => {
    // Only process if we have user data, visit details, and haven't updated top users yet
    if (
      !userLoading &&
      userData?.users?.users &&
      visitDetails.length > 0 &&
      !topUsersUpdated.current
    ) {
      const { users } = userData.users;

      // Map visit details to user information
      const linkedUsersData = visitDetails.map((visit) => {
        const user = users.find((u: any) => u.userCredentials?.username === visit.username);

        if (user) {
          return {
            ...user,
            visits: visit.visits,
            lastVisit: visit.lastVisit,
          };
        }

        // Fallback for users not found
        return {
          name: visit.username,
          displayName: visit.username,
          firstName: "",
          surname: "",
          username: visit.username,
          id: "",
          organisationUnits: [],
          userCredentials: { userRoles: [] },
          userGroups: [],
          visits: visit.visits,
          lastVisit: visit.lastVisit,
        };
      });

      // Create a new top users array with user details
      const updatedTopUsers = dashboardStats.topUsers.map((topUser) => {
        const userDetails = linkedUsersData.find((u) => u.username === topUser.username);
        return {
          ...topUser,
          firstName: userDetails?.firstName || "",
          surname: userDetails?.surname || "",
        };
      });

      // Update states in a single batch
      setLinkedUsers(linkedUsersData);

      // Only update dashboardStats if the top users have changed
      if (JSON.stringify(updatedTopUsers) !== JSON.stringify(dashboardStats.topUsers)) {
        setDashboardStats((prev) => ({
          ...prev,
          topUsers: updatedTopUsers,
        }));
      }

      // Mark as updated to prevent infinite loop
      topUsersUpdated.current = true;
    }
  }, [userLoading, userData, visitDetails, dashboardStats.topUsers]);

  // Reset processed flags when inputs change
  useEffect(
    () => () => {
      // Cleanup function to reset flags when component unmounts
      dashboardDataProcessed.current = false;
      topUsersUpdated.current = false;
    },
    []
  );

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
