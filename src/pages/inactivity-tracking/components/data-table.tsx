// file location: src/pages/inactivity-tracking/components/data-table.tsx

import { useCallback, useMemo, useState } from "react";

import {
  DataTable as DHIS2DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableColumnHeader,
  CircularLoader,
  Pagination,
} from "@dhis2/ui";
import { differenceInDays, format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";

import i18n from "../../../locales";
import { FilterSection, type FilteredUser } from "./filter-section";

// Define the type for inactivity tracking data
interface InactivityData {
  id: string;
  username: string;
  fullName: string;
  role: string;
  lastLoginDate: Date | null;
  daysSinceLastLogin: number | null;
  activeStatus: string;
  assignedDashboards: number;
  lastDashboardAccess: Date | null;
  daysSinceDashboardAccess: number | null;
  dashboardAccessCount: number;
}

// Map DHIS2 user data to our table format
const mapUserToTableData = (user: FilteredUser): InactivityData => {
  // Extract last login date (if any)
  const lastLoginTimestamp = user.userCredentials?.lastLogin;
  const lastLoginDate = lastLoginTimestamp
    ? new Date(lastLoginTimestamp)
    : null;

  // Calculate days since last login
  const daysSinceLastLogin = lastLoginDate
    ? differenceInDays(new Date(), lastLoginDate)
    : null;

  // Determine active status based on login date
  let activeStatus = i18n.t("Active");
  if (!lastLoginDate) {
    activeStatus = i18n.t("Critical"); // Never logged in
  } else if (daysSinceLastLogin && daysSinceLastLogin > 90) {
    activeStatus = i18n.t("Critical"); // Over 90 days
  } else if (daysSinceLastLogin && daysSinceLastLogin > 60) {
    activeStatus = i18n.t("Inactive"); // 60-90 days
  } else if (daysSinceLastLogin && daysSinceLastLogin > 30) {
    activeStatus = i18n.t("Warning"); // 30-60 days
  }

  // Extract role information
  const roles = user.userCredentials?.userRoles || [];
  const role = roles.length > 0 ? roles[0].displayName : i18n.t("Unknown");

  // Get assigned dashboards count (approximated from user groups)
  const assignedDashboards = user.userGroups?.length || 0;

  // Dashboard access fields populated from analytics when dashboards are selected
  const lastDashboardAccess = user.lastDashboardAccess
    ? new Date(user.lastDashboardAccess)
    : null;
  const dashboardAccessCount = user.dashboardAccessCount ?? 0;
  const daysSinceDashboardAccess = lastDashboardAccess
    ? differenceInDays(new Date(), lastDashboardAccess)
    : null;

  return {
    id: user.id,
    username: user.userCredentials?.username || "Unknown",
    fullName: user.displayName || "Unknown",
    role,
    lastLoginDate,
    daysSinceLastLogin,
    activeStatus,
    assignedDashboards,
    lastDashboardAccess,
    daysSinceDashboardAccess,
    dashboardAccessCount,
  };
};

export default function DataTable() {
  // State to hold the filtered user data
  const [userData, setUserData] = useState<FilteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "daysSinceLastLogin", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Transform API data into table format
  const tableData = useMemo<InactivityData[]>(
    () => userData.map(mapUserToTableData),
    [userData]
  );

  // Handler for user data updates from filter component
  const handleUserDataChange = useCallback((newUserData: FilteredUser[]) => {
    setUserData(newUserData);
  }, []);

  // Handler for loading state changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // Define columns for the table
  const columns = useMemo<ColumnDef<InactivityData>[]>(
    () => [
      {
        accessorKey: "username",
        id: "username",
        header: i18n.t("Username"),
        size: 120,
      },
      {
        accessorKey: "fullName",
        id: "fullName",
        header: i18n.t("Full Name"),
        size: 150,
      },
      {
        accessorKey: "role",
        id: "role",
        header: i18n.t("Role"),
        size: 150,
      },
      {
        accessorFn: (row) => row.lastLoginDate,
        id: "lastLoginDate",
        header: i18n.t("Last Login"),
        cell: ({ getValue }) => {
          const value = getValue<Date | null>();
          return value ? format(value, "yyyy-MM-dd") : i18n.t("Never");
        },
        size: 120,
      },
      {
        accessorKey: "daysSinceLastLogin",
        id: "daysSinceLastLogin",
        header: i18n.t("Days Inactive"),
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return value !== null ? value : i18n.t("N/A");
        },
        size: 120,
      },
      {
        accessorKey: "activeStatus",
        id: "activeStatus",
        header: i18n.t("Status"),
        cell: ({ getValue }) => {
          const value = getValue<string>();
          let color = "";
          switch (value) {
            case i18n.t("Active"):
              color = "green";
              break;
            case i18n.t("Warning"):
              color = "orange";
              break;
            case i18n.t("Inactive"):
              color = "red";
              break;
            case i18n.t("Critical"):
              color = "darkred";
              break;
          }
          return <span style={{ color }}>{value}</span>;
        },
        size: 100,
      },
      {
        accessorKey: "assignedDashboards",
        id: "assignedDashboards",
        header: i18n.t("Dashboards"),
        size: 100,
      },
      {
        accessorFn: (row) => row.lastDashboardAccess,
        id: "lastDashboardAccess",
        header: i18n.t("Last Dashboard Access"),
        cell: ({ getValue }) => {
          const value = getValue<Date | null>();
          return value ? format(value, "yyyy-MM-dd") : i18n.t("Never");
        },
        size: 150,
      },
      {
        accessorKey: "dashboardAccessCount",
        id: "dashboardAccessCount",
        header: i18n.t("Dashboard Accesses"),
        size: 120,
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="mb-9">
      {/* Filters */}
      <FilterSection
        onUserDataChange={handleUserDataChange}
        onLoadingChange={handleLoadingChange}
      />

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
                  <DataTableCell colSpan={String(columns.length)}>
                    <div className="p-4 text-center">
                      {userData.length === 0
                        ? i18n.t("Select a user group to view user data")
                        : i18n.t("No matching records found")}
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
          </DHIS2DataTable>
        )}

        {/* Pagination */}
        {table.getFilteredRowModel().rows.length > 0 && !isLoading && (
          <div className="mt-4 mb-8">
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
