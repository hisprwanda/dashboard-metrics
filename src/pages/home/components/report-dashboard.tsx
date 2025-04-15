"use client";

import { useEffect, useState, useRef } from "react";
import { useSqlViewDataReport } from "../../../hooks/dashboards";
import { useFilteredUsers } from "../../../hooks/users";
import type { DateValueType, LinkedUser, VisitDetails } from "@/types/dashboard-reportType";
import DashboardUserDetails from "./dashboard-user-details";
import type { DashboardConverted } from "@/types/dashboardsType";
import { useSystem } from "./../../../context/SystemContext";

export interface DashboardReportProps {
  row: DashboardConverted;
  value: DateValueType;
  selectedOrgUnitPaths: string[];
}

export default function DashboardReport({ row, value, selectedOrgUnitPaths = [] }: DashboardReportProps) {
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

  // Use refs to prevent infinite loops
  const prevValueRef = useRef<DateValueType | null>(null);
  const prevPathsRef = useRef<string[] | null>(null);

  const favoriteuid = row.id;
  const criteria = `favoriteuid%${encodeURIComponent(favoriteuid)}`;

  const {
    loading: dashboardLoading,
    error: dashboardError,
    data: dashboardData,
    refetch: refetchDashboard,
  } = useSqlViewDataReport({
    datetime: value,
    criteria,
    sqlViewUid: sqlViewUid || "",
  });

  // Force refetch when date range changes, but prevent infinite loops
  useEffect(() => {
    // Only refetch if the dates have actually changed
    const datesChanged =
      !prevValueRef.current ||
      prevValueRef.current.startDate?.getTime() !== value.startDate?.getTime() ||
      prevValueRef.current.endDate?.getTime() !== value.endDate?.getTime();

    if (value?.startDate && value?.endDate && datesChanged) {
      refetchDashboard({ criteria, datetime: value });
      // Update the ref to current value
      prevValueRef.current = { ...value };
    }
  }, [value, refetchDashboard, criteria]);

  // Extract unique usernames from dashboard data
  useEffect(() => {
    if (!dashboardData?.sqlViewData?.listGrid?.headers || !dashboardData?.sqlViewData?.listGrid?.rows) {
      return;
    }

    const usernameColumnIndex = dashboardData.sqlViewData.listGrid.headers.findIndex(
      (header: { column: string; }) => header.column === "username",
    );

    if (usernameColumnIndex !== undefined && usernameColumnIndex >= 0) {
      const uniqueUsernamesArray = Array.from(
        new Set<string>(dashboardData.sqlViewData.listGrid.rows.map((row: any[]) => row[usernameColumnIndex])),
      ).filter(Boolean);

      setUniqueUsernames(uniqueUsernamesArray);
    }
  }, [dashboardData]);

  const {
    data: filteredUserData,
    loading: userLoading,
    error: userError,
    refetch: refetchUsers,
  } = useFilteredUsers(uniqueUsernames, selectedOrgUnitPaths);

  // Fetch user details when usernames change
  useEffect(() => {
    // Only refetch if the usernames or paths have actually changed
    const pathsChanged = !prevPathsRef.current || prevPathsRef.current.join(",") !== selectedOrgUnitPaths.join(",");

    if (uniqueUsernames.length > 0 && (pathsChanged || uniqueUsernames.length > 0)) {
      refetchUsers({
        usernames: uniqueUsernames,
        orgUnitPaths: selectedOrgUnitPaths,
      });
      // Update the ref to current paths
      prevPathsRef.current = [...selectedOrgUnitPaths];
    }
  }, [uniqueUsernames, selectedOrgUnitPaths, refetchUsers]);

  // Link user details with visit statistics and update dashboard stats
  useEffect(() => {
    if (!dashboardData?.sqlViewData?.listGrid?.rows) {
      return;
    }

    const rows = dashboardData.sqlViewData.listGrid.rows;
    const usernameColumnIndex = dashboardData.sqlViewData.listGrid.headers.findIndex(
      (header: { column: string; }) => header.column === "username",
    );
    const timestampColumnIndex = dashboardData.sqlViewData.listGrid.headers.findIndex(
      (header: { column: string; }) => header.column === "timestamp",
    );

    if (usernameColumnIndex < 0 || timestampColumnIndex < 0) {
      return;
    }

    // Get the list of usernames from filtered users (if org units are selected)
    const filteredUsernames = new Set<string>();
    if (filteredUserData?.users?.users && selectedOrgUnitPaths.length > 0) {
      filteredUserData.users.users.forEach((user: any) => {
        filteredUsernames.add(user.username);
      });
    }

    // Filter rows based on selected org units if applicable
    const filteredRows =
      selectedOrgUnitPaths.length > 0
        ? rows.filter((row: any[]) => filteredUsernames.has(row[usernameColumnIndex]))
        : rows;

    // Format rows for processing
    const formattedRows = filteredRows.map((row: any[]) => {
      return {
        timestamp: row[timestampColumnIndex],
        username: row[usernameColumnIndex],
      };
    });

    // Group by username for visit details
    const groupedData: Record<string, VisitDetails> = {};

    formattedRows.forEach((row: { timestamp: string; username: string; }) => {
      const { timestamp, username } = row;

      if (!groupedData[username]) {
        groupedData[username] = { username, visits: 0, lastVisit: timestamp };
      }

      groupedData[username].visits += 1;

      // Fix for last visit date - ensure we're comparing dates properly
      const currentVisitDate = new Date(timestamp);
      const existingLastVisitDate = new Date(groupedData[username].lastVisit);

      if (currentVisitDate > existingLastVisitDate) {
        groupedData[username].lastVisit = timestamp;
      }
    });

    const sortedData = Object.values(groupedData).sort((a, b) => b.visits - a.visits);
    setVisitDetails(sortedData);

    // Calculate dashboard statistics based on filtered rows
    const totalVisits = formattedRows.length;

    // Top users (already sorted by visits)
    const topUsers = sortedData.slice(0, 3).map((user) => ({
      username: user.username,
      visits: user.visits,
    }));

    // Group by day for top day
    const visitsByDay: Record<string, number> = {};
    formattedRows.forEach((row: { timestamp: string | number | Date; }) => {
      const date = new Date(row.timestamp);
      const dateKey = date.toISOString().split("T")[0];
      visitsByDay[dateKey] = (visitsByDay[dateKey] || 0) + 1;
    });

    // Find day with most visits
    let topDayKey = "";
    let topDayCount = 0;
    Object.entries(visitsByDay).forEach(([dateKey, count]) => {
      if (count > topDayCount) {
        topDayKey = dateKey;
        topDayCount = count;
      }
    });

    // Group by week for top week
    const visitsByWeek: Record<string, { count: number; startDate: Date; endDate: Date; }> = {};
    formattedRows.forEach((row: { timestamp: string | number | Date; }) => {
      const date = new Date(row.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      weekEnd.setHours(23, 59, 59, 999);

      const weekKey = weekStart.toISOString().split("T")[0];

      if (!visitsByWeek[weekKey]) {
        visitsByWeek[weekKey] = { count: 0, startDate: weekStart, endDate: weekEnd };
      }
      visitsByWeek[weekKey].count += 1;
    });

    // Find week with most visits
    let topWeekKey = "";
    let topWeekCount = 0;
    Object.entries(visitsByWeek).forEach(([weekKey, data]) => {
      if (data.count > topWeekCount) {
        topWeekKey = weekKey;
        topWeekCount = data.count;
      }
    });

    // Group by month for top month
    const visitsByMonth: Record<string, number> = {};
    formattedRows.forEach((row: { timestamp: string | number | Date; }) => {
      const date = new Date(row.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      visitsByMonth[monthKey] = (visitsByMonth[monthKey] || 0) + 1;
    });

    // Find month with most visits
    let topMonthKey = "";
    let topMonthCount = 0;
    Object.entries(visitsByMonth).forEach(([monthKey, count]) => {
      if (count > topMonthCount) {
        topMonthKey = monthKey;
        topMonthCount = count;
      }
    });

    // Format month name
    const [year, month] = topMonthKey ? topMonthKey.split("-") : ["", ""];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = month ? monthNames[Number.parseInt(month) - 1] || "" : "";

    setDashboardStats({
      totalVisits,
      topUsers,
      topDay: {
        date: topDayKey ? new Date(topDayKey) : null,
        count: topDayCount,
      },
      topWeek: {
        startDate: visitsByWeek[topWeekKey]?.startDate || null,
        endDate: visitsByWeek[topWeekKey]?.endDate || null,
        count: topWeekCount,
      },
      topMonth: {
        month: monthName,
        year: year || "",
        count: topMonthCount,
      },
    });
  }, [dashboardData, filteredUserData, selectedOrgUnitPaths]);

  // Link user details with visit statistics for display
  useEffect(() => {
    if (!filteredUserData?.users?.users || !visitDetails.length) {
      return;
    }

    try {
      const users = filteredUserData.users.users;

      // Create a map for faster lookups
      const detailsMap = new Map<string, VisitDetails>();
      visitDetails.forEach((detail) => {
        detailsMap.set(detail.username, detail);
      });

      // Link users with visit details
      const linkedUsersData = users
        .filter((user: { username: string; }) => detailsMap.has(user.username))
        .map((user: any) => {
          const details = detailsMap.get(user.username);
          return { ...user, visits: details?.visits || 0, lastVisit: details?.lastVisit || "" };
        });

      setLinkedUsers(linkedUsersData);

      // Update top users with first and last names
      const userMap = new Map<string, any>();
      users.forEach((user: any) => {
        userMap.set(user.username, user);
      });

      const updatedTopUsers = dashboardStats.topUsers.map((topUser) => {
        const userDetails = userMap.get(topUser.username);
        return {
          ...topUser,
          firstName: userDetails?.firstName,
          surname: userDetails?.surname,
        };
      });

      setDashboardStats((prev) => ({
        ...prev,
        topUsers: updatedTopUsers,
      }));
    } catch (error) {
      console.error("Error linking users with visit details:", error);
    }
  }, [visitDetails, filteredUserData, dashboardStats.topUsers]);

  return (
    <DashboardUserDetails
      linkedUsers={linkedUsers}
      row={row}
      value={value}
      loading={dashboardLoading || userLoading}
      hasOrgUnitFilter={selectedOrgUnitPaths.length > 0}
      dashboardStats={dashboardStats}
    />
  );
}
