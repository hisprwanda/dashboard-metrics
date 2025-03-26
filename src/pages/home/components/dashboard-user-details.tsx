"use client";

import type { DateValueType, LinkedUser } from "@/types/dashboard-reportType";
import type { DashboardConverted } from "@/types/dashboardsType";
import { useMemo } from "react";
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable, type MRT_Row } from "mantine-react-table";
import { Button, Group } from "@mantine/core";
import { IconFileSpreadsheet, IconFile } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface DashboardUserDetailsComponentProps {
  linkedUsers: LinkedUser[];
  row: DashboardConverted;
  value: DateValueType;
  loading: boolean;
  hasOrgUnitFilter: boolean;
}

export default function DashboardUserDetails({
  linkedUsers,
  row,
  value,
  loading,
  hasOrgUnitFilter = false,
}: DashboardUserDetailsComponentProps) {
  // Ensure we have a safe default for linkedUsers when data is loading
  const safeLinkedUsers = loading ? [] : linkedUsers;

  const columns = useMemo<MRT_ColumnDef<LinkedUser>[]>(
    () => [
      {
        accessorFn: (row) => {
          return row?.username || "";
        },
        header: "Name",
        size: 40,
      },
      {
        accessorFn: (row) => {
          return row?.userCredentials?.userRoles?.map((role) => role?.displayName).join(", ") || "";
        },
        header: "Roles",
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
          return row?.organisationUnits?.map((org) => org?.displayName).join(", ") || "";
        },
        id: "organisations",
        header: "Organisations",
        size: 40,
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
    ],
    [],
  );

  // Function to prepare data for export
  const prepareDataForExport = (rows: MRT_Row<LinkedUser>[]) => {
    return rows.map((row) => {
      const userData = row.original;

      // Format the date for export
      let lastVisitDate = "-";
      if (userData.lastVisit) {
        const date = new Date(userData.lastVisit);
        lastVisitDate = date.toLocaleDateString("en-CA");
      }

      return {
        Name: userData.username || "",
        Roles: userData.userCredentials?.userRoles?.map((role) => role?.displayName).join(", ") || "",
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

      // Get table headers from columns
      const tableHeaders = ["Name", "Roles", "User Groups", "Organisations", "Access Frequency", "Last Visit"];

      // Prepare table data from rows
      const tableData = rows.map((row) => {
        const userData = row.original;

        // Format the date for export
        let lastVisitDate = "-";
        if (userData.lastVisit) {
          const date = new Date(userData.lastVisit);
          lastVisitDate = date.toLocaleDateString("en-CA");
        }

        return [
          userData.username || "",
          userData.userCredentials?.userRoles?.map((role) => role?.displayName).join(", ") || "",
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
        startY: 35,
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 50 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
        },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [242, 242, 242] },
      });

      // Save PDF
      doc.save(`Dashboard_${row?.displayName || "Export"}_${new Date().toISOString().split("T")[0]}.pdf`);

      console.log("PDF export completed successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. See console for details.");
    }
  };

  const table = useMantineReactTable({
    columns,
    data: safeLinkedUsers,
    state: {
      isLoading: loading,
    },
    enableFullScreenToggle: false,
    initialState: {
      sorting: [{ id: "AccessFrequency", desc: true }], // Sort by access frequency by default
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
      <div className="flex flex-col w-full gap-2">
        <div className="content-start flex flex-row gap-10">
          <div className="w-6/12 p-4">
            <ul>
              <li className="flex justify-between py-2 border-b-2 border-indigo-200">
                <span className="font-semibold">Dashboard : &nbsp;&nbsp;</span>
                <span> {row?.displayName || "-"} </span>
              </li>
            </ul>
          </div>

          <div className="w-6/12 p-4">
            <ul>
              <li className="flex justify-between py-2 border-b-2 border-indigo-200">
                <span className="font-semibold">Period : &nbsp;&nbsp;</span>
                <span>
                  {value?.startDate ? value.startDate.toLocaleDateString("en-CA") : "-"} -{" "}
                  {value?.endDate ? value.endDate.toLocaleDateString("en-CA") : "-"}{" "}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Export buttons */}
        <Group position="right" spacing="xs" className="px-4">
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0 || loading}
            onClick={() => handleExportXLSX(table.getPrePaginationRowModel().rows)}
            leftIcon={<IconFileSpreadsheet size={18} />}
            color="green"
            variant="filled"
            size="sm"
          >
            Export All to Excel
          </Button>
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0 || loading}
            onClick={() => handleExportPDF(table.getPrePaginationRowModel().rows)}
            leftIcon={<IconFile size={18} />}
            color="red"
            variant="filled"
            size="sm"
          >
            Export All to PDF
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

