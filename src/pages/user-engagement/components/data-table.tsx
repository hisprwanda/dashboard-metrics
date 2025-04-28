// file location: src/pages/user-engagement/components/data-table.tsx

import { useMemo } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import TableActions from "./table-actions";

// Define the type for our user engagement data
interface UserEngagement {
  id: string;
  username: string;
  email: string;
  lastLogin: Date;
  sessionCount: number;
  averageSessionDuration: number;
  favoriteViews: string[];
  role: string;
}

// Dummy data for user engagement
const dummyData: UserEngagement[] = [
  {
    id: "1",
    username: "admin_user",
    email: "admin@example.org",
    lastLogin: new Date("2025-04-20"),
    sessionCount: 128,
    averageSessionDuration: 42.5,
    favoriteViews: ["Immunization Coverage", "Facility Reporting"],
    role: "System Administrator",
  },
  {
    id: "2",
    username: "data_manager",
    email: "data.manager@example.org",
    lastLogin: new Date("2025-04-22"),
    sessionCount: 85,
    averageSessionDuration: 37.2,
    favoriteViews: ["Data Quality", "Data Entry"],
    role: "Data Manager",
  },
  {
    id: "3",
    username: "district_user",
    email: "district@example.org",
    lastLogin: new Date("2025-04-23"),
    sessionCount: 64,
    averageSessionDuration: 28.9,
    favoriteViews: ["District Summary", "Performance Indicators"],
    role: "District Officer",
  },
  {
    id: "4",
    username: "facility_user",
    email: "facility@example.org",
    lastLogin: new Date("2025-04-15"),
    sessionCount: 32,
    averageSessionDuration: 18.5,
    favoriteViews: ["Facility Dashboard", "Stock Levels"],
    role: "Facility Staff",
  },
  {
    id: "5",
    username: "program_manager",
    email: "program@example.org",
    lastLogin: new Date("2025-04-24"),
    sessionCount: 76,
    averageSessionDuration: 45.1,
    favoriteViews: ["Program Overview", "Indicator Tracking"],
    role: "Program Manager",
  },
];

export default function DataTable() {
  // Define columns for the table
  const columns = useMemo<MRT_ColumnDef<UserEngagement>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 200,
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 150,
      },
      {
        accessorFn: (row) => row.lastLogin,
        id: "lastLogin",
        header: "Last Login",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString("en-CA"),
        size: 150,
      },
      {
        accessorKey: "sessionCount",
        header: "Total Sessions",
        size: 120,
      },
      {
        accessorKey: "averageSessionDuration",
        header: "Avg Session (min)",
        Cell: ({ cell }) => `${cell.getValue<number>().toFixed(1)} min`,
        size: 150,
      },
      {
        accessorFn: (row) => row.favoriteViews.join(", "),
        header: "Favorite Views",
        size: 200,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: dummyData,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      sorting: [{ id: "lastLogin", desc: true }],
      density: "xs",
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <TableActions row={row.original} />
    ),
  });

  return (
    <>
      <MantineReactTable table={table} />
    </>
  );
}