import React, { useEffect, useState } from "react";
import { usesqlViewDataReport } from "../../../hooks/dashboards";
import { useDataQuery } from "@dhis2/app-runtime";
import { DataSourceRowProps } from "./show-data";
import {
  DateValueType,
  LinkedUser,
  VisitDetails,
} from "@/types/dashboard-reportType";
import DashboardUserDetails from "./dashboard-user-details";
import { DashboardConverted } from "@/types/dashboardsType";

export interface DashboardReportProps {
  row: DashboardConverted;
  value: DateValueType;
}

export default function DashboardReport({ row, value }: DashboardReportProps) {
  const [uniqueUsernames, setUniqueUsernames] = useState<string[]>([]);

  const favoriteuid = row.id;
  const criteria = `favoriteuid%${encodeURIComponent(favoriteuid)}`;

  const { loading, error, data, refetch } = usesqlViewDataReport({
    datetime: value,
    criteria,
  });

  useEffect(() => {
    if (value) {
      refetch({ criteria, datetime: value });
    }
  }, [value, refetch]);

  useEffect(() => {
    const usernameColumnIndex = data?.sqlViewData?.listGrid?.headers?.findIndex(
      (header: { column: string }) => header?.column === "username"
    );

    const uniqueUsernamesArray = Array.from(
      new Set<string>(
        data?.sqlViewData?.listGrid?.rows?.map(
          (row: Record<string, any>) => row[usernameColumnIndex]
        )
      )
    );
    setUniqueUsernames(uniqueUsernamesArray);
  }, [data]);

  const query = {
    users: {
      resource: "users",
      params: ({ usernames }: { usernames: string[] }) => ({
        paging: false,
        filter: `userCredentials.username:in:[${usernames.join(",")}]`,
        fields:
          "id,username,name,displayName,phoneNumber,jobTitle,userCredentials[userRoles[id,displayName]],userGroups[id,displayName],organisationUnits[id,displayName]",
      }),
    },
  };

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchUsers,
  } = useDataQuery(query, { variables: { usernames: uniqueUsernames } });

  useEffect(() => {
    if (uniqueUsernames.length > 0) {
      refetchUsers({ usernames: uniqueUsernames });
    }
  }, [uniqueUsernames, refetchUsers]);

  const [visitDetails, setVisitDetails] = useState<VisitDetails[]>([]);
  useEffect(() => {
    if (data) {
      const rows = data?.sqlViewData?.listGrid?.rows;
      const formattedRows = rows.map((row: string[]) => {
        const [timestamp, username] = row;
        return { timestamp, username };
      });

      const groupedData: Record<string, VisitDetails> = formattedRows.reduce(
        (
          acc: Record<string, VisitDetails>,
          row: { timestamp: string; username: string }
        ) => {
          const { timestamp, username } = row;

          // Initialize the accumulator for a new username
          if (!acc[username]) {
            acc[username] = { username, visits: 0, lastVisit: timestamp };
          }

          acc[username].visits += 1;
          if (new Date(timestamp) > new Date(acc[username].lastVisit)) {
            acc[username].lastVisit = timestamp;
          }

          return acc;
        },
        {} as Record<string, VisitDetails>
      );

      const sortedData = Object.values(groupedData).sort(
        (a, b) => b.visits - a.visits
      );

      setVisitDetails(sortedData);
    }
  }, [data]);

  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  useEffect(() => {
    if (visitDetails.length > 0 && userData?.users?.users?.length > 0) {
      const Users = userData.users.users
        .filter((user: { username: string }) =>
          visitDetails.find((v) => v.username === user.username)
        )
        .map((user: { username: string }) => {
          const details = visitDetails.find(
            (v) => v.username === user.username
          );
          return { ...user, ...details };
        });

      setLinkedUsers(Users);
    }
  }, [visitDetails, userData]);

  return (
    <DashboardUserDetails linkedUsers={linkedUsers} row={row} value={value} />
  );
}
