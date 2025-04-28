// file location: src/pages/district-engagement/components/data-table.tsx

import { useMemo } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import TableActions from "./table-actions";

// Define the type for district engagement data
interface DistrictEngagement {
  id: string;
  districtName: string;
  region: string;
  activeUsers: number;
  lastActivity: Date;
  dashboardViews: number;
  reportCompletionRate: number;
  favoriteDashboards: string[];
}

// Dummy data for district engagement
const dummyData: DistrictEngagement[] = [
  {
    id: "1",
    districtName: "Central District",
    region: "Northern",
    activeUsers: 24,
    lastActivity: new Date("2025-04-23"),
    dashboardViews: 356,
    reportCompletionRate: 92.5,
    favoriteDashboards: ["District Overview", "Facility Performance"],
  },
  {
    id: "2",
    districtName: "Eastern District",
    region: "Eastern",
    activeUsers: 18,
    lastActivity: new Date("2025-04-22"),
    dashboardViews: 287,
    reportCompletionRate: 88.3,
    favoriteDashboards: ["Immunization Coverage", "Maternal Health"],
  },
  {
    id: "3",
    districtName: "Western Heights",
    region: "Western",
    activeUsers: 21,
    lastActivity: new Date("2025-04-24"),
    dashboardViews: 312,
    reportCompletionRate: 95.2,
    favoriteDashboards: ["Disease Surveillance", "Resource Allocation"],
  },
  {
    id: "4",
    districtName: "Southern Plains",
    region: "Southern",
    activeUsers: 15,
    lastActivity: new Date("2025-04-20"),
    dashboardViews: 198,
    reportCompletionRate: 82.7,
    favoriteDashboards: ["Health Indicators", "Facility Reporting"],
  },
  {
    id: "5",
    districtName: "Coastal Region",
    region: "Eastern",
    activeUsers: 19,
    lastActivity: new Date("2025-04-21"),
    dashboardViews: 243,
    reportCompletionRate: 90.1,
    favoriteDashboards: ["Stock Management", "Staff Performance"],
  },
];

export default function DataTable() {
  // Define columns for the table
  const columns = useMemo<MRT_ColumnDef<DistrictEngagement>[]>(
    () => [
      {
        accessorKey: "districtName",
        header: "District",
        size: 150,
      },
      {
        accessorKey: "region",
        header: "Region",
        size: 120,
      },
      {
        accessorKey: "activeUsers",
        header: "Active Users",
        size: 120,
      },
      {
        accessorFn: (row) => row.lastActivity,
        id: "lastActivity",
        header: "Last Activity",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString("en-CA"),
        size: 150,
      },
      {
        accessorKey: "dashboardViews",
        header: "Dashboard Views",
        size: 150,
      },
      {
        accessorKey: "reportCompletionRate",
        header: "Report Completion",
        Cell: ({ cell }) => `${cell.getValue<number>().toFixed(1)}%`,
        size: 150,
      },
      {
        accessorFn: (row) => row.favoriteDashboards.join(", "),
        header: "Popular Dashboards",
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
      sorting: [{ id: "reportCompletionRate", desc: true }],
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