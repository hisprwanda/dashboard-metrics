import { DashboardConverted } from "@/types/dashboardsType";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { FaEye } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import Datepicker from "react-tailwindcss-datepicker";
import { formatDate } from "../../../lib/utils";

export interface DataSourceRowProps {
  row: DashboardConverted;
  data: DashboardConverted[];
}
export interface DateValueType {
    startDate: Date | null;
    endDate: Date | null;
  }

export default function ShowData({ row }: DataSourceRowProps) {
  const [open, setOpen] = useState(false);
  const MAX_DATE = new Date();
  const currentDate = new Date();
  const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  const [value, setValue] = useState<DateValueType>({
    startDate: firstDayOfLastMonth,
    endDate: currentDate,
  });

  const handleValueChange = (newValue: DateValueType | null) => {
    setValue(newValue || { startDate: null, endDate: null });
    //refetch();
  };

  //   const { data: fetchedOrders, refetch } = useOrdersReport(
  //     value.startDate,
  //     value.endDate
  //   );

  //   const Orders = fetchedOrders ?? [];

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="w-[40px] bg-transparent p-1 focus:outline-none focus:shadow-outline text-stext hover:text-slate-600 hover:bg-transparent">
          <FaEye className="text-xl" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0 z-10" />
        <AlertDialog.Content className=" z-10 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[95vh] w-[90vw]  translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-mauve12 -mt-4 font-medium">
            <div className="flex justify-between items-center py-2">
              <div className="w-[300px] flex items-start justify-between gap-20 ">
                <Datepicker
                  displayFormat={"DD-MM-YYYY"}
                  separator={"to"}
                  primaryColor={"sky"}
                  inputClassName=" min-w-[300px] rounded-sm  py-1 text-sm border border-sky-500 text-sky-500 p-2 focus:ring-0 focus:outline-none  "
                  maxDate={MAX_DATE}
                  value={value}
                  onChange={handleValueChange}
                  showShortcuts={true}
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 "> {formatDate(value?.startDate)} - {formatDate(value?.endDate)} </h3>

              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="cursor-pointer text-gray-400 bg-transparent hover:bg-transparent hover:bg-gray-200"
                  data-modal-toggle="default-modal"
                >
                  <RiCloseLargeFill />
                </button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Title>

          <div className=" w-full min-h-[85vh] overflow-y-auto bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6  mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{row.name} </h2>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

// const useOrdersReport = (startDate, endDate) => {
//     return useQuery({
//       queryKey: ["orders", startDate], //refetch whenever the URL changes (columnFilters, globalFilter, sorting, pagination)
//       queryFn: () => getOrders(startDate, endDate),
//       staleTime: 30_000,
//     });
//   };
