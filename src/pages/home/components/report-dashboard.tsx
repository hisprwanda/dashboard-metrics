"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useDashboard } from "../../../context/DashboardContext";
import { useSystem } from "../../../context/SystemContext";
import { useDashboardData } from "../../../hooks/useDashboardData";
import { useFilteredUsers } from "../../../hooks/users";
import type { LinkedUser, VisitDetails } from "../../../types/dashboard-reportType";
import type { UserResponse } from "../../../types/dashboard-data";

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

  // Memoize dashboard query parameters to prevent query recreation
  const dashboardQueryParams = useMemo(
    () => ({
      datetime: stableDateRange,
      dashboardId: row?.id,
      sqlViewUid: sqlViewUid || "",
      orgUnitPaths: stableOrgUnitPaths,
    }),
    [stableDateRange, row?.id, sqlViewUid, stableOrgUnitPaths]
  );

  // Dashboard data query
  const {
    loading: dashboardLoading,
    error: dashboardError,
    data: dashboardData,
    refetch: refetchDashboard,
    isReady,
  } = useDashboardData(dashboardQueryParams);

  // User data query with the extracted usernames - memoize parameters
  // Note: We don't filter by orgUnitPaths at API level because we want to get all users first,
  // then filter them client-side to properly calculate dashboard stats
  const userQueryParams = useMemo(
    () => [uniqueUsernames, [], [], []], // usernames, orgUnitPaths, orgUnitIds, userGroups
    [uniqueUsernames]
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
    if (
      stableDateRange?.startDate &&
      stableDateRange?.endDate &&
      row?.id &&
      sqlViewUid &&
      isReady
    ) {
      console.log("Refetching dashboard data for:", row.displayName, "with params:", {
        dateRange: stableDateRange,
        dashboardId: row.id,
        orgUnitPaths: stableOrgUnitPaths,
        sqlViewUid,
      });
      refetchDashboard();

      // Reset processing flags when inputs change
      dashboardDataProcessed.current = false;
      topUsersUpdated.current = false;
    }
  }, [stableDateRange, row?.id, sqlViewUid, stableOrgUnitPaths, refetchDashboard, isReady]);

  // Process dashboard data and extract usernames
  useEffect(() => {
    // Check if data is available and hasn't been processed yet
    if (
      !dashboardLoading &&
      dashboardData?.sqlViewData?.listGrid?.rows &&
      isReady &&
      !dashboardDataProcessed.current
    ) {
      const { rows } = dashboardData.sqlViewData.listGrid;

      console.log(
        "Processing dashboard data for dashboard:",
        row?.displayName,
        "rows:",
        rows.length
      );

      // Extract unique usernames from dashboard data (username is at index 1)
      const usernames = [...new Set(rows.map((row: Array<string | number>) => row[1] as string))];

      // Set the unique usernames state
      setUniqueUsernames(usernames);

      // Calculate visit details
      const userVisits: { [key: string]: { count: number; lastVisit: string } } = {};

      rows.forEach((row: Array<string | number>) => {
        const timestamp = row[0] as string; // Timestamp is at index 0
        const username = row[1] as string; // Username is at index 1

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
      console.log("Refetching user data for usernames:", uniqueUsernames.length);
      // Explicitly refetch with the current hook configuration
      refetchUsers();
    }
  }, [uniqueUsernames, refetchUsers]);

  // Log user data query results
  useEffect(() => {
    if (userError) {
      console.error("User data error:", userError);
    }
  }, [userLoading, userError, userData]);

  // Link user details once user data is loaded
  useEffect(() => {
    // Only process if we have user data and visit details
    // We need to recalculate when org units change, so we can't use the topUsersUpdated flag
    const typedUserData = userData as unknown as UserResponse | undefined;
    if (!userLoading && typedUserData?.users?.users && visitDetails.length > 0) {
      const { users } = typedUserData.users;

      console.log("Linking user details. Total users from API:", users.length);
      console.log("Total visit details:", visitDetails.length);
      console.log("Organization unit paths selected:", stableOrgUnitPaths);

      // If org units are selected, filter visit details to only include users in those org units
      let filteredVisitDetails = visitDetails;

      if (stableOrgUnitPaths.length > 0) {
        console.log("Filtering by organization unit paths:", stableOrgUnitPaths);

        const usersInSelectedOrgUnits = users
          .filter((user: any) => {
            const userOrgUnits = user.organisationUnits || [];
            console.log(
              `User ${user.userCredentials?.username} has org units:`,
              userOrgUnits.map((ou: any) => ou.displayName)
            );

            // Check if user belongs to any of the selected org units
            // Since we may not have path info, we'll match by org unit ID or check if paths contain the org unit
            return userOrgUnits.some((orgUnit: any) => {
              // Check if the org unit ID is in the selected paths
              const matchById = stableOrgUnitPaths.some((path) => path.includes(orgUnit.id));
              // Also check direct ID match (in case paths are actually IDs)
              const directMatch = stableOrgUnitPaths.includes(orgUnit.id);

              return matchById || directMatch;
            });
          })
          .map((user: any) => user.userCredentials?.username)
          .filter(Boolean);

        console.log("Users in selected org units:", usersInSelectedOrgUnits);

        filteredVisitDetails = visitDetails.filter((visit) =>
          usersInSelectedOrgUnits.includes(visit.username)
        );

        console.log(
          "Filtered visit details:",
          filteredVisitDetails.length,
          "out of",
          visitDetails.length
        );
      }

      // Map visit details to user information
      const linkedUsersData = filteredVisitDetails.map((visit): LinkedUser => {
        const user = users.find((u: any) => u.userCredentials?.username === visit.username);

        if (user) {
          return {
            ...user,
            name:
              user.displayName || `${user.firstName || ""} ${user.surname || ""}`.trim() || user.id,
            username: user.userCredentials?.username || visit.username,
            firstName: user.firstName || "",
            surname: user.surname || "",
            visits: visit.visits,
            lastVisit: visit.lastVisit,
            userCredentials: {
              userRoles: (user.userCredentials as any)?.userRoles || [],
            },
            organisationUnits: (user.organisationUnits || []).map((ou: any) => ({
              displayName: ou.displayName || ou.name || "",
              id: ou.id || "",
            })),
            userGroups: [],
          };
        }

        // Fallback for users not found
        return {
          name: visit.username,
          displayName: visit.username,
          firstName: "",
          surname: "",
          username: visit.username,
          id: visit.username,
          organisationUnits: [],
          userCredentials: { userRoles: [] },
          userGroups: [],
          visits: visit.visits,
          lastVisit: visit.lastVisit,
        };
      });

      // Recalculate stats based on filtered data
      const filteredTotalVisits = filteredVisitDetails.reduce(
        (sum, visit) => sum + visit.visits,
        0
      );
      const filteredTopUsers = [...filteredVisitDetails]
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

      // Create a new top users array with user details
      const updatedTopUsers = filteredTopUsers.map((visit) => {
        const userDetails = linkedUsersData.find((u) => u.username === visit.username);
        return {
          username: visit.username,
          visits: visit.visits,
          firstName: userDetails?.firstName || "",
          surname: userDetails?.surname || "",
        };
      });

      // Update states in a single batch
      setLinkedUsers(linkedUsersData);

      // Update dashboard stats with filtered data
      setDashboardStats((prev) => ({
        ...prev,
        totalVisits: filteredTotalVisits,
        topUsers: updatedTopUsers,
      }));

      // Don't set topUsersUpdated flag since we want to recalculate when org units change
    }
  }, [userLoading, userData, visitDetails, stableOrgUnitPaths]);

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
