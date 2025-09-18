// file location: src/pages/inactivity-tracking/components/data-table.tsx

import { useCallback, useMemo, useState } from "react";

import { Skeleton } from "@mantine/core";
import { differenceInDays, format } from "date-fns";
import type { MRT_ColumnDef, MRT_TableOptions } from "mantine-react-table";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

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
  let activeStatus = "Active";
  if (!lastLoginDate) {
    activeStatus = "Critical"; // Never logged in
  } else if (daysSinceLastLogin && daysSinceLastLogin > 90) {
    activeStatus = "Critical"; // Over 90 days
  } else if (daysSinceLastLogin && daysSinceLastLogin > 60) {
    activeStatus = "Inactive"; // 60-90 days
  } else if (daysSinceLastLogin && daysSinceLastLogin > 30) {
    activeStatus = "Warning"; // 30-60 days
  }

  // Extract role information
  const roles = user.userCredentials?.userRoles || [];
  const role = roles.length > 0 ? roles[0].displayName : "Unknown";

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
        header: "Username",
        size: 120,
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        size: 150,
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 150,
      },
      {
        accessorFn: (row) => row.lastLoginDate,
        id: "lastLoginDate",
        header: "Last Login",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const value = cell.getValue<Date | null>();
          return value ? format(value, "yyyy-MM-dd") : "Never";
        },
        size: 120,
      },
      {
        accessorKey: "daysSinceLastLogin",
        header: "Days Inactive",
        Cell: ({ cell }) => {
          const value = cell.getValue<number | null>();
          return value !== null ? value : "N/A";
        },
        size: 120,
      },
      {
        accessorKey: "activeStatus",
        header: "Status",
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          let color = "";
          switch (value) {
            case "Active":
              color = "green";
              break;
            case "Warning":
              color = "orange";
              break;
            case "Inactive":
              color = "red";
              break;
            case "Critical":
              color = "darkred";
              break;
          }
          return <span style={{ color }}>{value}</span>;
        },
        size: 100,
      },
      {
        accessorKey: "assignedDashboards",
        header: "Dashboards",
        size: 100,
      },
    ],
    []
  );

  const renderEmptyRowsFallback = useCallback(
    () => (
      <div className="p-4 text-center">
        {userData.length === 0
          ? "Select a user group to view user data"
          : "No matching records found"}
      </div>
    ),
    [userData.length]
  );

  const renderTopToolbarCustomActions = useCallback(
    () => (
      <div className="ml-2">
        {userData.length > 0 && (
          <div className="text-sm">
            <span className="font-semibold mr-1">Users found:</span>
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
