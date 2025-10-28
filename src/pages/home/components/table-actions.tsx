// file location: src/pages/home/components/table-actions.tsx
import { useEffect } from "react";

import type { DashboardConverted } from "@/types/dashboardsType";

import { useDashboard } from "../../../context/DashboardContext";

import ShowData from "./show-data";

interface TableActionsProps {
  row: DashboardConverted;
  data: DashboardConverted[];
}

export default function TableActions({ row, data }: TableActionsProps) {
  const { dispatch } = useDashboard();

  useEffect(() => {
    dispatch({ type: "SET_DASHBOARD", payload: row });
  }, [row, dispatch]);

  return (
    <div>
      <ShowData row={row} data={data} />
    </div>
  );
}
