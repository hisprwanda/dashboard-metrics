import {
  AtedBy,
  Dashboard,
  DashboardConverted,
  DashboardItem,
  Visualization,
} from "../../../types/dashboardsType";
import { useDashboardsInfo } from "../../../hooks/dashboards";

import { ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { IconRefresh } from "@tabler/icons-react";
import { capitalizeFirstChar } from "../../../lib/utils";
import TableActions from "./table-actions";

export default function DataTable() {
  const { loading, error, data } = useDashboardsInfo();

  const transformedDashboards: DashboardConverted[] = Array.isArray(
    data?.dashboards?.dashboards
  )
    ? data.dashboards.dashboards.map((dashboard) => {
        const visualizations: Visualization[] = dashboard.dashboardItems
          .filter(
            (item) =>
              item.visualization &&
              item.visualization.id &&
              item.visualization.displayName
          )
          .map((item) => ({
            id: item?.visualization?.id as string,
            displayName: item?.visualization?.displayName as string,
          }));

        return {
          name: dashboard.name as string,
          created: new Date(dashboard.created),
          lastUpdated: new Date(dashboard.lastUpdated),
          createdBy: dashboard.createdBy as AtedBy,
          lastUpdatedBy: dashboard.lastUpdatedBy as AtedBy,
          displayName: dashboard.displayName as string,
          favorite: dashboard.favorite as boolean,
          id: dashboard.id as string,
          visualizations,
        };
      })
    : [];

  const columns = useMemo<MRT_ColumnDef<DashboardConverted>[]>(
    () => [
      {
        accessorFn: (row) => {
          return row?.name;
        },
        header: "Name",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return capitalizeFirstChar(row?.favorite?.toString());
        },
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
        accessorFn: (row) => {
          return row?.createdBy?.displayName;
        },
        header: "createdBy",
        size: 40,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: transformedDashboards,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    initialState: {
      sorting: [{ id: "Instance", desc: false }],
      density: "xs",
      columnPinning: {
        left: ["mrt-row-actions"],
        right: ["type"],
      },
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <TableActions row={row.original} data={transformedDashboards} />
    ),
    state: {
      isLoading: loading,
    },
  });

  return (
    <>
      <MantineReactTable table={table} />
    </>
  );
}
