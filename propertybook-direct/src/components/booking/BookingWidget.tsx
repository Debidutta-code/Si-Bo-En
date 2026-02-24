import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import { Calendar, Users, Minus, Plus, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBooking } from "@/contexts/BookingContext";
import { cn } from "@/lib/utils";
import type { Guest } from "@/types/booking";

const PROPERTY_CODE = "4BTXDZ";

// ─── Guest Selector ────────────────────────────────────────────────────────────

interface GuestSelectorProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

function GuestSelector({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 10,
}: GuestSelectorProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-sm font-semibold text-gray-900 tabular-nums">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-8 w-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────

function FieldDivider({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <div className="hidden sm:block w-px self-stretch bg-gray-200 mx-0" />
  ) : (
    <div className="h-px w-full bg-gray-200 sm:hidden" />
  );
}

// ─── Trigger Button Base ───────────────────────────────────────────────────────

function TriggerField({
  icon: Icon,
  label,
  value,
  placeholder,
  compact,
  className,
}: {
  icon: React.ElementType;
  label?: string;
  value: string;
  placeholder: string;
  compact: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 cursor-pointer group",
          className
        )}
      >
        <Icon className="h-3.5 w-3.5 text-gray-500 shrink-0 group-hover:text-gray-900 transition-colors" />
        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
          {value || placeholder}
        </span>
        <ChevronDown className="h-3 w-3 text-gray-400 ml-auto shrink-0" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-4 py-3.5 cursor-pointer group min-w-0",
        className
      )}
    >
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-700 transition-colors">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-gray-700 transition-colors" />
        <span
          className={cn(
            "text-sm font-medium truncate transition-colors",
            value ? "text-gray-900" : "text-gray-400"
          )}
        >
          {value || placeholder}
        </span>
      </div>
    </div>
  );
}

// ─── Main Widget ───────────────────────────────────────────────────────────────

interface BookingWidgetProps {
  variant?: "default" | "compact";
}

