// file location: src/pages/user-engagement/components/data-table.tsx

import { useMemo, useState } from "react";

import {
  DataTable as DHIS2DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  DataTableColumnHeader,
  Tag,
  CircularLoader,
} from "@dhis2/ui";
import { differenceInDays, format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import i18n from "../../../locales";
import type { UserEngagementData } from "../types/user-engagement";

import { FilterSection } from "./filter-section";
import { SummaryCards } from "./summary-cards";

// Map DHIS2 user data to our table format
const mapUserToTableData = (user: unknown): UserEngagementData => {
  // Type guard to ensure user is an object
  if (!user || typeof user !== "object") {
    throw new Error("User data cannot be null or undefined");
  }

  const userObj = user as Record<string, unknown>;

  // Extract last login date (if any)
  const userCredentials = userObj.userCredentials as
    | Record<string, unknown>
    | undefined;
  const lastLoginTimestamp = userCredentials?.lastLogin;
  const lastLoginDate = lastLoginTimestamp
    ? new Date(lastLoginTimestamp as string)
    : null;

  // Calculate days since last login
  const daysSinceLastLogin = lastLoginDate
    ? differenceInDays(new Date(), lastLoginDate)
    : null;

  // Extract role information
  const roles =
    (userCredentials?.userRoles as Array<{ displayName: string }>) || [];
  const role = roles.length > 0 ? roles[0].displayName : "Unknown";

  // Retrieve login metrics from the processed data
  const loginPastMonth = (userObj.loginPastMonth as number) || 0;
  const loginTrend = (userObj.loginTrend as number[]) || [0, 0, 0];
  const accessRecency = (userObj.accessRecency as string) || "never";

  // Create email if not available
  const username = userCredentials?.username as string | undefined;
  const email = (userObj.email as string) || `${username}@example.org`;

  return {
    id: userObj.id as string,
    username: username || "Unknown",
    fullName: (userObj.displayName as string) || "Unknown",
    email,
    role,
    loginPastMonth,
    loginTrend,
    lastLogin: lastLoginDate,
    daysSinceLastLogin,
    accessRecency,
    userGroups: Array.isArray(userObj.userGroups)
      ? (userObj.userGroups as Array<{ displayName: string }>)
      : [],
    organisationUnits: Array.isArray(userObj.organisationUnits)
      ? (userObj.organisationUnits as Array<{ displayName: string }>)
      : [],
  };
};

// Component to display login trend visually
function LoginTrendDisplay({ trend }: { trend: number[] }) {
  const normalizedTrend = trend.map((val) => Math.min(val, 30)); // Cap at 30 for display
  const maxValue = Math.max(...normalizedTrend, 5); // Ensure minimum scale

  return (
    <div className="flex items-end h-8 gap-1">
      {normalizedTrend.map((value, index) => {
        const height = (value / maxValue) * 100;
        const tooltipLabel = `Month ${3 - index}: ${value} logins`;

        // Use fixed color classes instead of dynamic ones
        const getColorClass = (value: number) => {
          if (value > 20) return "bg-blue-700";
          if (value > 15) return "bg-blue-600";
          if (value > 10) return "bg-blue-500";
          if (value > 5) return "bg-blue-400";
          return "bg-blue-300";
        };

        return (
          <div
            key={index}
            title={tooltipLabel}
            className={`w-5 ${getColorClass(value)} rounded-sm`}
            style={{ height: `${height}%`, minHeight: "4px" }}
          />
        );
      })}
    </div>
  );
}

// Component to display access recency status
function AccessRecencyBadge({ recency }: { recency: string }) {
  switch (recency) {
    case "lastWeek":
      return <Tag positive>{i18n.t("Last 7 days")}</Tag>;
    case "lastMonth":
      return <Tag neutral>{i18n.t("Last 30 days")}</Tag>;
    case "overMonth":
      return <Tag warning>{i18n.t("Over 30 days")}</Tag>;
    case "never":
      return <Tag negative>{i18n.t("Never")}</Tag>;
    default:
      return <Tag>{i18n.t("Unknown")}</Tag>;
  }
}

export default function DataTable() {
  // State to hold the filtered user data
  const [userData, setUserData] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "loginPastMonth", desc: true },
  ]);

  // Transform API data into table format
  const tableData = useMemo<UserEngagementData[]>(
    () => userData.filter((user) => user != null).map(mapUserToTableData),
    [userData]
  );

  // Handler for user data updates from filter component
  const handleUserDataChange = (newUserData: unknown[]) => {
    setUserData(newUserData);
  };

  // Handler for loading state changes
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Define columns for the table
  const columns = useMemo<ColumnDef<UserEngagementData>[]>(
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
        size: 130,
      },
      {
        accessorFn: (row) => row.lastLogin,
        id: "lastLogin",
        header: i18n.t("Last Login"),
        cell: ({ getValue }) => {
          const value = getValue<Date | null>();
          return value ? format(value, "yyyy-MM-dd") : i18n.t("Never");
        },
        size: 120,
      },
      {
        accessorKey: "loginPastMonth",
        id: "loginPastMonth",
        header: i18n.t("Login Frequency (Past Month)"),
        cell: ({ getValue }) => {
          const value = getValue<number>();
          return value > 0 ? (
            <Tag positive={value > 15} neutral={value > 5 && value <= 15}>
              {value} {i18n.t("logins")}
            </Tag>
          ) : (
            <Tag negative>0 {i18n.t("logins")}</Tag>
          );
        },
        size: 160,
      },
      {
        accessorKey: "loginTrend",
        id: "loginTrend",
        header: i18n.t("Login Trend (3 Months)"),
        cell: ({ getValue }) => {
          const value = getValue<number[]>();
          return <LoginTrendDisplay trend={value} />;
        },
        enableSorting: false,
        size: 140,
      },
      {
        accessorKey: "accessRecency",
        id: "accessRecency",
        header: i18n.t("Access Recency"),
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return <AccessRecencyBadge recency={value} />;
        },
        size: 140,
      },
      {
        accessorFn: (row) =>
          row.organisationUnits?.map((ou) => ou.displayName).join(", ") ||
          i18n.t("N/A"),
        id: "organisationUnits",
        header: i18n.t("Organisation Units"),
        cell: ({ getValue }) => {
          const value = getValue<string>();
          return (
            <div className="truncate max-w-[200px]" title={value}>
              {value}
            </div>
          );
        },
        size: 200,
      },
    ],
    []
  );

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
      <FilterSection
        onUserDataChange={handleUserDataChange}
        onLoadingChange={handleLoadingChange}
      />

      {/* Summary Cards - only show when data is available */}
      {tableData.length > 0 && <SummaryCards data={tableData} />}

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
                      {userData.length === 0
                        ? i18n.t(
                            "Select a user group to view user engagement data"
                          )
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
      </div>
    </div>
  );
}
