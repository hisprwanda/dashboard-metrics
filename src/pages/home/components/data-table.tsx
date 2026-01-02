// file location: src/pages/home/components/data-table.tsx

import { useMemo, useState } from "react";

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

import { useDashboardsInfo } from "../../../hooks/dashboards";
import { capitalizeFirstChar } from "../../../lib/utils";
import i18n from "../../../locales";
import type {
  DashboardConverted,
  Visualization,
} from "../../../types/dashboardsType";

import TableActions from "./table-actions";

export default function DataTable() {
  const { loading, data } = useDashboardsInfo();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const dashboards = data?.dashboards?.dashboards;

  const transformedDashboards = useMemo<DashboardConverted[]>(() => {
    if (!Array.isArray(dashboards)) {
      return [];
    }

    return dashboards.map((dashboard) => {
      const visualizations: Visualization[] = dashboard.dashboardItems
        .filter(
          (item) => item.visualization?.id && item.visualization.displayName
        )
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

  const columns = useMemo<ColumnDef<DashboardConverted>[]>(
    () => [
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <TableActions row={row.original} data={transformedDashboards} />
        ),
        size: 60,
        enableSorting: false,
      },
      {
        accessorFn: (row) => row?.name,
        id: "name",
        header: i18n.t("Name"),
        size: 200,
      },
      {
        accessorFn: (row) => capitalizeFirstChar(row?.favorite?.toString()),
        id: "favorite",
        header: i18n.t("Is Favorite"),
        size: 120,
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row.created);
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        id: "created",
        header: i18n.t("Created"),
        cell: ({ getValue }) => {
          const date = getValue<Date>();
          return date?.toLocaleDateString("en-CA") ?? "";
        },
        size: 150,
      },
      {
        accessorFn: (row) => row?.createdBy?.displayName,
        id: "createdBy",
        header: i18n.t("Created By"),
        size: 180,
      },
    ],
    [transformedDashboards]
  );

  const table = useReactTable({
    data: transformedDashboards,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <CircularLoader />
      </div>
    );
  }

  return (
    <div className="w-full">
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
                <div className="text-center py-4 text-gray-500">
                  {i18n.t("No data available")}
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

      {/* Pagination */}
      {table.getFilteredRowModel().rows.length > 0 && (
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
  );
}
