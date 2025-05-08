// file location: src/pages/home/components/table-actions.tsx
import { DashboardConverted } from "@/types/dashboardsType";
import ShowData from "./show-data";
import { useDashboard } from "../../../context/DashboardContext";
import { useEffect } from "react";

interface TableActionsProps {
  row: DashboardConverted;
  data: DashboardConverted[];
}

export default function TableActions({ row, data }: TableActionsProps) {
  const { dispatch } = useDashboard();

  useEffect(() => {
    dispatch({ type: 'SET_DASHBOARD', payload: row });
  }, [row, dispatch]);

  return (
    <div>
      <ShowData row={row} data={data} />
    </div>
  );
}