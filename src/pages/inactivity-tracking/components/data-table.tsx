// file location: src/pages/inactivity-tracking/components/data-table.tsx

import { useCallback, useMemo, useState } from "react";

import { Skeleton } from "@mantine/core";
import { differenceInDays, format } from "date-fns";
import type { MRT_ColumnDef, MRT_TableOptions } from "mantine-react-table";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

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
}

// Map DHIS2 user data to our table format
const mapUserToTableData = (user: FilteredUser): InactivityData => {
  // Extract last login date (if any)
  const lastLoginTimestamp = user.userCredentials?.lastLogin;
  const lastLoginDate = lastLoginTimestamp ? new Date(lastLoginTimestamp) : null;

  // Calculate days since last login
  const daysSinceLastLogin = lastLoginDate ? differenceInDays(new Date(), lastLoginDate) : null;

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

  // Get assigned dashboards count (this would need to be implemented with real data)
  // For now using a placeholder value based on user groups count
  const assignedDashboards = user.userGroups?.length || 0;

  return {
    id: user.id,
    username: user.userCredentials?.username || "Unknown",
    fullName: user.displayName || "Unknown",
    role,
    lastLoginDate,
    daysSinceLastLogin,
    activeStatus,
    assignedDashboards,
  };
};

const TABLE_INITIAL_STATE = {
  sorting: [{ id: "daysSinceLastLogin", desc: true }],
  density: "xs" as const,
};

const TABLE_CONTAINER_PROPS = {
  sx: {
    minHeight: "300px",
  },
} as const;

export default function DataTable() {
  // State to hold the filtered user data
  const [userData, setUserData] = useState<FilteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Transform API data into table format
  const tableData = useMemo<InactivityData[]>(() => userData.map(mapUserToTableData), [userData]);

  // Handler for user data updates from filter component
  const handleUserDataChange = useCallback((newUserData: FilteredUser[]) => {
    setUserData(newUserData);
  }, []);

  // Handler for loading state changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  // Define columns for the table
  const columns = useMemo<MRT_ColumnDef<InactivityData>[]>(
    () => [
      {
        accessorKey: "username",
        header: i18n.t("Username"),
        size: 120,
      },
      {
        accessorKey: "fullName",
        header: i18n.t("Full Name"),
        size: 150,
      },
      {
        accessorKey: "role",
        header: i18n.t("Role"),
        size: 150,
      },
      {
        accessorFn: (row) => row.lastLoginDate,
        id: "lastLoginDate",
        header: i18n.t("Last Login"),
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const value = cell.getValue<Date | null>();
          return value ? format(value, "yyyy-MM-dd") : i18n.t("Never");
        },
        size: 120,
      },
      {
        accessorKey: "daysSinceLastLogin",
        header: i18n.t("Days Inactive"),
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
          return value !== null ? value : i18n.t("N/A");
        },
        size: 120,
      },
      {
        accessorKey: "activeStatus",
        header: i18n.t("Status"),
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
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
        header: i18n.t("Dashboards"),
        size: 100,
      },
    ],
    []
  );

  const renderEmptyRowsFallback = useCallback(
    () => (
      <div className="p-4 text-center">
        {userData.length === 0
          ? i18n.t("Select a user group to view user data")
          : i18n.t("No matching records found")}
      </div>
    ),
    [userData.length]
  );

  const renderTopToolbarCustomActions = useCallback(
    () => (
      <div className="ml-2">
        {userData.length > 0 && (
          <div className="text-sm">
            <span className="font-semibold mr-1">{i18n.t("Users found")}:</span>
            {isLoading ? (
              <Skeleton height={18} width={30} radius="xl" />
            ) : (
              <span>{userData.length}</span>
            )}
          </div>
        )}
      </div>
    ),
    [isLoading, userData.length]
  );

  const tableOptions = useMemo<MRT_TableOptions<InactivityData>>(
    () => ({
      columns,
      data: tableData,
      enableFullScreenToggle: false,
      enableDensityToggle: false,
      initialState: TABLE_INITIAL_STATE,
      mantineTableContainerProps: TABLE_CONTAINER_PROPS,
      state: {
        isLoading,
      },
      renderEmptyRowsFallback,
      renderTopToolbarCustomActions,
    }),
    [columns, tableData, isLoading, renderEmptyRowsFallback, renderTopToolbarCustomActions]
  );

  const table = useMantineReactTable(tableOptions);

  return (
    <div className="mb-9">
      {/* Filters */}
      <FilterSection
        onUserDataChange={handleUserDataChange}
        onLoadingChange={handleLoadingChange}
      />

      {/* Table */}
      <div className="bg-white shadow-sm">
        <MantineReactTable table={table} />
      </div>
    </div>
  );
}
