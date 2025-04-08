"use client";

import type { DateValueType } from "@/types/dashboard-reportType";
import { useRef, useEffect } from "react";
import Datepicker from "react-tailwindcss-datepicker";

interface DatePickerComponentProps {
  value: DateValueType;
  onChange: (value: DateValueType | null) => void;
  maxDate: Date;
}

export default function DatePicker({ value, onChange, maxDate }: DatePickerComponentProps) {
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

    // Ensure we're passing a valid value to the parent
    if (newValue && (newValue.startDate || newValue.endDate)) {
      onChange(newValue);
    } else {
      onChange({ startDate: null, endDate: null });
    }
  };

  // Update the ref when value changes from parent
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  return (
    <Datepicker
      displayFormat="DD-MM-YYYY"
      separator="to"
      primaryColor="sky"
      inputClassName="min-w-[300px] rounded-sm py-1 text-sm border border-sky-500 text-sky-500 p-2 focus:ring-0 focus:outline-none"
      maxDate={maxDate}
      value={value}
      onChange={handleDateChange}
      showShortcuts
    />
  );
}
