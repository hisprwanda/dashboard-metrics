import { DateValueType, LinkedUser } from "@/types/dashboard-reportType";
import { DashboardConverted } from "@/types/dashboardsType";
import { useMemo } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { capitalizeFirstChar } from "@/lib/utils";

interface DashboardUserDetailsComponentProps {
  linkedUsers: LinkedUser[];
  row: DashboardConverted;
  value: DateValueType;
  loading: boolean;
}
export default function DashboardUserDetails({
  linkedUsers,
  row,
  value,
  loading,
}: DashboardUserDetailsComponentProps) {
  const columns = useMemo<MRT_ColumnDef<LinkedUser>[]>(
    () => [
      {
        accessorFn: (row) => {
          return row?.username;
        },
        header: "Name",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return row?.userCredentials?.userRoles
            .map((role) => role?.displayName)
            .join(", ");
        },
        header: "Roles",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return row?.userGroups.map((group) => group?.displayName).join(", ");
        },
        id: "userGroups",
        header: "user Groups",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return row?.organisationUnits
            .map((org) => org?.displayName)
            .join(", ");
        },
        id: "organisations",
        header: "organisations",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return row?.visits;
        },
        id: "AccessFrequency",
        header: "Access Frequency",
        size: 40,
      },

      {
        accessorFn: (row) => {
          const sDay = new Date(row.lastVisit);
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        id: "lastVisit",
        header: "lastVisit",
        filterVariant: "date-range",
        sortingFn: "datetime",
        enableColumnFilterModes: false,
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString("en-CA"),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        size: 50,
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: linkedUsers,
    state: { isLoading: loading },
    enableFullScreenToggle: false,
    initialState: {
      sorting: [{ id: "Instance", desc: false }],
      // pagination: { pageSize: 20, pageIndex: 0 },
      density: "xs",
      columnPinning: {
        left: [
          "Name",
          "AccessFrequency",
          "lastVisit",
          "organisations",
          "userGroups",
        ],
        right: ["type"],
      },
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },

    renderTopToolbarCustomActions: ({ table }) => (
      <div className="content-start flex flex-row gap-10">
        <div className="w-6/12 p-4">
          <ul>
            <li className="flex justify-between py-2 border-b-2 border-indigo-200">
              <span className="font-semibold">Dashboard : &nbsp;&nbsp;</span>
              <span> {row?.displayName} </span>
            </li>
          </ul>
        </div>

        <div className="w-6/12 p-4">
          <ul>
            <li className="flex justify-between py-2 border-b-2 border-indigo-200">
              <span className="font-semibold">Period : &nbsp;&nbsp;</span>
              <span>
                {" "}
                {value?.startDate
                  ? value?.startDate.toLocaleDateString("en-CA")
                  : ""}{" "}
                -{" "}
                {value?.endDate
                  ? value?.endDate.toLocaleDateString("en-CA")
                  : ""}{" "}
              </span>
            </li>
          </ul>
        </div>
      </div>
    ),
  });

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-full min-h-[85vh] overflow-y-scroll bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6 mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
      <div className=" h-[79vh] overflow-y-scroll">
        <MantineReactTable table={table} />
        {/* <h1 className="text-xl font-bold mb-4">User Visit Details</h1>
      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(row, null, 2)}
        </pre>
      {linkedUsers.length > 0 ? (
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(linkedUsers, null, 2)}
        </pre>
      ) : (
        <p className="text-gray-500">No user visit details available.</p>
      )} */}
      </div>
    </div>
  );
}
