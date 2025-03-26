"use client";

import { useEffect, useState } from "react";
import { usesqlViewDataReport } from "../../../hooks/dashboards";
import { useFilteredUsers } from "../../../hooks/users";
import type { DateValueType, LinkedUser, VisitDetails } from "@/types/dashboard-reportType";
import DashboardUserDetails from "./dashboard-user-details";
import type { DashboardConverted } from "@/types/dashboardsType";

export interface DashboardReportProps {
  row: DashboardConverted;
  value: DateValueType;
  selectedOrgUnitPaths: string[];
}

export default function DashboardReport({ row, value, selectedOrgUnitPaths = [] }: DashboardReportProps) {
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);
  const [visitDetails, setVisitDetails] = useState<VisitDetails[]>([]);
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);

  const favoriteuid = row.id;
  const criteria = `favoriteuid%${encodeURIComponent(favoriteuid)}`;

  const {
    loading: dashboardLoading,
    error: dashboardError,
    data: dashboardData,
    refetch: refetchDashboard,
  } = usesqlViewDataReport({
    datetime: value,
    criteria,
  });

  useEffect(() => {
    if (value) {
      refetchDashboard({ criteria, datetime: value });
    }
  }, [value, refetchDashboard, criteria]);

  useEffect(() => {
    const usernameColumnIndex = dashboardData?.sqlViewData?.listGrid?.headers?.findIndex(
      (header: { column: string; }) => header?.column === "username",
    );

    if (usernameColumnIndex !== undefined && usernameColumnIndex >= 0) {
      const uniqueUsernamesArray = Array.from(
        new Set<string>(
          dashboardData?.sqlViewData?.listGrid?.rows?.map((row: Record<string, any>) => row[usernameColumnIndex]),
        ),
      ).filter(Boolean);

      setUniqueUsernames(uniqueUsernamesArray);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (dashboardData?.sqlViewData?.listGrid?.rows) {
      const rows = dashboardData.sqlViewData.listGrid.rows;
      const formattedRows = rows.map((row: string[]) => {
        const [timestamp, username] = row;
        return { timestamp, username };
      });

      const groupedData: Record<string, VisitDetails> = formattedRows.reduce(
        (acc: Record<string, VisitDetails>, row: { timestamp: string; username: string; }) => {
          const { timestamp, username } = row;

          if (!acc[username]) {
            acc[username] = { username, visits: 0, lastVisit: timestamp };
          }

          acc[username].visits += 1;
          if (new Date(timestamp) > new Date(acc[username].lastVisit)) {
            acc[username].lastVisit = timestamp;
          }

          return acc;
        },
        {} as Record<string, VisitDetails>,
      );

      const sortedData = Object.values(groupedData).sort((a, b) => b.visits - a.visits);

      setVisitDetails(sortedData);
    }
  }, [dashboardData]);

  const {
    data: filteredUserData,
    loading: userLoading,
    error: userError,
    refetch: refetchUsers,
  } = useFilteredUsers(uniqueUsernames, selectedOrgUnitPaths);

  useEffect(() => {
    if (uniqueUsernames.length > 0) {
      refetchUsers({
        usernames: uniqueUsernames,
        orgUnitPaths: selectedOrgUnitPaths,
      });
    }
  }, [uniqueUsernames, selectedOrgUnitPaths, refetchUsers]);

  useEffect(() => {
    if (visitDetails.length > 0 && filteredUserData?.users?.users?.length > 0) {
      const Users = filteredUserData.users.users
        .filter((user: { username: string; }) => visitDetails.find((v) => v.username === user.username))
        .map((user: { username: string; }) => {
          const details = visitDetails.find((v) => v.username === user.username);
          return { ...user, ...details };
        });

      setLinkedUsers(Users);
    } else {
      setLinkedUsers([]);
    }
  }, [visitDetails, filteredUserData]);

  return (
    <DashboardUserDetails
      linkedUsers={linkedUsers}
      row={row}
      value={value}
      loading={dashboardLoading || userLoading}
      hasOrgUnitFilter={selectedOrgUnitPaths.length > 0}
    />
  );
}

