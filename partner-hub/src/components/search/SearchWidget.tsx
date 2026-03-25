import { useState } from "react";
import { IRoomConfig, useSearch } from "@/contexts/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Search,
  Calendar as CalendarIcon,
  Users,
  X,
  SlidersHorizontal,
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
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Adults</p>
          <p className="text-xs text-muted-foreground">Age 16+</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => updateAdults(-1)} disabled={config.adults <= 1}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">{config.adults}</span>
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => updateAdults(1)} disabled={totalGuests >= MAX_GUESTS_PER_ROOM}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Children</p>
          <p className="text-xs text-muted-foreground">Age 0–15</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => updateChildren(-1)} disabled={config.children <= 0}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm font-medium">{config.children}</span>
          <Button variant="outline" size="icon" className="h-7 w-7"
            onClick={() => updateChildren(1)} disabled={totalGuests >= MAX_GUESTS_PER_ROOM}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

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
                      {n === 0 ? "<1 year" : `${n} year`}
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

export default function SearchWidget() {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false); // ← mobile expand state

  const syncRoomsArray = (newRooms: number) => {
    const current = filters.roomsArray ?? [];
    let updated: IRoomConfig[];
    if (newRooms > current.length) {
      const toAdd = Array.from({ length: newRooms - current.length }, () => ({
        adults: 1, children: 0, childAges: [],
      }));
      updated = [...current, ...toAdd];
    } else {
      updated = current.slice(0, newRooms);
    }
    const totalAdults = updated.reduce((s, r) => s + r.adults, 0);
    const totalChildren = updated.reduce((s, r) => s + r.children, 0);
    updateFilters({ rooms: newRooms, roomsArray: updated, adults: totalAdults, children: totalChildren });
  };

  const updateRoomConfig = (index: number, config: IRoomConfig) => {
    const updated = [...(filters.roomsArray ?? [])];
    updated[index] = config;
    const totalAdults = updated.reduce((s, r) => s + r.adults, 0);
    const totalChildren = updated.reduce((s, r) => s + r.children, 0);
    updateFilters({ roomsArray: updated, adults: totalAdults, children: totalChildren });
  };

  const removeRoom = (index: number) => {
    const updated = (filters.roomsArray ?? []).filter((_, i) => i !== index);
    const totalAdults = updated.reduce((s, r) => s + r.adults, 0);
    const totalChildren = updated.reduce((s, r) => s + r.children, 0);
    updateFilters({ rooms: updated.length, roomsArray: updated, adults: totalAdults, children: totalChildren });
  };

  const handleReset = () => {
    resetFilters();
    setGuestsOpen(false);
    setShowAdvanced(false);
    setExpanded(false);
  };

  const totalGuests = filters.adults + filters.children;

  // Summary line shown in collapsed state
  const checkInText = filters.checkIn ? format(filters.checkIn, "dd MMM") : "Check-in";
  const checkOutText = filters.checkOut ? format(filters.checkOut, "dd MMM") : "Check-out";
  const guestsText = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}, ${filters.rooms} room${filters.rooms !== 1 ? "s" : ""}`;

  return (
    <div className="bg-card border rounded-lg shadow-sm">

      {/* ── Collapsed bar — mobile only ── */}
      <div
        className="flex lg:hidden items-center gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {checkInText} → {checkOutText}
          </p>
          <p className="text-xs text-muted-foreground truncate">{guestsText}</p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* ── Expanded content — always visible on lg, toggle on mobile ── */}
      <div className={cn(
        "lg:block",
        expanded ? "block border-t" : "hidden",
      )}>
        <div className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">

            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search properties or rooms..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Check-in */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full lg:w-[180px] justify-start text-left font-normal shrink-0",
                    !filters.checkIn && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {filters.checkIn ? format(filters.checkIn, "dd MMM yyyy") : "Check-in"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.checkIn}
                  onSelect={(date) => updateFilters({ checkIn: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Check-out */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full lg:w-[180px] justify-start text-left font-normal shrink-0",
                    !filters.checkOut && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {filters.checkOut ? format(filters.checkOut, "dd MMM yyyy") : "Check-out"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.checkOut}
                  onSelect={(date) => updateFilters({ checkOut: date })}
                  disabled={(date) => date < (filters.checkIn || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Guests & Rooms */}
            <Popover open={guestsOpen} onOpenChange={setGuestsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full lg:w-[190px] justify-start text-left font-normal shrink-0"
                >
                  <Users className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {totalGuests} Guest{totalGuests !== 1 ? "s" : ""}, {filters.rooms} Room{filters.rooms !== 1 ? "s" : ""}
                  </span>
                  <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[min(384px,calc(100vw-1rem))] max-h-[70vh] overflow-y-auto"
                align="end"
                side="bottom"
                sideOffset={8}
                avoidCollisions={true}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
                    <p className="text-sm font-semibold">
                      {filters.rooms} Room{filters.rooms !== 1 ? "s" : ""} ·{" "}
                      {totalGuests} Guest{totalGuests !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => syncRoomsArray(filters.rooms + 1)}
                      >
                        <Plus className="h-3 w-3" />
                        Add Room
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setGuestsOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>

                  {(filters.roomsArray ?? []).map((roomConfig, index) => (
                    <RoomConfigPanel
                      key={index}
                      roomIndex={index}
                      config={roomConfig}
                      onChange={(updated) => updateRoomConfig(index, updated)}
                      onRemove={() => removeRoom(index)}
                      canRemove={(filters.roomsArray?.length ?? 1) > 1}
                    />
                  ))}

                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Max {MAX_GUESTS_PER_ROOM} guests per room · Children age 0–15
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Advanced Filters */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn("shrink-0", showAdvanced && "bg-accent")}
            >
              <SlidersHorizontal className="h-4 w-4" />
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

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className="pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price Range (per night)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        updateFilters({
                          priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]],
                        })
                      }
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        updateFilters({
                          priceRange: [filters.priceRange[0], parseInt(e.target.value) || 50000],
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amenities</Label>
                  <Input placeholder="Coming soon..." disabled className="bg-muted" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}