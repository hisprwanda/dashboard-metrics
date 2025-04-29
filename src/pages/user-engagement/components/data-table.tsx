// file location: src/pages/user-engagement/components/data-table.tsx

import { useMemo, useState } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { format, differenceInDays } from "date-fns";
import { Badge, Tooltip } from '@mantine/core';
import { FilterSection } from "./filter-section";
import { SummaryCards } from "./summary-cards";
import { UserEngagementData } from "../types/user-engagement";

// Map DHIS2 user data to our table format
const mapUserToTableData = (user: any): UserEngagementData => {
  // Extract last login date (if any)
  const lastLoginTimestamp = user.userCredentials?.lastLogin;
  const lastLoginDate = lastLoginTimestamp ? new Date(lastLoginTimestamp) : null;

  // Calculate days since last login
  const daysSinceLastLogin = lastLoginDate
    ? differenceInDays(new Date(), lastLoginDate)
    : null;

  // Extract role information
  const roles = user.userCredentials?.userRoles || [];
  const role = roles.length > 0 ? roles[0].displayName : "Unknown";

  // Retrieve login metrics from the processed data
  const loginPastMonth = user.loginPastMonth || 0;
  const loginTrend = user.loginTrend || [0, 0, 0];
  const accessRecency = user.accessRecency || 'never';

  // Create email if not available
  const email = user.email || `${user.userCredentials?.username}@example.org`;

  return {
    id: user.id,
    username: user.userCredentials?.username || "Unknown",
    fullName: user.displayName || "Unknown",
    email,
    role,
    loginPastMonth,
    loginTrend,
    lastLogin: lastLoginDate,
    daysSinceLastLogin,
    accessRecency,
    userGroups: user.userGroups || [],
    organisationUnits: user.organisationUnits || []
  };
};

// Component to display login trend visually
const LoginTrendDisplay = ({ trend }: { trend: number[]; }) => {
  const normalizedTrend = trend.map(val => Math.min(val, 30)); // Cap at 30 for display
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
          <Tooltip key={index} label={tooltipLabel}>
            <div
              className={`w-5 ${getColorClass(value)} rounded-sm`}
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
          </Tooltip>
        );
      })}
    </div>
  );
};

// Component to display access recency status
const AccessRecencyBadge = ({ recency }: { recency: string; }) => {
  switch (recency) {
    case 'lastWeek':
      return <Badge color="green">Last 7 days</Badge>;
    case 'lastMonth':
      return <Badge color="blue">Last 30 days</Badge>;
    case 'overMonth':
      return <Badge color="orange">Over 30 days</Badge>;
    case 'never':
      return <Badge color="red">Never</Badge>;
    default:
      return <Badge color="gray">Unknown</Badge>;
  }
};

export default function DataTable() {
  // State to hold the filtered user data
  const [userData, setUserData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Transform API data into table format
  const tableData = useMemo<UserEngagementData[]>(
    () => userData.map(mapUserToTableData),
    [userData]
  );

  // Handler for user data updates from filter component
  const handleUserDataChange = (newUserData: any[]) => {
    setUserData(newUserData);
  };

  // Handler for loading state changes
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Define columns for the table
  const columns = useMemo<MRT_ColumnDef<UserEngagementData>[]>(
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
        size: 130,
      },
      {
        accessorFn: (row) => row.lastLogin,
        id: "lastLogin",
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
        accessorKey: "loginPastMonth",
        header: "Login Frequency (Past Month)",
        Cell: ({ cell }) => {
          const value = cell.getValue<number>();
          return value > 0 ? (
            <Badge color={value > 15 ? "green" : value > 5 ? "blue" : "gray"}>
              {value} logins
            </Badge>
          ) : (
            <Badge color="red">0 logins</Badge>
          );
        },
        size: 160,
      },
      {
        accessorKey: "loginTrend",
        header: "Login Trend (3 Months)",
        Cell: ({ cell }) => {
          const value = cell.getValue<number[]>();
          return <LoginTrendDisplay trend={value} />;
        },
        enableSorting: false,
        size: 140,
      },
      {
        accessorKey: "accessRecency",
        header: "Access Recency",
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return <AccessRecencyBadge recency={value} />;
        },
        filterVariant: "select",
        filterSelectOptions: [
          { text: 'Last 7 days', value: 'lastWeek' },
          { text: 'Last 30 days', value: 'lastMonth' },
          { text: 'Over 30 days', value: 'overMonth' },
          { text: 'Never', value: 'never' },
        ],
        size: 140,
      },
      {
        accessorFn: (row) => row.organisationUnits.map(ou => ou.displayName).join(", "),
        id: "organisationUnits",
        header: "Organisation Units",
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          return (
            <Tooltip label={value} multiline>
              <div className="truncate max-w-[200px]">{value}</div>
            </Tooltip>
          );
        },
        size: 200,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: tableData,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      sorting: [{ id: "loginPastMonth", desc: true }],
      density: "xs",
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    state: {
      isLoading: isLoading,
    },
    renderEmptyRowsFallback: () => (
      <div className="p-4 text-center">
        {userData.length === 0 ?
          "Select a user group to view user engagement data" :
          "No matching records found"}
      </div>
    ),
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
        <MantineReactTable table={table} />
      </div>
    </div>
  );
}