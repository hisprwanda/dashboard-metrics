"use client";

import { useEffect, useRef } from "react";
import { useDashboard } from "../../../context/DashboardContext";
import type { DateValueType } from "../../../types/dashboard-reportType";

interface DatePickerComponentProps {
  value?: DateValueType;
  onChange?: (value: DateValueType | null) => void;
  maxDate: Date;
}

export default function DatePicker({
  value,
  onChange,
  maxDate,
}: DatePickerComponentProps) {
  const { state, dispatch } = useDashboard();
  const prevValueRef = useRef<DateValueType | null>(null);

  const displayValue = value || state.value;

  useEffect(() => {
    prevValueRef.current = displayValue;
  }, [displayValue]);

  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (
    type: "start" | "end",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const dateString = event.target.value;
    if (!dateString) return;

    const selectedDate = new Date(dateString);

    const newValue: DateValueType = {
      startDate:
        type === "start"
          ? selectedDate
          : displayValue?.startDate || selectedDate,
      endDate:
        type === "end" ? selectedDate : displayValue?.endDate || selectedDate,
    };

    // Skip if the value hasn't actually changed
    if (
      prevValueRef.current?.startDate?.getTime() ===
        newValue.startDate?.getTime() &&
      prevValueRef.current?.endDate?.getTime() === newValue.endDate?.getTime()
    ) {
      return;
    }

    prevValueRef.current = newValue;
    dispatch({ type: "SET_DATE_RANGE", payload: newValue });

    if (onChange) {
      onChange(newValue);
    }
  };

  const maxDateStr = formatDateForInput(maxDate);

  return (
    <div className="flex gap-2 items-center">
      <input
        type="date"
        value={formatDateForInput(displayValue?.startDate)}
        onChange={(e) => handleDateChange("start", e)}
        max={maxDateStr}
        className="border rounded px-2 py-1"
      />
      <span>-</span>
      <input
        type="date"
        value={formatDateForInput(displayValue?.endDate)}
        onChange={(e) => handleDateChange("end", e)}
        max={maxDateStr}
        className="border rounded px-2 py-1"
      />
    </div>
  );
}
