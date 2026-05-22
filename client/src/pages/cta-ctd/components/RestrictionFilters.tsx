// components/RestrictionFilters.tsx

import { CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { RestrictionFilters, RoomType, RatePlan } from "../interfaces";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface RestrictionFiltersProps {
    filters: RestrictionFilters;
    onFilterChange: (filters: RestrictionFilters) => void;
    roomTypes: RoomType[];
    ratePlans: RatePlan[];
    onReset: () => void;
}

export default function RestrictionFiltersComponent({
    filters,
    onFilterChange,
    roomTypes,
    ratePlans,
    onReset
}: RestrictionFiltersProps) {
        const { t } = useTranslation();

    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);
    const handleStartDateChange = (date: Date | undefined) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            onFilterChange({ ...filters, startDate: formattedDate });
            setFromDateOpen(false);
        }
    };

    const handleEndDateChange = (date: Date | undefined) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            onFilterChange({ ...filters, endDate: formattedDate });
            setToDateOpen(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold">{t("CTACTD.filters.title")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Restriction Type */}
                <div className="grid gap-2">
                    <Label>{t("CTACTD.filters.restrictionType")}</Label>
                    <Select
                        value={filters.restrictionType || ""}
                        onValueChange={(value) =>
                            onFilterChange({ 
                                ...filters, 
                                restrictionType: value === "all" ? null : value as 'CTA' | 'CTD' 
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t("CTACTD.filters.all")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("CTACTD.filters.all")}</SelectItem>
                            <SelectItem value="CTA">{t("CTACTD.filters.ctaClosedToArrival")}</SelectItem>
                            <SelectItem value="CTD">{t("CTACTD.filters.ctdClosedToDeparture")}</SelectItem>
                        </SelectContent>

                    </Select>
                </div>

                {/* Start Date */}
                <div className="grid gap-2">
                    <Label>{t("CTACTD.filters.startDate")}</Label>
                    <Popover onOpenChange={setFromDateOpen} open={fromDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !filters.startDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.startDate
                                    ? format(new Date(filters.startDate), "PPP")
                                    : t("CTACTD.filters.pickDate")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                                onSelect={handleStartDateChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* End Date */}
                <div className="grid gap-2">
                    <Label>{t("CTACTD.filters.endDate")}</Label>
                    <Popover onOpenChange={setToDateOpen} open={toDateOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !filters.endDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.endDate
                                    ? format(new Date(filters.endDate), "PPP")
                                    : t("CTACTD.filters.pickDate")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                                onSelect={handleEndDateChange}
                                initialFocus
                                disabled={(date) =>
                                    filters.startDate
                                        ? date < new Date(filters.startDate)
                                        : false
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Room Type */}
                <div className="grid gap-2">
                    <Label>{t("CTACTD.filters.roomType")}</Label>
                    <Select
                        value={filters.roomTypeCode || ""}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, roomTypeCode: value==="all" ? null : value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t("CTACTD.filters.allRooms")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("CTACTD.filters.allRooms")}</SelectItem>
                           {roomTypes.map((room) => (
    <SelectItem key={room.id} value={room.roomType}>
        {room._translations?.roomName ?? room.roomName}
    </SelectItem>
))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Rate Plan */}
                <div className="grid gap-2">
                    <Label>{t("CTACTD.filters.ratePlan")}</Label>
                    <Select
                        value={filters.ratePlanCode || ""}
                        onValueChange={(value) =>
                            onFilterChange({ ...filters, ratePlanCode: value === "all" ? null : value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={t("CTACTD.filters.allRatePlans")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("CTACTD.filters.allRatePlans")}</SelectItem>
                            {ratePlans.map((plan) => (
    <SelectItem key={plan.id} value={plan.ratePlanCode}>
        {plan._translations?.ratePlanName ?? plan.ratePlanName}
    </SelectItem>
))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4">
                <Button variant="outline" onClick={onReset} size="sm">
                    {t("CTACTD.filters.resetFilters")}
                </Button>
            </div>
        </div>
    );
}