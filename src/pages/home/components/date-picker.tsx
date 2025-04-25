"use client";

import type { DateValueType } from "./../../../types/dashboard-reportType";
import { useRef, useEffect } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { useDashboard } from "./../../../context/DashboardContext";

interface DatePickerComponentProps {
  value?: DateValueType;
  onChange?: (value: DateValueType | null) => void;
  maxDate: Date;
}

export default function DatePicker({ value, onChange, maxDate }: DatePickerComponentProps) {
  const { state, dispatch } = useDashboard();

  // Use ref to track previous value to prevent unnecessary re-renders
  const prevValueRef = useRef<DateValueType | null>(null);

  // Handle date change with debounce to prevent infinite loops
  const handleDateChange = (newValue: DateValueType | null) => {
    // Skip if the value hasn't actually changed
    if (
      prevValueRef.current?.startDate?.getTime() === newValue?.startDate?.getTime() &&
      prevValueRef.current?.endDate?.getTime() === newValue?.endDate?.getTime()
    ) {
      return;
    }

    // Update the ref
    prevValueRef.current = newValue;

    // Ensure we're passing a valid value
    if (newValue && (newValue.startDate || newValue.endDate)) {
      // Update the global context
      dispatch({ type: 'SET_DATE_RANGE', payload: newValue });

      // Also call the onChange prop if provided (for local state management)
      if (onChange) {
        onChange(newValue);
      }
    } else {
      const emptyValue = { startDate: null, endDate: null };
      dispatch({ type: 'SET_DATE_RANGE', payload: emptyValue });

      if (onChange) {
        onChange(emptyValue);
      }
    }
  };

  // Determine which value to use - props take precedence over context
  const displayValue = value || state.value;

  // Update the ref when value changes from either props or context
  useEffect(() => {
    prevValueRef.current = displayValue;
  }, [displayValue]);

  return (
    <Datepicker
      displayFormat="DD-MM-YYYY"
      separator="to"
      primaryColor="sky"
      inputClassName="min-w-[300px] rounded-sm py-1 text-sm border border-sky-500 text-sky-500 p-2 focus:ring-0 focus:outline-none"
      maxDate={maxDate}
      value={displayValue}
      onChange={handleDateChange}
      showShortcuts
    />
  );
}
