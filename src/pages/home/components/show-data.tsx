// file location: src/pages/home/components/show-data.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa6";

import { Button } from "@dhis2/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
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

  const handleValueChange = (
    newValue: { startDate: Date | null; endDate: Date | null } | null
  ) => {
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
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-10 rounded-sm bg-transparent p-1 text-stext hover:text-slate-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <FaEye className="text-xl" />
      </button>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] w-[90vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center py-2">
              <div className="w-[300px] flex items-start justify-between gap-20">
                <DatePicker
                  value={state.value}
                  onChange={handleValueChange}
                  maxDate={MAX_DATE}
                />
              </div>
              <div>
                <OrgUnitPicker onOrgUnitsChange={handleOrgUnitsChange} />
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-gray-700">
                  {formatDate(state.value?.startDate)} -{" "}
                  {formatDate(state.value?.endDate)}
                  {state.orgUnitNames.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">
                      ({state.orgUnitNames.length}{" "}
                      {state.orgUnitNames.length !== 1
                        ? i18n.t("org units")
                        : i18n.t("org unit")}{" "}
                      {i18n.t("selected")})
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </DialogHeader>
          <div className="mt-4">
            <DashboardReport key={reportKey.current} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleDialogOpenChange(false)} secondary>
              {i18n.t("Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