export function BookingWidget({ variant = "default" }: BookingWidgetProps) {
  const navigate = useNavigate();
  const { setSearchCriteria } = useBooking();

  const today = new Date();
  const tomorrow = addDays(today, 1);

  const [checkIn, setCheckIn] = useState<Date>(today);
  const [checkOut, setCheckOut] = useState<Date>(tomorrow);
  const [guests, setGuests] = useState<Guest>({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const handleSearch = () => {
    const criteria = {
      startDate: format(checkIn, "yyyy-MM-dd"),
      endDate: format(checkOut, "yyyy-MM-dd"),
      guests,
      PropertyCode: PROPERTY_CODE,
    };
    setSearchCriteria(criteria);
    navigate(`/rooms?code=${PROPERTY_CODE}`);
  };

  const guestSummary = `${guests.adults} Adult${guests.adults !== 1 ? "s" : ""}${
    guests.children > 0
      ? `, ${guests.children} Child${guests.children !== 1 ? "ren" : ""}`
      : ""
  }${guests.rooms > 1 ? ` · ${guests.rooms} Rooms` : ""}`;

  const isCompact = variant === "compact";

  // ── Compact variant (rooms page) ──────────────────────────────────────────

  if (isCompact) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Mobile: stacked fields */}
        <div className="flex flex-col sm:flex-row sm:items-stretch sm:divide-x sm:divide-gray-200">

          {/* Check-in */}
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 text-left hover:bg-gray-50 transition-colors rounded-t-xl sm:rounded-l-xl sm:rounded-t-none border-b border-gray-200 sm:border-0">
                <TriggerField
                  icon={Calendar}
                  value={checkIn ? format(checkIn, "MMM d") : ""}
                  placeholder="Check-in"
                  compact
                  label="Check-in"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-lg" align="start">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  if (date) {
                    setCheckIn(date);
                    if (date >= checkOut) setCheckOut(addDays(date, 1));
                    setCheckInOpen(false);
                  }
                }}
                disabled={(date) => date < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Check-out */}
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 sm:border-0">
                <TriggerField
                  icon={Calendar}
                  value={checkOut ? format(checkOut, "MMM d") : ""}
                  placeholder="Check-out"
                  compact
                  label="Check-out"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-lg" align="start">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={(date) => {
                  if (date) {
                    setCheckOut(date);
                    setCheckOutOpen(false);
                  }
                }}
                disabled={(date) => date <= checkIn}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Guests */}
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 text-left hover:bg-gray-50 transition-colors border-b border-gray-200 sm:border-0">
                <TriggerField
                  icon={Users}
                  value={guestSummary}
                  placeholder="Guests"
                  compact
                  label="Guests"
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 shadow-lg" align="start">
              <div className="divide-y divide-gray-100">
                <GuestSelector
                  label="Adults"
                  description="Ages 13+"
                  value={guests.adults}
                  onChange={(v) => setGuests({ ...guests, adults: v })}
                  min={1}
                  max={10}
                />
                <GuestSelector
                  label="Children"
                  description="Ages 2–12"
                  value={guests.children}
                  onChange={(v) => setGuests({ ...guests, children: v })}
                  min={0}
                  max={6}
                />
                <GuestSelector
                  label="Rooms"
                  value={guests.rooms}
                  onChange={(v) => setGuests({ ...guests, rooms: v })}
                  min={1}
                  max={5}
                />
              </div>
              <Button
                className="w-full mt-4 h-9"
                onClick={() => setGuestsOpen(false)}
              >
                Done
              </Button>
            </PopoverContent>
          </Popover>

          {/* Search button */}
          <div className="p-2 flex items-center sm:pl-0">
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Search className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span>Update Search</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Book Your Stay</h3>
        </div>

        {/* Fields */}
        <div className="p-3 flex flex-col sm:flex-row gap-2">

          {/* Check-in */}
          <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 text-left rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group">
                <TriggerField
                  icon={Calendar}
                  label="Check-in"
                  value={checkIn ? format(checkIn, "EEE, MMM d") : ""}
                  placeholder="Select date"
                  compact={false}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-xl" align="start">
              <CalendarComponent
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  if (date) {
                    setCheckIn(date);
                    if (date >= checkOut) setCheckOut(addDays(date, 1));
                    setCheckInOpen(false);
                  }
                }}
                disabled={(date) => date < today}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Check-out */}
          <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 text-left rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group">
                <TriggerField
                  icon={Calendar}
                  label="Check-out"
                  value={checkOut ? format(checkOut, "EEE, MMM d") : ""}
                  placeholder="Select date"
                  compact={false}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-xl" align="start">
              <CalendarComponent
                mode="single"
                selected={checkOut}
                onSelect={(date) => {
                  if (date) {
                    setCheckOut(date);
                    setCheckOutOpen(false);
                  }
                }}
                disabled={(date) => date <= checkIn}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Guests */}
          <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
            <PopoverTrigger asChild>
              <button className="flex-1 text-left rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all group">
                <TriggerField
                  icon={Users}
                  label="Guests & Rooms"
                  value={guestSummary}
                  placeholder="Add guests"
                  compact={false}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 shadow-xl" align="start">
              <div className="divide-y divide-gray-100">
                <GuestSelector
                  label="Adults"
                  description="Ages 13+"
                  value={guests.adults}
                  onChange={(v) => setGuests({ ...guests, adults: v })}
                  min={1}
                  max={10}
                />
                <GuestSelector
                  label="Children"
                  description="Ages 2–12"
                  value={guests.children}
                  onChange={(v) => setGuests({ ...guests, children: v })}
                  min={0}
                  max={6}
                />
                <GuestSelector
                  label="Rooms"
                  value={guests.rooms}
                  onChange={(v) => setGuests({ ...guests, rooms: v })}
                  min={1}
                  max={5}
                />
              </div>
              <Button
                className="w-full mt-4 h-9"
                onClick={() => setGuestsOpen(false)}
              >
                Done
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        {/* CTA */}
        <div className="px-3 pb-3">
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm sm:text-base"
          >
            <Search className="h-4 w-4" />
            Check Availability
          </button>
        </div>
      </div>
    </div>
  );
}