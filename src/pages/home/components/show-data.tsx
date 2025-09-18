// file location: src/pages/home/components/show-data.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";

import * as AlertDialog from "@radix-ui/react-alert-dialog";

import type { DashboardConverted } from "@/types/dashboardsType";

import { useDashboard } from "../../../context/DashboardContext";
import { formatDate } from "../../../lib/utils";

import DatePicker from "./date-picker";
import OrgUnitPicker from "./org-unit-picker";
import DashboardReport from "./report-dashboard";

export interface DataSourceRowProps {
  row: DashboardConverted;
  data: DashboardConverted[];
}

export default function ShowData({ row, data }: DataSourceRowProps) {
  const { state, dispatch } = useDashboard();
  const [open, setOpen] = useState(false);
  const MAX_DATE = new Date();
  const reportKey = useRef<string>(`${Date.now()}`);

  const handleValueChange = (newValue: { startDate: Date | null; endDate: Date | null } | null) => {
    if (newValue && (newValue.startDate || newValue.endDate)) {
      dispatch({ type: "SET_DATE_RANGE", payload: newValue });
      reportKey.current = `${Date.now()}`;
    }
  };

  const handleOrgUnitsChange = (paths: string[], names: string[]) => {
    dispatch({ type: "SET_ORG_UNITS", payload: { paths, names } });
    reportKey.current = `${Date.now()}`;
  };

  useEffect(() => {
    dispatch({ type: "SET_DASHBOARD", payload: row });
  }, [row, dispatch]);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="w-[40px] rounded-sm bg-transparent p-1 text-stext hover:text-slate-600 hover:bg-transparent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <FaEye className="text-xl" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[95vh] w-[90vw] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[0px_10px_38px_-10px_rgba(0,0,0,0.35),0px_10px_20px_-15px_rgba(0,0,0,0.2)] focus:outline-hidden">
          <AlertDialog.Title className="text-mauve12 -mt-4 font-medium">
            <div className="flex justify-between items-center py-2">
              <div className="w-[300px] flex items-start justify-between gap-20 ">
                <DatePicker value={state.value} onChange={handleValueChange} maxDate={MAX_DATE} />
              </div>
              <div>
                <OrgUnitPicker onOrgUnitsChange={handleOrgUnitsChange} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                {formatDate(state.value?.startDate)} - {formatDate(state.value?.endDate)}
                {state.orgUnitNames.length > 0 && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({state.orgUnitNames.length} org unit
                    {state.orgUnitNames.length !== 1 ? "s" : ""} selected)
                  </span>
                )}
              </h3>
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
          <DashboardReport key={reportKey.current} />
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
