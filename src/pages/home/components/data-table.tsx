// file location: src/pages/home/components/data-table.tsx

import { useCallback, useMemo } from "react";

import type { MRT_ColumnDef, MRT_Row, MRT_TableOptions } from "mantine-react-table";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

import { useDashboardsInfo } from "../../../hooks/dashboards";
import { capitalizeFirstChar } from "../../../lib/utils";
import type { DashboardConverted, Visualization } from "../../../types/dashboardsType";

import TableActions from "./table-actions";

const TABLE_INITIAL_STATE = {
  sorting: [{ id: "created", desc: false }],
  density: "xs" as const,
  columnPinning: {
    left: ["mrt-row-actions"],
    right: ["type"],
  },
};

const TABLE_CONTAINER_PROPS = {
  sx: {
    minHeight: "300px",
  },
} as const;

export default function DataTable() {
  const { loading, data } = useDashboardsInfo();

  const dashboards = data?.dashboards?.dashboards;

  const transformedDashboards = useMemo<DashboardConverted[]>(() => {
    if (!Array.isArray(dashboards)) {
      return [];
    }

    return dashboards.map((dashboard) => {
      const visualizations: Visualization[] = dashboard.dashboardItems
        .filter((item) => item.visualization?.id && item.visualization.displayName)
        .map((item) => ({
          id: item?.visualization?.id as string,
          displayName: item?.visualization?.displayName as string,
        }));

      return {
        name: dashboard.name,
        created: new Date(dashboard.created),
        lastUpdated: new Date(dashboard.lastUpdated),
        createdBy: dashboard.createdBy,
        lastUpdatedBy: dashboard.lastUpdatedBy,
        displayName: dashboard.displayName,
        favorite: dashboard.favorite as boolean,
        id: dashboard.id,
        visualizations,
      };
    });
  }, [dashboards]);

  const columns = useMemo<MRT_ColumnDef<DashboardConverted>[]>(
    () => [
      {
        accessorFn: (row) => row?.name,
        header: "Name",
        size: 40,
      },

      {
        accessorFn: (row) => capitalizeFirstChar(row?.favorite?.toString()),
        header: "Isfavorite",
        size: 40,
      },

      {
        accessorFn: (row) => {
          const sDay = new Date(row.created);
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        id: "created",
        header: "created",
        filterVariant: "date-range",
        sortingFn: "datetime",
        enableColumnFilterModes: false,
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString("en-CA"),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        size: 50,
      },

      {
        accessorFn: (row) => row?.createdBy?.displayName,
        header: "createdBy",
        size: 40,
      },
    ],
    []
  );

  const renderRowActions = useCallback(
    ({ row }: { row: MRT_Row<DashboardConverted> }) => (
      <TableActions row={row.original} data={transformedDashboards} />
    ),
    [transformedDashboards]
  );

  const tableOptions = useMemo<MRT_TableOptions<DashboardConverted>>(
    () => ({
      columns,
      data: transformedDashboards,
      enableFullScreenToggle: false,
      enableDensityToggle: false,
      initialState: TABLE_INITIAL_STATE,
      mantineTableContainerProps: TABLE_CONTAINER_PROPS,
      enableRowActions: true,
      renderRowActions,
      state: {
        isLoading: loading,
      },
    }),
    [columns, transformedDashboards, loading, renderRowActions]
  );

  const table = useMantineReactTable(tableOptions);

  return <MantineReactTable table={table} />;
}
