// file location: src/pages/district-engagement/components/data-table.tsx

import { useMemo, useState } from "react";

import type { MRT_ColumnDef } from "mantine-react-table";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

import { useDashboard } from "../../../context/DashboardContext";
import i18n from "../../../locales";
import type { DistrictEngagement } from "../../../lib/processDistrictData";

import { FilterSection } from "./filter-section";

export default function DataTable() {
  const [tableData, setTableData] = useState<DistrictEngagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useDashboard();

  // Define columns for the table
  const columns = useMemo<MRT_ColumnDef<DistrictEngagement>[]>(
    () => [
      {
        accessorKey: "OrgUnitName",
        header: i18n.t("Org Unit Name"),
        size: 150,
      },
      {
        accessorKey: "totalUsers",
        header: i18n.t("Total Users"),
        size: 120,
      },
      {
        accessorKey: "activeUsers",
        header: i18n.t("Active Users"),
        size: 120,
      },
      {
        accessorKey: "lastActivity",
        header: i18n.t("Last Activity"),
        size: 120,
      },
      {
        accessorKey: "accessPercentage",
        header: i18n.t("Access %"),
        size: 100,
      },
      {
        accessorKey: "isConsistentlyActive",
        header: i18n.t("Consistently Active"),
        Cell: ({ cell }) => {
          const value = cell.getValue<boolean>();
          return value ? (
            <span style={{ color: "green" }}>{i18n.t("Yes")}</span>
          ) : (
            <span style={{ color: "red" }}>{i18n.t("No")}</span>
          );
        },
        size: 150,
      },
      {
        accessorKey: "dashboardViews",
        header: i18n.t("Dashboard Views"),
        size: 150,
      },
    ],
    []
  );

  // Handle data received from FilterSection
  const handleDataProcessed = (processedData: DistrictEngagement[]) => {
    setTableData(processedData);
  };

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
        {!state.selectedOrgUnitLevel
          ? i18n.t("Please select an organization unit level to view district data")
          : i18n.t("No data found for the selected organization unit level")}
      </div>
    ),
  });

  return (
    <div className="mb-9">
      {/* Filters */}
      <FilterSection onLoadingChange={setIsLoading} onDataProcessed={handleDataProcessed} />

      {/* Table */}
      <div className="bg-white shadow-sm">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
}
