"use client";

import { useEffect, useRef } from "react";
import { CalendarDatePicker } from "../../../components/calendar-date-picker";

import { useDashboard } from "../../../context/DashboardContext";
import type { DateValueType } from "../../../types/dashboard-reportType";

interface DatePickerComponentProps {
  value?: DateValueType;
  onChange?: (value: DateValueType | null) => void;
  maxDate: Date;
}

export default function DatePicker({ value, onChange, maxDate }: DatePickerComponentProps) {
  const { state, dispatch } = useDashboard();

  // Use ref to track previous value to prevent unnecessary re-renders
  const prevValueRef = useRef<DateValueType | null>(null);

  // Convert DateValueType to DateRange format for CalendarDatePicker
  const convertToDateRange = (dateValue: DateValueType | null) => {
    if (!dateValue || (!dateValue.startDate && !dateValue.endDate)) {
      const today = new Date();
      return { from: today, to: today };
    }

    return {
      from: dateValue.startDate || new Date(),
      to: dateValue.endDate || dateValue.startDate || new Date(),
    };
  };

  // Convert DateRange format back to DateValueType
  const convertToDateValueType = (dateRange: { from: Date; to: Date }): DateValueType => {
    return {
      startDate: dateRange.from,
      endDate: dateRange.to,
    };
  };

  // Handle date change from CalendarDatePicker
  const handleDateSelect = (dateRange: { from: Date; to: Date }) => {
    const newValue = convertToDateValueType(dateRange);

    // Skip if the value hasn't actually changed
    if (
      prevValueRef.current?.startDate?.getTime() === newValue.startDate?.getTime() &&
      prevValueRef.current?.endDate?.getTime() === newValue.endDate?.getTime()
    ) {
      return;
    }

    // Update the ref
    prevValueRef.current = newValue;

    // Update the global context
    dispatch({ type: "SET_DATE_RANGE", payload: newValue });

    // Also call the onChange prop if provided (for local state management)
    if (onChange) {
      onChange(newValue);
    }
  };

  // Determine which value to use - props take precedence over context
  const displayValue = value || state.value;

  // Update the ref when value changes from either props or context
  useEffect(() => {
    prevValueRef.current = displayValue;
  }, [displayValue]);

  // Convert the display value to the format expected by CalendarDatePicker
  const dateRange = convertToDateRange(displayValue);

  return (
    <CalendarDatePicker
      date={dateRange}
      onDateSelect={handleDateSelect}
      numberOfMonths={2}
      closeOnSelect={false}
      variant="outline"
      className="w-auto"
    />
  );
}
