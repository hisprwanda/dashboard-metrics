"use client";

import type { DateValueType, LinkedUser } from "@/types/dashboard-reportType";
import type { DashboardConverted } from "@/types/dashboardsType";
import { useMemo } from "react";
import { MantineReactTable, type MRT_ColumnDef, useMantineReactTable } from "mantine-react-table";

interface DashboardUserDetailsComponentProps {
  linkedUsers: LinkedUser[];
  row: DashboardConverted;
  value: DateValueType;
  loading: boolean;
}

export default function DashboardUserDetails({ linkedUsers, row, value, loading }: DashboardUserDetailsComponentProps) {
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
        {loading ? "" : "No user visit details available."}
      </div>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
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

