"use client";

import { useMemo } from "react";
import type { DateValueType, LinkedUser } from "@/types/dashboard-reportType";
import type { DashboardConverted } from "@/types/dashboardsType";
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable, type MRT_Row } from "mantine-react-table";
import { Button, Group, Badge, Text } from "@mantine/core";
import { IconFileSpreadsheet, IconFile, IconUser, IconEye } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface DashboardStats {
  totalVisits: number;
  topUsers: { username: string; visits: number; firstName?: string; surname?: string; }[];
  topDay: { date: Date | null; count: number; };
  topWeek: { startDate: Date | null; endDate: Date | null; count: number; };
  topMonth: { month: string; year: string; count: number; };
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
  // Ensure we have a safe default for linkedUsers when data is loading
  const safeLinkedUsers = loading ? [] : linkedUsers;

  const columns = useMemo<MRT_ColumnDef<LinkedUser>[]>(
    () => [
      {
        accessorFn: (row) => {
          const firstName = row?.firstName || "";
          const surname = row?.surname || "";
          const username = row?.username || "";

          return firstName && surname ? `${firstName} ${surname} (${username})` : username;
        },
        header: "Name",
        size: 40,
        Cell: ({ row }) => {
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
      },
      {
        accessorFn: (row) => {
          return row?.visits || 0;
        },
        id: "AccessFrequency",
        header: "Access Frequency",
        size: 40,
      },
      {
        accessorFn: (row) => {
          if (!row.lastVisit) return null;
          const sDay = new Date(row.lastVisit);
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        id: "lastVisit",
        header: "Last Visit",
        filterVariant: "date-range",
        sortingFn: "datetime",
        enableColumnFilterModes: false,
        Cell: ({ cell }) => {
          const date = cell.getValue<Date>();
          return date ? date.toLocaleDateString("en-CA") : "-";
        },
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        size: 50,
      },
      {
        accessorFn: (row) => {
          return row?.organisationUnits?.map((org) => org?.displayName).join(", ") || "";
        },
        id: "organisations",
        header: "Organisations",
        size: 40,
      },
      {
        accessorFn: (row) => {
          return row?.userGroups?.map((group) => group?.displayName).join(", ") || "";
        },
        id: "userGroups",
        header: "User Groups",
        size: 40,
      },
      {
        accessorFn: (row) => {
          return row?.userCredentials?.userRoles?.map((role) => role?.displayName).join(", ") || "";
        },
        id: "userRoles",
        header: "Roles",
        size: 40,
      },
    ],
    [],
  );

  // Function to prepare data for export
  const prepareDataForExport = (rows: MRT_Row<LinkedUser>[]) => {
    return rows.map((row) => {
      const userData = row.original;
      const firstName = userData.firstName || "";
      const surname = userData.surname || "";
      const username = userData.username || "";
      const displayName = firstName && surname ? `${firstName} ${surname} (${username})` : username;

      // Format the date for export
      let lastVisitDate = "-";
      if (userData.lastVisit) {
        const date = new Date(userData.lastVisit);
        lastVisitDate = date.toLocaleDateString("en-CA");
      }

      return {
        Name: displayName,
        "User Groups": userData.userGroups?.map((group) => group?.displayName).join(", ") || "",
        Organisations: userData.organisationUnits?.map((org) => org?.displayName).join(", ") || "",
        "Access Frequency": userData.visits || 0,
        "Last Visit": lastVisitDate,
      };
    });
  };

  // Export to Excel/XLSX
  const handleExportXLSX = (rows: MRT_Row<LinkedUser>[]) => {
    const exportData = prepareDataForExport(rows);

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create metadata in the correct format for proper cell placement
    const metadataArray = [
      ["Dashboard", row?.displayName || "-"],
      [
        "Period",
        `${value?.startDate ? value.startDate.toLocaleDateString("en-CA") : "-"} - ${value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}`,
      ],
      ["Export Date", new Date().toLocaleDateString("en-CA")],
      ["Total Visits", dashboardStats.totalVisits.toString()],
    ];

    // Convert array to worksheet (this ensures proper cell placement)
    const metadataWs = XLSX.utils.aoa_to_sheet(metadataArray);
    XLSX.utils.book_append_sheet(wb, metadataWs, "Dashboard Info");

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "User Access Data");

    // Generate XLSX file and trigger download
    XLSX.writeFile(wb, `Dashboard_${row?.displayName || "Export"}_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = (rows: MRT_Row<LinkedUser>[]) => {
    try {
      // Create PDF document (landscape)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title and metadata before the table
      doc.setFontSize(16);
      doc.text(`Dashboard: ${row?.displayName || "-"}`, 14, 15);

      doc.setFontSize(12);
      doc.text(
        `Period: ${value?.startDate ? value.startDate.toLocaleDateString("en-CA") : "-"} - ${value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}`,
        14,
        22,
      );
      doc.text(`Export Date: ${new Date().toLocaleDateString("en-CA")}`, 14, 29);
      doc.text(`Total Visits: ${dashboardStats.totalVisits}`, 14, 36);

      // Get table headers from columns
      const tableHeaders = ["Name", "User Groups", "Organisations", "Access Frequency", "Last Visit"];

      // Prepare table data from rows
      const tableData = rows.map((row) => {
        const userData = row.original;
        const firstName = userData.firstName || "";
        const surname = userData.surname || "";
        const username = userData.username || "";
        const displayName = firstName && surname ? `${firstName} ${surname} (${username})` : username;

        // Format the date for export
        let lastVisitDate = "-";
        if (userData.lastVisit) {
          const date = new Date(userData.lastVisit);
          lastVisitDate = date.toLocaleDateString("en-CA");
        }

        return [
          displayName,
          userData.userGroups?.map((group) => group?.displayName).join(", ") || "",
          userData.organisationUnits?.map((org) => org?.displayName).join(", ") || "",
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
      doc.save(`Dashboard_${row?.displayName || "Export"}_${new Date().toISOString().split("T")[0]}.pdf`);

    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. See console for details.");
    }
  };

  // Handle filtering by top user
  const handleFilterByUser = (username: string) => {
    const table = document.querySelector(".mantine-Table-root");
    if (table) {
      // Find the search input and set its value
      const searchInput = table.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.value = username;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  const table = useMantineReactTable({
    columns,
    data: safeLinkedUsers,
    state: {
      isLoading: loading,
      columnVisibility: {
        userGroups: false,
        userRoles: false,
      },
    },
    enableFullScreenToggle: false,
    enableHiding: true,
    initialState: {
      sorting: [{ id: "AccessFrequency", desc: true }],
      density: "xs",
      columnPinning: {
        left: ["Name", "AccessFrequency", "lastVisit"],
        right: [],
      },
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    renderEmptyRowsFallback: () => (
      <div className="flex justify-center items-center h-40 text-gray-500">
        {loading
          ? ""
          : hasOrgUnitFilter && linkedUsers.length === 0
            ? "No users from the selected organization units visited this dashboard in the selected period."
            : "No user visit details available."}
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="w-full">
        {/* Compact Dashboard Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1 mb-2 bg-gray-50 rounded border border-gray-200">
          <div className="flex items-center gap-2">
            <Text size="sm" weight={500}>
              Dashboard:
            </Text>
            <Text size="sm">{row?.displayName || "-"}</Text>
          </div>

          <div className="flex items-center gap-2">
            <Text size="sm" weight={500}>
              Period:
            </Text>
            <Text size="sm">
              {value?.startDate ? value.startDate.toLocaleDateString("en-CA") : "-"} -{" "}
              {value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Text size="sm" weight={500}>
              Total Visits:
            </Text>
            <Badge color="blue">{dashboardStats.totalVisits}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Text size="sm" weight={500}>
              <IconUser size={14} className="inline mr-1" />
              Top Users:
            </Text>
            <div className="flex flex-wrap gap-1">
              {dashboardStats.topUsers.map((user, index) => (
                <Badge
                  key={index}
                  size="sm"
                  color="green"
                  className="cursor-pointer hover:bg-green-600"
                  onClick={() => handleFilterByUser(user.username)}
                >
                  {user.firstName && user.surname
                    ? `${user.firstName} ${user.surname} (${user.visits})`
                    : `${user.username} (${user.visits})`}
                </Badge>
              ))}
              {dashboardStats.topUsers.length === 0 && (
                <Text size="xs" color="dimmed">
                  None
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Export and Column Visibility buttons */}
        <Group position="right" spacing="xs" className="px-2">
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0 || loading}
            onClick={() => handleExportXLSX(table.getPrePaginationRowModel().rows)}
            leftIcon={<IconFileSpreadsheet size={18} />}
            color="green"
            variant="filled"
            size="xs"
          >
            Export to Excel
          </Button>
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0 || loading}
            onClick={() => handleExportPDF(table.getPrePaginationRowModel().rows)}
            leftIcon={<IconFile size={18} />}
            color="red"
            variant="filled"
            size="xs"
          >
            Export to PDF
          </Button>
        </Group>
      </div>
    ),
  });

  return (
    <div className="w-full min-h-[85vh] overflow-y-scroll bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6 mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
      <div className="h-[79vh] overflow-y-scroll">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
}
