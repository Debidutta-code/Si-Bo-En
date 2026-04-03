import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import type { IRoomDateAvailability } from "../types";

interface AvailabilityCalendarProps {
  availability: IRoomDateAvailability[];
  totalRooms: number;
  onDayClick?: (date: Date) => void;
}

const parseUTCDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const getAvailabilityLevel = (availability: number, total: number) => {
  if (total === 0) return null;
  if (availability === 0) return "full";
  const ratio = availability / total;
  if (ratio <= 0.3) return "low";
  if (ratio < 0.7) return "med";
  return "high";
};

const levelStyles = {
  high: {
    cell: "bg-green-50 border-green-200 hover:bg-green-100",
    number: "text-green-800",
    badge: "text-green-600 bg-green-100",
  },
  med: {
    cell: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    number: "text-yellow-800",
    badge: "text-yellow-600 bg-yellow-100",
  },
  low: {
    cell: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    number: "text-orange-800",
    badge: "text-orange-500 bg-orange-100",
  },
  full: {
    cell: "bg-red-50 border-red-200 hover:bg-red-100",
    number: "text-red-700",
    badge: "text-red-500 bg-red-100",
  },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityCalendar({
  availability,
  totalRooms,
  onDayClick,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Build a fast lookup map: "2026-04-01" -> availability count
  const availMap = Object.fromEntries(
    availability.map((a) => {
      const d = parseUTCDate(a.date);
      return [format(d, "yyyy-MM-dd"), a.availability];
    })
  );

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    onDayClick?.(date);
  };

  // Build the grid: always 6 rows x 7 cols
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const rows: Date[][] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    rows.push(week);
  }

  return (
    <div className="w-full select-none">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h3 className="text-sm font-semibold text-gray-800">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {rows.flat().map((date, idx) => {
          const dateKey = format(date, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const avail = availMap[dateKey];
          const level = avail !== undefined ? getAvailabilityLevel(avail, totalRooms) : null;
          const styles = level ? levelStyles[level] : null;
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isTodayDate = isToday(date);

          return (
            <button
              key={idx}
              onClick={() => isCurrentMonth && handleDayClick(date)}
              disabled={!isCurrentMonth}
              className={[
                "relative flex flex-col items-center justify-center rounded-lg border transition-all duration-150 py-1.5 gap-0.5",
                isCurrentMonth ? "cursor-pointer" : "cursor-default opacity-20",
                styles ? styles.cell : "border-transparent hover:bg-gray-50",
                isSelected ? "ring-2 ring-primary ring-offset-1 shadow-sm" : "",
                isTodayDate && !styles ? "border-primary/40 bg-primary/5" : "",
              ].join(" ")}
            >
              {/* Day number */}
              <span
                className={[
                  "text-xs font-semibold leading-none",
                  isTodayDate ? "text-primary" : styles ? styles.number : "text-gray-700",
                ].join(" ")}
              >
                {format(date, "d")}
              </span>

              {/* Availability count — only for current month days that have data */}
              {isCurrentMonth && avail !== undefined && (
                <span
                  className={[
                    "text-[9px] font-bold leading-none px-1 py-0.5 rounded-sm",
                    styles ? styles.badge : "text-gray-400",
                  ].join(" ")}
                >
                  {avail}
                </span>
              )}

              {/* Today dot */}
              {isTodayDate && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {/* Legend */}
      <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-y-1.5 gap-x-2">
        {[
          { label: "High availability", range: "70% – 100%", dot: "bg-green-500" },
          { label: "Medium availability", range: "30% – 69%", dot: "bg-yellow-500" },
          { label: "Low availability", range: "1% – 29%", dot: "bg-orange-500" },
          { label: "Fully booked", range: "0%", dot: "bg-red-500" },
        ].map(({ label, range, dot }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-600 leading-tight">{label}</span>
              <span className="text-[10px] text-gray-400 leading-tight">{range}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}