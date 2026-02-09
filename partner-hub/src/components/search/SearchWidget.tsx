import { useState } from "react";
import { useSearch } from "@/contexts/SearchContext";
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
  DoorOpen,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";

export default function SearchWidget() {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-card border rounded-lg shadow-sm">
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1">
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

          {/* Check-in Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full lg:w-[200px] justify-start text-left font-normal",
                  !filters.checkIn && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.checkIn ? format(filters.checkIn, "PPP") : "Check-in"}
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

          {/* Check-out Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full lg:w-[200px] justify-start text-left font-normal",
                  !filters.checkOut && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.checkOut
                  ? format(filters.checkOut, "PPP")
                  : "Check-out"}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full lg:w-[180px] justify-start text-left font-normal"
              >
                <Users className="mr-2 h-4 w-4" />
                {filters.adults + filters.children} Guests, {filters.rooms}{" "}
                Rooms
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                {/* Adults */}
                <div className="space-y-2">
                  <Label htmlFor="adults">Adults</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateFilters({
                          adults: Math.max(1, filters.adults - 1),
                        })
                      }
                      disabled={filters.adults <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="adults"
                      type="number"
                      value={filters.adults}
                      onChange={(e) =>
                        updateFilters({ adults: parseInt(e.target.value) || 1 })
                      }
                      className="text-center"
                      min={1}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateFilters({ adults: filters.adults + 1 })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="space-y-2">
                  <Label htmlFor="children">Children</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateFilters({
                          children: Math.max(0, filters.children - 1),
                        })
                      }
                      disabled={filters.children <= 0}
                    >
                      -
                    </Button>
                    <Input
                      id="children"
                      type="number"
                      value={filters.children}
                      onChange={(e) =>
                        updateFilters({
                          children: parseInt(e.target.value) || 0,
                        })
                      }
                      className="text-center"
                      min={0}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateFilters({ children: filters.children + 1 })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="space-y-2">
                  <Label htmlFor="rooms">Rooms</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateFilters({ rooms: Math.max(1, filters.rooms - 1) })
                      }
                      disabled={filters.rooms <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="rooms"
                      type="number"
                      value={filters.rooms}
                      onChange={(e) =>
                        updateFilters({ rooms: parseInt(e.target.value) || 1 })
                      }
                      className="text-center"
                      min={1}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateFilters({ rooms: filters.rooms + 1 })
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Total Summary */}
                <div className="pt-3 border-t text-sm text-muted-foreground">
                  Total: {filters.adults + filters.children} guest
                  {filters.adults + filters.children !== 1 ? "s" : ""},{" "}
                  {filters.rooms} room{filters.rooms !== 1 ? "s" : ""}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(showAdvanced && "bg-accent")}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          {/* Clear Filters */}
          <Button
            variant="ghost"
            size="icon"
            onClick={resetFilters}
            title="Clear all filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <Label>Price Range (per night)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      updateFilters({
                        priceRange: [
                          parseInt(e.target.value) || 0,
                          filters.priceRange[1],
                        ],
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
                        priceRange: [
                          filters.priceRange[0],
                          parseInt(e.target.value) || 50000,
                        ],
                      })
                    }
                  />
                </div>
              </div>

              {/* Amenities - Placeholder for future */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <Input
                  placeholder="Coming soon..."
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
