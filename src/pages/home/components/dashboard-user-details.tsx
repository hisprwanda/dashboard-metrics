"use client";

import { useMemo, useState } from "react";

import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableColumnHeader,
  Tag,
  Button,
  ButtonStrip,
  CircularLoader,
  Pagination,
} from "@dhis2/ui";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import i18n from "../../../locales";
import type { DateValueType, LinkedUser } from "@/types/dashboard-reportType";
import type { DashboardConverted } from "@/types/dashboardsType";

interface DashboardStats {
  totalVisits: number;
  topUsers: {
    username: string;
    visits: number;
    firstName?: string;
    surname?: string;
  }[];
  topDay: { date: Date | null; count: number };
  topWeek: { startDate: Date | null; endDate: Date | null; count: number };
  topMonth: { month: string; year: string; count: number };
}

interface DashboardUserDetailsComponentProps {
  linkedUsers: LinkedUser[];
  row: DashboardConverted;
  value: DateValueType;
  loading: boolean;
  hasOrgUnitFilter: boolean;
  dashboardStats: DashboardStats;
}

export default function DashboardUserDetails({
  linkedUsers,
  row,
  value,
  loading,
  hasOrgUnitFilter = false,
  dashboardStats,
}: DashboardUserDetailsComponentProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "visits", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Ensure we have a safe default for linkedUsers when data is loading
  const safeLinkedUsers = loading ? [] : linkedUsers;

  const columns = useMemo<ColumnDef<LinkedUser>[]>(
    () => [
      {
        accessorFn: (row) => {
          const firstName = row?.firstName || "";
          const surname = row?.surname || "";
          const username = row?.username || "";

          return firstName && surname
            ? `${firstName} ${surname} (${username})`
            : username;
        },
        id: "name",
        header: i18n.t("Name"),
        cell: ({ row }) => {
          const firstName = row.original?.firstName || "";
          const surname = row.original?.surname || "";
          const username = row.original?.username || "";

          return (
            <div>
              {firstName && surname ? (
                <>
                  <div>{`${firstName} ${surname}`}</div>
                  <div className="text-xs text-gray-500">{username}</div>
                </>
              ) : (
                username
              )}
            </div>
          );
        },
        size: 200,
      },
      {
        accessorFn: (row) => row?.visits || 0,
        id: "visits",
        header: i18n.t("Access Frequency"),
        size: 150,
      },
      {
        accessorFn: (row) => {
          if (!row.lastVisit) return null;
          const sDay = new Date(row.lastVisit);
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        id: "lastVisit",
        header: i18n.t("Last Visit"),
        cell: ({ getValue }) => {
          const date = getValue<Date | null>();
          return date ? date.toLocaleDateString("en-CA") : "-";
        },
        size: 150,
      },
      {
        accessorFn: (row) =>
          row?.organisationUnits?.map((org) => org?.displayName).join(", ") ||
          "",
        id: "organisations",
        header: i18n.t("Organisations"),
        size: 200,
      },
      {
        accessorFn: (row) =>
          row?.userGroups?.map((group) => group?.displayName).join(", ") || "",
        id: "userGroups",
        header: i18n.t("User Groups"),
        size: 200,
      },
      {
        accessorFn: (row) =>
          row?.userCredentials?.userRoles
            ?.map((role) => role?.displayName)
            .join(", ") || "",
        id: "userRoles",
        header: i18n.t("Roles"),
        size: 200,
      },
    ],
    []
  );

  const table = useReactTable({
    data: safeLinkedUsers,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Function to prepare data for export
  const prepareDataForExport = () =>
    table.getFilteredRowModel().rows.map((row) => {
      const userData = row.original;
      const firstName = userData.firstName || "";
      const surname = userData.surname || "";
      const username = userData.username || "";
      const displayName =
        firstName && surname
          ? `${firstName} ${surname} (${username})`
          : username;

      // Format the date for export
      let lastVisitDate = "-";
      if (userData.lastVisit) {
        const date = new Date(userData.lastVisit);
        lastVisitDate = date.toLocaleDateString("en-CA");
      }

      return {
        [i18n.t("Name")]: displayName,
        [i18n.t("User Groups")]:
          userData.userGroups?.map((group) => group?.displayName).join(", ") ||
          "",
        [i18n.t("Organisations")]:
          userData.organisationUnits
            ?.map((org) => org?.displayName)
            .join(", ") || "",
        [i18n.t("Access Frequency")]: userData.visits || 0,
        [i18n.t("Last Visit")]: lastVisitDate,
      };
    });

  // Export to Excel/XLSX
  const handleExportXLSX = () => {
    const exportData = prepareDataForExport();

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create metadata in the correct format for proper cell placement
    const metadataArray = [
      [i18n.t("Dashboard"), row?.displayName || "-"],
      [
        i18n.t("Period"),
        `${value?.startDate ? value.startDate.toLocaleDateString("en-CA") : "-"} - ${value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}`,
      ],
      [i18n.t("Export Date"), new Date().toLocaleDateString("en-CA")],
      [i18n.t("Total Visits"), dashboardStats.totalVisits.toString()],
    ];

    // Convert array to worksheet (this ensures proper cell placement)
    const metadataWs = XLSX.utils.aoa_to_sheet(metadataArray);
    XLSX.utils.book_append_sheet(wb, metadataWs, i18n.t("Dashboard Info"));

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, i18n.t("User Access Data"));

    // Generate XLSX file and trigger download
    XLSX.writeFile(
      wb,
      `Dashboard_${row?.displayName || "Export"}_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // Export to PDF
  const handleExportPDF = () => {
    try {
      const exportRows = table.getFilteredRowModel().rows;

      // Create PDF document (landscape)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title and metadata before the table
      doc.setFontSize(16);
      doc.text(`${i18n.t("Dashboard")}: ${row?.displayName || "-"}`, 14, 15);

      doc.setFontSize(12);
      doc.text(
        `${i18n.t("Period")}: ${value?.startDate ? value.startDate.toLocaleDateString("en-CA") : "-"} - ${value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}`,
        14,
        22
      );
      doc.text(
        `${i18n.t("Export Date")}: ${new Date().toLocaleDateString("en-CA")}`,
        14,
        29
      );
      doc.text(
        `${i18n.t("Total Visits")}: ${dashboardStats.totalVisits}`,
        14,
        36
      );

      // Get table headers from columns
      const tableHeaders = [
        i18n.t("Name"),
        i18n.t("User Groups"),
        i18n.t("Organisations"),
        i18n.t("Access Frequency"),
        i18n.t("Last Visit"),
      ];

      // Prepare table data from rows
      const tableData = exportRows.map((row) => {
        const userData = row.original;
        const firstName = userData.firstName || "";
        const surname = userData.surname || "";
        const username = userData.username || "";
        const displayName =
          firstName && surname
            ? `${firstName} ${surname} (${username})`
            : username;

        // Format the date for export
        let lastVisitDate = "-";
        if (userData.lastVisit) {
          const date = new Date(userData.lastVisit);
          lastVisitDate = date.toLocaleDateString("en-CA");
        }

        return [
          displayName,
          userData.userGroups?.map((group) => group?.displayName).join(", ") ||
            "",
          userData.organisationUnits
            ?.map((org) => org?.displayName)
            .join(", ") || "",
          (userData.visits || 0).toString(),
          lastVisitDate,
        ];
      });

      // Generate the table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 42,
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
        },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [242, 242, 242] },
      });

      // Save PDF
      doc.save(
        `Dashboard_${row?.displayName || "Export"}_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (error) {
      alert(i18n.t("Failed to export PDF. See console for details."));
    }
  };

  // Handle filtering by top user
  const handleFilterByUser = (username: string) => {
    setGlobalFilter(username);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <CircularLoader />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[85vh] overflow-y-scroll bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6 mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
      <div className="h-[79vh] overflow-y-scroll">
        {/* Compact Dashboard Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-3 mb-4 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{i18n.t("Dashboard")}:</span>
            <span className="text-sm">{row?.displayName || "-"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{i18n.t("Period")}:</span>
            <span className="text-sm">
              {value?.startDate
                ? value.startDate.toLocaleDateString("en-CA")
                : "-"}{" "}
              -{" "}
              {value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {i18n.t("Total Visits")}:
            </span>
            <Tag positive>{dashboardStats.totalVisits}</Tag>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              <svg
                className="inline mr-1 h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {i18n.t("Top Users")}:
            </span>
            <div className="flex flex-wrap gap-1">
              {dashboardStats.topUsers.map((user, index) => (
                <Tag
                  key={index}
                  positive
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleFilterByUser(user.username)}
                >
                  {user.firstName && user.surname
                    ? `${user.firstName} ${user.surname} (${user.visits})`
                    : `${user.username} (${user.visits})`}
                </Tag>
              ))}
              {dashboardStats.topUsers.length === 0 && (
                <span className="text-xs text-gray-500">{i18n.t("None")}</span>
              )}
            </div>
          </div>
        </div>

        {/* Export and Filter buttons */}
        <div className="flex justify-between items-center mb-4 px-2">
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={i18n.t("Search all columns...")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
          <ButtonStrip>
            <Button
              disabled={
                table.getFilteredRowModel().rows.length === 0 || loading
              }
              onClick={handleExportXLSX}
              icon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              primary
              small
            >
              {i18n.t("Export to Excel")}
            </Button>
            <Button
              disabled={
                table.getFilteredRowModel().rows.length === 0 || loading
              }
              onClick={handleExportPDF}
              icon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              }
              destructive
              small
            >
              {i18n.t("Export to PDF")}
            </Button>
          </ButtonStrip>
        </div>

        {/* Data Table */}
        <DataTable>
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
                  <div className="flex justify-center items-center h-40 text-gray-500">
                    {loading
                      ? ""
                      : hasOrgUnitFilter && linkedUsers.length === 0
                        ? i18n.t(
                            "No users from the selected organization units visited this dashboard in the selected period."
                          )
                        : i18n.t("No user visit details available.")}
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
                        : cell.getValue() !== null &&
                            cell.getValue() !== undefined
                          ? String(cell.getValue())
                          : ""}
                    </DataTableCell>
                  ))}
                </DataTableRow>
              ))
            )}
          </DataTableBody>
        </DataTable>

        {/* Pagination */}
        {table.getFilteredRowModel().rows.length > 0 && (
          <div className="mt-4 mb-8 px-2">
            <Pagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getState().pagination.pageSize}
              pageCount={table.getPageCount()}
              total={table.getFilteredRowModel().rows.length}
              onPageChange={(newPage) => {
                table.setPageIndex(newPage - 1);
              }}
              onPageSizeChange={(newPageSize) => {
                table.setPageSize(newPageSize);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
