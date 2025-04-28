// file location: src/pages/district-engagement/components/data-table.tsx

import { useMemo } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { FilterSection } from "./filter-section";
import { DistrictEngagement } from "../../../lib/processDistrictData";

export default function DataTable() {

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
        {orgUnitData.length === 0 ?
          "Select an organization unit level to view district data" :
          "No matching records found"}
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