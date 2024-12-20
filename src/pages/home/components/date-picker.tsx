import { DateValueType } from '@/types/dashboard-reportType';
import React from 'react'
import Datepicker from 'react-tailwindcss-datepicker'

interface DatePickerComponentProps {
    value: DateValueType;
    onChange: (value: DateValueType | null) => void;
    maxDate: Date;
  }
export default function DatePicker({
    value,
    onChange,
    maxDate,
  }:DatePickerComponentProps) {
  return (
    <Datepicker
      displayFormat="DD-MM-YYYY"
      separator="to"
      primaryColor="sky"
      inputClassName="min-w-[300px] rounded-sm py-1 text-sm border border-sky-500 text-sky-500 p-2 focus:ring-0 focus:outline-none"
      maxDate={maxDate}
      value={value}
      onChange={onChange}
      showShortcuts
    />
  )
}
