// file location: src/pages/district-engagement/components/data-table.tsx

import { useMemo, useState } from "react";

import {
  CircularLoader,
  DataTable as DHIS2DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableHead,
  DataTableRow,
} from "@dhis2/ui";
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { useDashboard } from "../../../context/DashboardContext";
import i18n from "../../../locales";
import type { DistrictEngagement } from "../../../lib/processDistrictData";

import { FilterSection } from "./filter-section";

export default function DataTableComponent() {
  const [tableData, setTableData] = useState<DistrictEngagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([{ id: "activeUsers", desc: true }]);
  const { state } = useDashboard();

  // Define columns for the table
  const columns = useMemo<ColumnDef<DistrictEngagement>[]>(
    () => [
      {
        accessorKey: "OrgUnitName",
        id: "OrgUnitName",
        header: i18n.t("Org Unit Name"),
        size: 150,
      },
      {
        accessorKey: "totalUsers",
        id: "totalUsers",
        header: i18n.t("Total Users"),
        size: 120,
      },
      {
        accessorKey: "activeUsers",
        id: "activeUsers",
        header: i18n.t("Active Users"),
        size: 120,
      },
      {
        accessorKey: "lastActivity",
        id: "lastActivity",
        header: i18n.t("Last Activity"),
        size: 120,
      },
      {
        accessorKey: "accessPercentage",
        id: "accessPercentage",
        header: i18n.t("Access %"),
        size: 100,
      },
      {
        accessorKey: "isConsistentlyActive",
        id: "isConsistentlyActive",
        header: i18n.t("Consistently Active"),
        cell: ({ getValue }) => {
          const value = getValue<boolean>();
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
        id: "dashboardViews",
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

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="mb-9">
      {/* Filters */}
      <FilterSection onLoadingChange={setIsLoading} onDataProcessed={handleDataProcessed} />

      {/* Table */}
      <div className="bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <CircularLoader />
          </div>
        ) : (
          <DHIS2DataTable>
            <DataTableHead>
              <DataTableRow>
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <DataTableColumnHeader
                    key={header.id}
                    onSortIconClick={() => {
                      if (header.column.getCanSort()) {
                        header.column.toggleSorting();
                      }
                    }}
                    sortDirection={
                      header.column.getIsSorted()
                        ? header.column.getIsSorted() === "asc"
                          ? "asc"
                          : "desc"
                        : "default"
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : typeof header.column.columnDef.header === "string"
                        ? header.column.columnDef.header
                        : ""}
                  </DataTableColumnHeader>
                ))}
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {table.getRowModel().rows.length === 0 ? (
                <DataTableRow>
                  <DataTableCell colSpan={columns.length}>
                    <div className="p-4 text-center">
                      {!state.selectedOrgUnitLevel
                        ? i18n.t("Please select an organization unit level to view district data")
                        : i18n.t("No data found for the selected organization unit level")}
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <DataTableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <DataTableCell key={cell.id}>
                        {typeof cell.column.columnDef.cell === "function"
                          ? cell.column.columnDef.cell(cell.getContext())
                          : cell.getValue() !== null && cell.getValue() !== undefined
                            ? String(cell.getValue())
                            : ""}
                      </DataTableCell>
                    ))}
                  </DataTableRow>
                ))
              )}
            </DataTableBody>
          </DHIS2DataTable>
        )}
      </div>
    </div>
  );
}
