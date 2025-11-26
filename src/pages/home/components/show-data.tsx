// file location: src/pages/home/components/show-data.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa6";
import { RiCloseLargeFill } from "react-icons/ri";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

import type { DashboardConverted } from "@/types/dashboardsType";

import { useDashboard } from "../../../context/DashboardContext";
import { formatDate } from "../../../lib/utils";
import i18n from "../../../locales";

import DatePicker from "./date-picker";
import OrgUnitPicker from "./org-unit-picker";
import DashboardReport from "./report-dashboard";

export interface DataSourceRowProps {
  row: DashboardConverted;
  data: DashboardConverted[];
}

export default function ShowData({ row, data }: DataSourceRowProps) {
  const { state, dispatch, resetContext } = useDashboard();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
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

  const handleDialogOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Dialog is closing - clean up everything

      // Reset all context state to initial values
      resetContext();

      // Invalidate all queries to ensure fresh data on next open
      queryClient.invalidateQueries();

      // Force a new report key for fresh component mount
      reportKey.current = `${Date.now()}`;
    }
  };

  // Only set dashboard when dialog opens, not on every row change
  useEffect(() => {
    if (open) {
      dispatch({ type: "SET_DASHBOARD", payload: row });
      reportKey.current = `${Date.now()}`;
    }
  }, [row, dispatch, open]);

  return (
    <AlertDialog.Root open={open} onOpenChange={handleDialogOpenChange}>
      <AlertDialog.Trigger asChild>
        <button className="w-10 rounded-sm bg-transparent p-1 text-stext hover:text-slate-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
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
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-gray-700">
                  {formatDate(state.value?.startDate)} - {formatDate(state.value?.endDate)}
                  {state.orgUnitNames.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">
                      ({state.orgUnitNames.length}{" "}
                      {state.orgUnitNames.length !== 1 ? i18n.t("org units") : i18n.t("org unit")}{" "}
                      {i18n.t("selected")})
                    </span>
                  )}
                </h3>
              </div>
              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="cursor-pointer text-gray-400 bg-transparent hover:bg-gray-200"
                  onClick={() => handleDialogOpenChange(false)}
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
