// src/components/calendar-date-picker.tsx

"use client";

import * as React from "react";
import {
  startOfWeek,
  endOfWeek,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from "date-fns";
import { toDate, formatInTimeZone } from "date-fns-tz";
import { DateRange, DayPicker } from "react-day-picker";

import {
  Button,
  ButtonStrip,
  Modal,
  ModalActions,
  ModalContent,
  ModalTitle,
} from "@dhis2/ui";

import { cn } from "../lib/utils";
import i18n from "../locales";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface CalendarDatePickerProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  id?: string;
  className?: string;
  date: DateRange;
  closeOnSelect?: boolean;
  numberOfMonths?: 1 | 2;
  yearsRange?: number;
  minYear?: number;
  onDateSelect: (range: { from: Date; to: Date }) => void;
}

export const CalendarDatePicker = React.forwardRef<
  HTMLButtonElement,
  CalendarDatePickerProps
>(
  (
    {
      id = "calendar-date-picker",
      className,
      date,
      closeOnSelect = false,
      numberOfMonths = 2,
      yearsRange = 50,
      minYear = 2000,
      onDateSelect,
      ...props
    },
    ref
  ) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedRange, setSelectedRange] = React.useState<string | null>(
      numberOfMonths === 2 ? "This Year" : "Today"
    );
    const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(
      date?.from
    );
    const [yearFrom, setYearFrom] = React.useState<number | undefined>(
      date?.from?.getFullYear()
    );
    const [monthTo, setMonthTo] = React.useState<Date | undefined>(
      numberOfMonths === 2 ? date?.to : date?.from
    );
    const [yearTo, setYearTo] = React.useState<number | undefined>(
      numberOfMonths === 2 ? date?.to?.getFullYear() : date?.from?.getFullYear()
    );
    const [highlightedPart, setHighlightedPart] = React.useState<string | null>(
      null
    );

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const handleClose = () => setIsModalOpen(false);

    const handleToggleModal = () => setIsModalOpen((prev) => !prev);

    const selectDateRange = (from: Date, to: Date, range: string) => {
      const startDate = startOfDay(toDate(from, { timeZone }));
      const endDate =
        numberOfMonths === 2 ? endOfDay(toDate(to, { timeZone })) : startDate;
      onDateSelect({ from: startDate, to: endDate });
      setSelectedRange(range);
      setMonthFrom(from);
      setYearFrom(from.getFullYear());
      setMonthTo(to);
      setYearTo(to.getFullYear());
      if (closeOnSelect) {
        setIsModalOpen(false);
      }
    };

    const handleDateSelect = (range: DateRange | undefined) => {
      if (range) {
        let from = startOfDay(toDate(range.from as Date, { timeZone }));
        let to = range.to ? endOfDay(toDate(range.to, { timeZone })) : from;
        if (numberOfMonths === 1) {
          if (range.from !== date.from) {
            to = from;
          } else {
            from = startOfDay(toDate(range.to as Date, { timeZone }));
          }
        }
        onDateSelect({ from, to });
        setMonthFrom(from);
        setYearFrom(from.getFullYear());
        setMonthTo(to);
        setYearTo(to.getFullYear());
      }
      setSelectedRange(null);
    };

    const handleMonthChange = (newMonthIndex: number, part: string) => {
      setSelectedRange(null);
      if (part === "from") {
        if (yearFrom !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
          const newMonth = new Date(yearFrom, newMonthIndex, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(toDate(newMonth, { timeZone }))
              : date?.from
                ? new Date(
                    date.from.getFullYear(),
                    newMonth.getMonth(),
                    date.from.getDate()
                  )
                : newMonth;
          const to =
            numberOfMonths === 2
              ? date.to
                ? endOfDay(toDate(date.to, { timeZone }))
                : endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthFrom(newMonth);
            setMonthTo(date.to);
          }
        }
      } else {
        if (yearTo !== undefined) {
          if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
          const newMonth = new Date(yearTo, newMonthIndex, 1);
          const from = date.from
            ? startOfDay(toDate(date.from, { timeZone }))
            : startOfMonth(toDate(newMonth, { timeZone }));
          const to =
            numberOfMonths === 2
              ? endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setMonthTo(newMonth);
            setMonthFrom(date.from);
          }
        }
      }
    };

    const handleYearChange = (newYear: number, part: string) => {
      setSelectedRange(null);
      if (part === "from") {
        if (years.includes(newYear)) {
          const newMonth = monthFrom
            ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
            : new Date(newYear, 0, 1);
          const from =
            numberOfMonths === 2
              ? startOfMonth(toDate(newMonth, { timeZone }))
              : date.from
                ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
                : newMonth;
          const to =
            numberOfMonths === 2
              ? date.to
                ? endOfDay(toDate(date.to, { timeZone }))
                : endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setYearFrom(newYear);
            setMonthFrom(newMonth);
            setYearTo(date.to?.getFullYear());
            setMonthTo(date.to);
          }
        }
      } else {
        if (years.includes(newYear)) {
          const newMonth = monthTo
            ? new Date(newYear, monthTo.getMonth(), 1)
            : new Date(newYear, 0, 1);
          const from = date.from
            ? startOfDay(toDate(date.from, { timeZone }))
            : startOfMonth(toDate(newMonth, { timeZone }));
          const to =
            numberOfMonths === 2
              ? endOfMonth(toDate(newMonth, { timeZone }))
              : from;
          if (from <= to) {
            onDateSelect({ from, to });
            setYearTo(newYear);
            setMonthTo(newMonth);
            setYearFrom(date.from?.getFullYear());
            setMonthFrom(date.from);
          }
        }
      }
    };

    const today = new Date();
    const currentYear = today.getFullYear();

    const years = Array.from(
      { length: currentYear - minYear + 2 },
      (_, i) => minYear + i
    );

    const dateRanges = [
      { label: "Today", start: today, end: today },
      { label: "Yesterday", start: subDays(today, 1), end: subDays(today, 1) },
      {
        label: "This Week",
        start: startOfWeek(today, { weekStartsOn: 1 }),
        end: endOfWeek(today, { weekStartsOn: 1 }),
      },
      {
        label: "Last Week",
        start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
        end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
      },
      { label: "Last 7 Days", start: subDays(today, 6), end: today },
      {
        label: "This Month",
        start: startOfMonth(today),
        end: endOfMonth(today),
      },
      {
        label: "Last Month",
        start: startOfMonth(subDays(today, today.getDate())),
        end: endOfMonth(subDays(today, today.getDate())),
      },
      { label: "This Year", start: startOfYear(today), end: endOfYear(today) },
      {
        label: "Last Year",
        start: startOfYear(subDays(today, 365)),
        end: endOfYear(subDays(today, 365)),
      },
    ];

    const handleMouseOver = (part: string) => {
      setHighlightedPart(part);
    };

    const handleMouseLeave = () => {
      setHighlightedPart(null);
    };

    const handleWheel = (event: React.WheelEvent, part: string) => {
      event.preventDefault();
      setSelectedRange(null);
      if (highlightedPart === "firstDay") {
        const newDate = new Date(date.from as Date);
        const increment = event.deltaY > 0 ? -1 : 1;
        newDate.setDate(newDate.getDate() + increment);
        if (newDate <= (date.to as Date)) {
          if (numberOfMonths === 2) {
            onDateSelect({ from: newDate, to: new Date(date.to as Date) });
          } else {
            onDateSelect({ from: newDate, to: newDate });
          }
          setMonthFrom(newDate);
        } else if (newDate > (date.to as Date) && numberOfMonths === 1) {
          onDateSelect({ from: newDate, to: newDate });
          setMonthFrom(newDate);
        }
      } else if (highlightedPart === "firstMonth") {
        const currentMonth = monthFrom ? monthFrom.getMonth() : 0;
        const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
        handleMonthChange(newMonthIndex, "from");
      } else if (highlightedPart === "firstYear" && yearFrom !== undefined) {
        const newYear = yearFrom + (event.deltaY > 0 ? -1 : 1);
        handleYearChange(newYear, "from");
      } else if (highlightedPart === "secondDay") {
        const newDate = new Date(date.to as Date);
        const increment = event.deltaY > 0 ? -1 : 1;
        newDate.setDate(newDate.getDate() + increment);
        if (newDate >= (date.from as Date)) {
          onDateSelect({ from: new Date(date.from as Date), to: newDate });
          setMonthTo(newDate);
        }
      } else if (highlightedPart === "secondMonth") {
        const currentMonth = monthTo ? monthTo.getMonth() : 0;
        const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
        handleMonthChange(newMonthIndex, "to");
      } else if (highlightedPart === "secondYear" && yearTo !== undefined) {
        const newYear = yearTo + (event.deltaY > 0 ? -1 : 1);
        handleYearChange(newYear, "to");
      }
    };

    React.useEffect(() => {
      const firstDayElement = document.getElementById(`firstDay-${id}`);
      const firstMonthElement = document.getElementById(`firstMonth-${id}`);
      const firstYearElement = document.getElementById(`firstYear-${id}`);
      const secondDayElement = document.getElementById(`secondDay-${id}`);
      const secondMonthElement = document.getElementById(`secondMonth-${id}`);
      const secondYearElement = document.getElementById(`secondYear-${id}`);

      const elements = [
        firstDayElement,
        firstMonthElement,
        firstYearElement,
        secondDayElement,
        secondMonthElement,
        secondYearElement,
      ];

      const addPassiveEventListener = (element: HTMLElement | null) => {
        if (element) {
          element.addEventListener(
            "wheel",
            handleWheel as unknown as EventListener,
            {
              passive: false,
            }
          );
        }
      };

      elements.forEach(addPassiveEventListener);

      return () => {
        elements.forEach((element) => {
          if (element) {
            element.removeEventListener(
              "wheel",
              handleWheel as unknown as EventListener
            );
          }
        });
      };
    }, [highlightedPart, date]);

    const formatWithTz = (date: Date, fmt: string) =>
      formatInTimeZone(date, timeZone, fmt);

    return (
      <>
        <style>
          {`
            .date-part {
              touch-action: none;
            }
            .rdp {
              --rdp-cell-size: 40px;
              --rdp-accent-color: #2563eb;
              --rdp-background-color: #e0e7ff;
              --rdp-accent-color-dark: #1e40af;
              --rdp-background-color-dark: #1e3a8a;
              --rdp-outline: 2px solid var(--rdp-accent-color);
              --rdp-outline-selected: 2px solid #2563eb;
              margin: 1em;
            }
            .rdp-months {
              display: flex;
              gap: 1rem;
            }
            .rdp-month {
              border-collapse: collapse;
            }
            .rdp-caption {
              display: flex;
              justify-content: center;
              padding: 1rem;
              font-weight: 600;
            }
            .rdp-head_cell {
              color: #6b7280;
              font-size: 0.875rem;
              font-weight: 500;
              text-align: center;
              padding: 0.5rem;
            }
            .rdp-cell {
              padding: 0.25rem;
              text-align: center;
            }
            .rdp-button {
              border: none;
              background: transparent;
              cursor: pointer;
              width: 40px;
              height: 40px;
              border-radius: 0.375rem;
              font-size: 0.875rem;
            }
            .rdp-button:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
              background-color: #f3f4f6;
            }
            .rdp-day_selected {
              background-color: var(--rdp-accent-color) !important;
              color: white !important;
            }
            .rdp-day_range_middle {
              background-color: var(--rdp-background-color) !important;
              color: #1f2937 !important;
            }
            .rdp-day_disabled {
              color: #d1d5db;
              cursor: not-allowed;
            }
            .rdp-day_today {
              font-weight: 700;
              color: var(--rdp-accent-color);
            }
          `}
        </style>
        <button
          id="date"
          ref={ref}
          {...props}
          className={cn(
            "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-sky-500 text-sky-500 p-2",
            className
          )}
          onClick={handleToggleModal}
          suppressHydrationWarning
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {date?.from ? (
              date.to ? (
                <>
                  <span
                    id={`firstDay-${id}`}
                    className={cn(
                      "date-part",
                      highlightedPart === "firstDay" && "underline font-bold"
                    )}
                    onMouseOver={() => handleMouseOver("firstDay")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {formatWithTz(date.from, "dd")}
                  </span>{" "}
                  <span
                    id={`firstMonth-${id}`}
                    className={cn(
                      "date-part",
                      highlightedPart === "firstMonth" && "underline font-bold"
                    )}
                    onMouseOver={() => handleMouseOver("firstMonth")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {formatWithTz(date.from, "LLL")}
                  </span>
                  ,{" "}
                  <span
                    id={`firstYear-${id}`}
                    className={cn(
                      "date-part",
                      highlightedPart === "firstYear" && "underline font-bold"
                    )}
                    onMouseOver={() => handleMouseOver("firstYear")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {formatWithTz(date.from, "y")}
                  </span>
                  {numberOfMonths === 2 && (
                    <>
                      {" - "}
                      <span
                        id={`secondDay-${id}`}
                        className={cn(
                          "date-part",
                          highlightedPart === "secondDay" &&
                            "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("secondDay")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.to, "dd")}
                      </span>{" "}
                      <span
                        id={`secondMonth-${id}`}
                        className={cn(
                          "date-part",
                          highlightedPart === "secondMonth" &&
                            "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("secondMonth")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.to, "LLL")}
                      </span>
                      ,{" "}
                      <span
                        id={`secondYear-${id}`}
                        className={cn(
                          "date-part",
                          highlightedPart === "secondYear" &&
                            "underline font-bold"
                        )}
                        onMouseOver={() => handleMouseOver("secondYear")}
                        onMouseLeave={handleMouseLeave}
                      >
                        {formatWithTz(date.to, "y")}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span
                    id="day"
                    className={cn(
                      "date-part",
                      highlightedPart === "day" && "underline font-bold"
                    )}
                    onMouseOver={() => handleMouseOver("day")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {formatWithTz(date.from, "dd")}
                  </span>{" "}
                  <span
                    id="month"
                    className={cn(
                      "date-part",
                      highlightedPart === "month" && "underline font-bold"
                    )}
                    onMouseOver={() => handleMouseOver("month")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {formatWithTz(date.from, "LLL")}
                  </span>
                  ,{" "}
                  <span
                    id="year"
                    className={cn(
                      "date-part",
                      highlightedPart === "year" && "underline font-bold"
                    )}
                    onMouseOver={() => handleMouseOver("year")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {formatWithTz(date.from, "y")}
                  </span>
                </>
              )
            ) : (
              <span>{i18n.t("Pick a date")}</span>
            )}
          </span>
        </button>

        {isModalOpen && (
          <Modal large onClose={handleClose}>
            <ModalTitle>{i18n.t("Select Date Range")}</ModalTitle>
            <ModalContent>
              <div className="flex gap-4">
                {numberOfMonths === 2 && (
                  <div className="hidden md:flex flex-col gap-1 pr-4 border-r border-gray-200">
                    <ButtonStrip>
                      <div className="flex flex-col gap-1">
                        {dateRanges.map(({ label, start, end }) => (
                          <Button
                            key={label}
                            onClick={() => {
                              selectDateRange(start, end, label);
                              setMonthFrom(start);
                              setYearFrom(start.getFullYear());
                              setMonthTo(end);
                              setYearTo(end.getFullYear());
                            }}
                            secondary={selectedRange !== label}
                            small
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </ButtonStrip>
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex">
                    <DayPicker
                      mode="range"
                      defaultMonth={monthFrom}
                      month={monthFrom}
                      onMonthChange={setMonthFrom}
                      selected={date}
                      onSelect={handleDateSelect}
                      numberOfMonths={numberOfMonths}
                      showOutsideDays={false}
                      className={className}
                    />
                  </div>
                </div>
              </div>
            </ModalContent>
            <ModalActions>
              <Button onClick={handleClose}>{i18n.t("Close")}</Button>
            </ModalActions>
          </Modal>
        )}
      </>
    );
  }
);

CalendarDatePicker.displayName = "CalendarDatePicker";
