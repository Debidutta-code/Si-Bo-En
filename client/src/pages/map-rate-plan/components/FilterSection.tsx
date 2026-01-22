import { Calendar, Filter, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { IFilterProps, RatePlan, RoomTypes } from "../types";

interface FilterSectionProps {
    filters: IFilterProps;
    setFilters: (filters: IFilterProps) => void;
    dateRange: { from: Date | undefined; to: Date | undefined };
    handleDateSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
    ratePlans: RatePlan[];
    roomTypes: RoomTypes[];
    onSearch: () => void;
    onCreateMapping: () => void;
}

export default function FilterSection({
    filters,
    setFilters,
    dateRange,
    handleDateSelect,
    ratePlans,
    roomTypes,
    onSearch,
    onCreateMapping,
}: FilterSectionProps) {
    return (
        <Card className="shadow-lg mb-6">
            <CardHeader className="border-b bg-white">
                <CardTitle className="text-xl flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filter & Search
                </CardTitle>
                <CardDescription>
                    Select rate plan, room type, and date range to view or create mappings
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Rate Plan Selection */}


                    {/* Room Type Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Room Type</Label>
                        <Select
                            value={filters.roomTypeCode}
                            onValueChange={(value) => setFilters({ ...filters, roomTypeCode: value })}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                                {roomTypes.length > 0 ? (
                                    roomTypes.map((room) => (
                                        <SelectItem key={room.id} value={room.roomType}>
                                            {room.roomName} ({room.roomType})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-rooms" disabled>
                                        No room types available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Rate Plan</Label>
                        <Select
                            value={filters.ratePlanCode}
                            onValueChange={(value) => setFilters({ ...filters, ratePlanCode: value })}
                        >
                            <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select rate plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {ratePlans.length > 0 ? (
                                    ratePlans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.ratePlanCode}>
                                            {plan.ratePlanName}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-plans" disabled>
                                        No rate plans available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-11 justify-start text-left font-normal",
                                        !dateRange.from && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className=" p-0" align="start">
                                <CalendarComponent
                                    className="rounded-md border w-full"
                                    mode="single"
                                    selected={dateRange.from}
                                    onSelect={(date) => handleDateSelect({ from: date, to: dateRange.to })}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">End Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-11 justify-start text-left font-normal",
                                        !dateRange.to && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className=" p-0" align="start">
                                <CalendarComponent
                                    className="rounded-md border w-full"

                                    mode="single"
                                    selected={dateRange.to}
                                    onSelect={(date) => handleDateSelect({ from: dateRange.from, to: date })}
                                    disabled={(date) => {
                                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                                        if (date < today) return true;
                                        if (dateRange.from && date < dateRange.from) return true;
                                        return false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">

                    <Button onClick={onSearch} className="flex-1" variant="outline">
                        <Search className="w-4 h-4 mr-2" />
                        Search Mappings
                    </Button>
                    {/* <Button onClick={onStartStopSell} className="flex-1/2" variant="terciary">
                        <Activity className="w-4 h-4 mr-2" />
                        Start/Stop Sell
                    </Button> */}
                    <Button onClick={onCreateMapping} className="flex-1">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Mapping
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
