
import { DashboardConverted } from "@/types/dashboardsType";
import ShowData from "./show-data";

interface TableActionsProps {
  row: DashboardConverted;
  data: DashboardConverted[];
}


export default function TableActions({ row, data }: TableActionsProps) {
  console.log({ row, data });
  return (
    <div>
      <ShowData row={row} data={data} />
    </div>
  );
}
