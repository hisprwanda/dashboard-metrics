// file location: src/pages/district-engagement/components/data-table.tsx

import React, { useMemo, useState, useEffect } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { FilterSection } from "./filter-section";
import { DistrictEngagement } from "../../../lib/processDistrictData";
import { useDashboard } from "../../../context/DashboardContext";
import { useSystem } from "../../../context/SystemContext";
import { useOrganisationUnitsByLevel } from "../../../hooks/organisationUnits";
import { useFilteredUsers } from "../../../hooks/users";

export default function DataTable() {
  const { state } = useDashboard();
  const { orgUnitSqlViewUid } = useSystem();
  const [tableData, setTableData] = useState<DistrictEngagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected level from the dashboard state
  const selectedLevel = state.selectedOrgUnitLevel;

  // Only fetch organization units when a level is selected
  const orgUnitQuery = useOrganisationUnitsByLevel(
    selectedLevel || "",
    orgUnitSqlViewUid || ""
  );

  // Process organization unit data only when data is available
  const orgUnitData = useMemo(() => {
    if (!orgUnitQuery.data || !orgUnitQuery.data.sqlViewData) return [];

    console.log("Organization units by level:", orgUnitQuery.data.sqlViewData);
    return orgUnitQuery.data.sqlViewData.rows || [];
  }, [orgUnitQuery.data]);

  // Extract organization unit paths for user filtering
  const orgUnitPaths = useMemo(() => {
    if (!orgUnitData.length) return [];
    // Assuming the path is the second column in the SQL view data
    return orgUnitData.map(row => row[1]);
  }, [orgUnitData]);

  // Only fetch users when we have org unit paths
  const userQuery = useFilteredUsers(
    [], // usernames
    orgUnitPaths, // orgUnitPaths
    [], // orgUnitIds
    [] // userGroups
  );

  // Process user data and populate the table
  useEffect(() => {
    setIsLoading(orgUnitQuery.loading || userQuery.loading);

    if (orgUnitData.length && userQuery.data?.users?.users) {
      console.log("User data:", userQuery.data.users.users);

      // Process district engagement data
      const processedData: DistrictEngagement[] = orgUnitData.map(orgUnitRow => {
        const orgUnitPath = orgUnitRow[1];
        const orgUnitName = orgUnitRow[0];

        // Find users belonging to this organization unit
        const orgUnitUsers = userQuery.data.users.users.filter(
          (user: any) => user.organisationUnits.some(
            (ou: any) => orgUnitPath.includes(ou.id)
          )
        );

        // Count active users (those with lastLogin)
        const activeUsers = orgUnitUsers.filter(
          (user: any) => user.userCredentials && user.userCredentials.lastLogin
        );

        // Find the most recent login date
        const lastActivityDate = activeUsers.length > 0
          ? new Date(Math.max(...activeUsers.map(
            (user: any) => new Date(user.userCredentials.lastLogin).getTime()
          )))
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
        const dashboardViews = activeUsers.length * 3; // Just a placeholder calculation

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

      setTableData(processedData);
    }
  }, [orgUnitData, userQuery.data]);

  const columns = useMemo<MRT_ColumnDef<DistrictEngagement>[]>(
    () => [
      {
        accessorKey: "OrgUnitName",
        header: "Org Unit Name",
        size: 150,
      },
      {
        accessorKey: "totalUsers",
        header: "Total Users",
        size: 120,
      },
      {
        accessorKey: "activeUsers",
        header: "Active Users",
        size: 120,
      },
      {
        accessorKey: "lastActivity",
        header: "Last Activity",
        size: 120,
      },
      {
        accessorKey: "accessPercentage",
        header: "Access %",
        size: 100,
      },
      {
        accessorKey: "isConsistentlyActive",
        header: "Consistently Active",
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean>();
          return value ?
            <span style={{ color: "green" }}>Yes</span> :
            <span style={{ color: "red" }}>No</span>;
        },
        size: 150,
      },
      {
        accessorKey: "dashboardViews",
        header: "Dashboard Views",
        size: 150,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: tableData,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      sorting: [{ id: "activeUsers", desc: true }],
      density: "xs",
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    state: {
      isLoading,
    },
    renderEmptyRowsFallback: () => (
      <div className="p-4 text-center">
        {!selectedLevel ?
          "Please select an organization unit level to view district data" :
          "No data found for the selected organization unit level"}
      </div>
    ),
  });

  return (
    <div className="mb-9">
      {/* Filters */}
      <FilterSection />

      {/* Table */}
      <div className="bg-white shadow-sm">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
}