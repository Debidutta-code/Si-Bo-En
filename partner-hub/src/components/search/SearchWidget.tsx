import { useState } from "react";
import { IRoomConfig, useSearch } from "@/contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Search,
  Calendar as CalendarIcon,
  Users,
  X,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

const MAX_GUESTS_PER_ROOM = 8;
const MAX_CHILD_AGE = 15;


function RoomConfigPanel({
  roomIndex,
  config,
  onChange,
  onRemove,
  canRemove,
}: {
  roomIndex: number;
  config: IRoomConfig;
  onChange: (updated: IRoomConfig) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const totalGuests = config.adults + config.children;

  const updateAdults = (delta: number) => {
    const next = config.adults + delta;
    if (next < 1 || next + config.children > MAX_GUESTS_PER_ROOM) return;
    onChange({ ...config, adults: next });
  };

  const updateChildren = (delta: number) => {
    const next = config.children + delta;
    if (next < 0 || config.adults + next > MAX_GUESTS_PER_ROOM) return;
    const newAges =
      delta > 0 ? [...config.childAges, 0] : config.childAges.slice(0, next);
    onChange({ ...config, children: next, childAges: newAges });
  };

  const updateChildAge = (index: number, age: number) => {
    const newAges = [...config.childAges];
    newAges[index] = Math.min(MAX_CHILD_AGE, Math.max(0, age));
    onChange({ ...config, childAges: newAges });
  };

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-background">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          Room {roomIndex + 1}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            ({totalGuests}/{MAX_GUESTS_PER_ROOM} guests)
          </span>
        </p>
        {canRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Adults */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Adults</p>
          <p className="text-xs text-muted-foreground">Age 16+</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"
            onClick={() => updateAdults(-1)} disabled={config.adults <= 1}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-5 text-center text-sm font-semibold tabular-nums">
            {config.adults}
          </span>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"
            onClick={() => updateAdults(1)} disabled={totalGuests >= MAX_GUESTS_PER_ROOM}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Children */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Children</p>
          <p className="text-xs text-muted-foreground">Age 0–15</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"
            onClick={() => updateChildren(-1)} disabled={config.children <= 0}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-5 text-center text-sm font-semibold tabular-nums">
            {config.children}
          </span>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full"
            onClick={() => updateChildren(1)} disabled={totalGuests >= MAX_GUESTS_PER_ROOM}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Child ages */}
      {config.children > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Child ages
          </p>
          <div className="grid grid-cols-2 gap-2">
            {config.childAges.map((age, i) => (
              <div key={i} className="space-y-1">
                <Label className="text-xs text-muted-foreground">Child {i + 1}</Label>
                <select
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                  value={age}
                  onChange={(e) => updateChildAge(i, parseInt(e.target.value))}
                >
                  {Array.from({ length: MAX_CHILD_AGE + 1 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "<1 yr" : `${n} yr`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared guest picker content
───────────────────────────────────────────── */
function GuestPickerContent({
  filters,
  totalGuests,
  onSyncRooms,
  onUpdateRoom,
  onRemoveRoom,
  onDone,
}: {
  filters: any;
  totalGuests: number;
  onSyncRooms: (n: number) => void;
  onUpdateRoom: (i: number, c: IRoomConfig) => void;
  onRemoveRoom: (i: number) => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 pb-3 border-b">
        <p className="text-sm font-semibold">
          {filters.rooms} Room{filters.rooms !== 1 ? "s" : ""} ·{" "}
          {totalGuests} Guest{totalGuests !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => onSyncRooms(filters.rooms + 1)}
          >
            <Plus className="h-3 w-3" />
            Add Room
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4"
            onClick={onDone}
          >
            Done
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {(filters.roomsArray ?? []).map((roomConfig: IRoomConfig, index: number) => (
          <RoomConfigPanel
            key={index}
            roomIndex={index}
            config={roomConfig}
            onChange={(updated) => onUpdateRoom(index, updated)}
            onRemove={() => onRemoveRoom(index)}
            canRemove={(filters.roomsArray?.length ?? 1) > 1}
          />
        ))}
      </div>

      <p className="pt-2 text-xs text-muted-foreground border-t">
        Max {MAX_GUESTS_PER_ROOM} guests per room · Children age 0–15
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main SearchWidget
───────────────────────────────────────────── */
interface SearchWidgetProps {
  /** Triggered by the Search button — for date-based re-fetch */
  onSearch?: () => void;
  /** Triggered when user taps Done in the guest picker — auto re-fetch */
  onGuestsDone?: () => void;
}

export default function SearchWidget({ onSearch, onGuestsDone }: SearchWidgetProps) {
  const { filters, updateFilters, resetFilters } = useSearch();

  const [guestsPopoverOpen, setGuestsPopoverOpen] = useState(false); // desktop
  const [guestsSheetOpen, setGuestsSheetOpen] = useState(false);     // mobile/tablet
  const [expanded, setExpanded] = useState(false);                   // mobile summary bar

  /* ── room helpers ── */
  const syncRoomsArray = (newRooms: number) => {
    const current = filters.roomsArray ?? [];
    const updated: IRoomConfig[] =
      newRooms > current.length
        ? [
            ...current,
            ...Array.from({ length: newRooms - current.length }, () => ({
              adults: 1, children: 0, childAges: [],
            })),
          ]
        : current.slice(0, newRooms);
    updateFilters({
      rooms: newRooms,
      roomsArray: updated,
      adults: updated.reduce((s, r) => s + r.adults, 0),
      children: updated.reduce((s, r) => s + r.children, 0),
    });
  };

  const updateRoomConfig = (index: number, config: IRoomConfig) => {
    const updated = [...(filters.roomsArray ?? [])];
    updated[index] = config;
    updateFilters({
      roomsArray: updated,
      adults: updated.reduce((s, r) => s + r.adults, 0),
      children: updated.reduce((s, r) => s + r.children, 0),
    });
  };

  const removeRoom = (index: number) => {
    const updated = (filters.roomsArray ?? []).filter((_, i) => i !== index);
    updateFilters({
      rooms: updated.length,
      roomsArray: updated,
      adults: updated.reduce((s, r) => s + r.adults, 0),
      children: updated.reduce((s, r) => s + r.children, 0),
    });
  };

  const handleGuestsDone = () => {
    setGuestsPopoverOpen(false);
    setGuestsSheetOpen(false);
    onGuestsDone?.();
  };

  const handleReset = () => {
    resetFilters();
    setGuestsPopoverOpen(false);
    setGuestsSheetOpen(false);
    setExpanded(false);
  };

  const totalGuests = filters.adults + filters.children;
  const checkInText  = filters.checkIn  ? format(filters.checkIn,  "dd MMM") : "Check-in";
  const checkOutText = filters.checkOut ? format(filters.checkOut, "dd MMM") : "Check-out";
  const guestsText   = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}, ${filters.rooms} room${filters.rooms !== 1 ? "s" : ""}`;

  const pickerProps = {
    filters,
    totalGuests,
    onSyncRooms: syncRoomsArray,
    onUpdateRoom: updateRoomConfig,
    onRemoveRoom: removeRoom,
    onDone: handleGuestsDone,
  };

  return (
    <div className="bg-card border rounded-lg shadow-sm">

      {/* ── Collapsed summary bar — mobile only ── */}
      <div
        className="flex lg:hidden items-center gap-3 p-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {checkInText} → {checkOutText}
          </p>
          <p className="text-xs text-muted-foreground truncate">{guestsText}</p>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </div>

      {/* ── Expanded fields ── */}
      <div className={cn("lg:block", expanded ? "block border-t" : "hidden")}>
        <div className="p-3 sm:p-4 space-y-2">

          {/* Date row — 2 columns always */}
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !filters.checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {filters.checkIn ? format(filters.checkIn, "dd MMM yyyy") : "Check-in"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={filters.checkIn}
                  onSelect={(date) => updateFilters({ checkIn: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-sm",
                    !filters.checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {filters.checkOut ? format(filters.checkOut, "dd MMM yyyy") : "Check-out"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={filters.checkOut}
                  onSelect={(date) => updateFilters({ checkOut: date })}
                  disabled={(date) => date < (filters.checkIn || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guests + Search + Clear row */}
          <div className="flex gap-2">

            {/* MOBILE / TABLET — Sheet (bottom drawer) */}
            <div className="flex-1 lg:hidden">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal text-sm"
                onClick={() => setGuestsSheetOpen(true)}
              >
                <Users className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{guestsText}</span>
                <ChevronDown className="ml-2 h-3 w-3 shrink-0 text-muted-foreground" />
              </Button>

              {/* Bottom sheet — renders in a portal above everything */}
              <Sheet open={guestsSheetOpen} onOpenChange={setGuestsSheetOpen}>
                <SheetContent
                  side="bottom"
                  className="rounded-t-2xl px-4 pb-8 pt-3 max-h-[88dvh] flex flex-col"
                >
                  {/* drag handle */}
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/25" />
                  <SheetHeader className="text-left mb-3 shrink-0">
                    <SheetTitle className="text-base font-semibold">
                      Guests &amp; Rooms
                    </SheetTitle>
                  </SheetHeader>
                  {/* scrollable content */}
                  <div className="flex-1 overflow-y-auto">
                    <GuestPickerContent {...pickerProps} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* DESKTOP — Popover */}
            <div className="flex-1 hidden lg:block">
              <Popover open={guestsPopoverOpen} onOpenChange={setGuestsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm"
                  >
                    <Users className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{guestsText}</span>
                    <ChevronDown className="ml-2 h-3 w-3 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-96 max-h-[70vh] overflow-y-auto p-4 z-50"
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  avoidCollisions
                  collisionPadding={16}
                >
                  <GuestPickerContent {...pickerProps} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search button */}
            <Button
              className="shrink-0 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={onSearch}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </Button>

            {/* Clear */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="Clear all filters"
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
} 