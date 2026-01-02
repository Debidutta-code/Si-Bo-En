// components/RestrictionForm.tsx

import { useState, useEffect } from "react";
import { CalendarIcon, Ban, DoorOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { CreateRestrictionPayload, RoomType, RatePlan, RestrictionType, Restriction } from "../interfaces";
import { applyRestrictionService } from "../services";

interface RestrictionFormProps {
    propertyCode: string;
    roomTypes: RoomType[];
    ratePlans: RatePlan[];
    onSuccess: () => void;
    onCancel: () => void;
    editData?: Restriction | null;
}

export default function RestrictionForm({
    propertyCode,
    roomTypes,
    ratePlans,
    onSuccess,
    onCancel,
    editData
}: RestrictionFormProps) {
    const [restrictionType, setRestrictionType] = useState<RestrictionType>("CTA");
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [notes, setNotes] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
    const [selectedRatePlans, setSelectedRatePlans] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill form when editing
    useEffect(() => {
        if (editData) {
            setRestrictionType(editData.isClosedToArrival ? "CTA" : "CTD");
            setSelectedDates([new Date(editData.date)]);
            setNotes(editData.restrictionNotes || "");
            setIsActive(true);
            
            // Auto-select the room type and rate plan
            setSelectedRooms([editData.roomTypeCode]);
            setSelectedRatePlans([editData.ratePlanCode]);
        }
    }, [editData]);

    const handleRoomToggle = (roomTypeCode: string) => {
        if (selectedRooms.includes(roomTypeCode)) {
            setSelectedRooms(selectedRooms.filter(code => code !== roomTypeCode));
        } else {
            setSelectedRooms([...selectedRooms, roomTypeCode]);
        }
    };

    const handleSelectAllRooms = () => {
        if (selectedRooms.length === roomTypes.length) {
            // Deselect all
            setSelectedRooms([]);
        } else {
            // Select all
            setSelectedRooms(roomTypes.map(room => room.roomType));
        }
    };

    const handleRatePlanToggle = (ratePlanCode: string) => {
        if (selectedRatePlans.includes(ratePlanCode)) {
            setSelectedRatePlans(selectedRatePlans.filter(code => code !== ratePlanCode));
        } else {
            setSelectedRatePlans([...selectedRatePlans, ratePlanCode]);
        }
    };

    const handleSelectAllRatePlans = () => {
        if (selectedRatePlans.length === ratePlans.length) {
            // Deselect all
            setSelectedRatePlans([]);
        } else {
            // Select all
            setSelectedRatePlans(ratePlans.map(plan => plan.ratePlanCode));
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (selectedDates.length === 0) {
            toast.error("Please select at least one date");
            return;
        }

        if (selectedRooms.length === 0) {
            toast.error("Please select at least one room type");
            return;
        }

        if (selectedRatePlans.length === 0) {
            toast.error("Please select at least one rate plan");
            return;
        }

        setIsSubmitting(true);

        try {
            // Build room restrictions - each selected room gets all selected rate plans
            const roomRestrictions = selectedRooms.map(roomCode => ({
                roomTypeCode: roomCode,
                ratePlanCodes: selectedRatePlans
            }));

            const payload: CreateRestrictionPayload = {
                propertyCode,
                restrictionType,
                dates: selectedDates.map(date => format(date, "yyyy-MM-dd")),
                notes,
                isActive,
                globalRatePlans: [],
                roomRestrictions
            };

            const response = await applyRestrictionService(payload);

            if (response.success) {
                toast.success(response.message || `Restriction ${isActive ? 'applied' : 'removed'} successfully`);
                onSuccess();
            } else {
                toast.error(response.message || "Failed to apply restriction");
            }
        } catch (error) {
            console.error("Restriction Error:", error);
            toast.error("An error occurred while applying restriction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const allRoomsSelected = selectedRooms.length === roomTypes.length && roomTypes.length > 0;
    const allRatePlansSelected = selectedRatePlans.length === ratePlans.length && ratePlans.length > 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                    {editData ? "Edit Restriction" : "Create New Restriction"}
                </h2>
                <Button variant="ghost" size="sm" onClick={onCancel}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Restriction Type */}
                <div className="grid gap-2">
                    <Label>Restriction Type *</Label>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant={restrictionType === "CTA" ? "default" : "outline"}
                            onClick={() => setRestrictionType("CTA")}
                            className="flex items-center gap-2"
                        >
                            <Ban className="w-4 h-4" />
                            CTA (Closed to Arrival)
                        </Button>
                        <Button
                            type="button"
                            variant={restrictionType === "CTD" ? "default" : "outline"}
                            onClick={() => setRestrictionType("CTD")}
                            className="flex items-center gap-2"
                        >
                            <DoorOpen className="w-4 h-4" />
                            CTD (Closed to Departure)
                        </Button>
                    </div>
                </div>

                {/* Date Selection */}
                <div className="grid gap-2">
                    <Label>Select Dates *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-normal",
                                    selectedDates.length === 0 && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDates.length > 0
                                    ? `${selectedDates.length} date(s) selected`
                                    : "Select dates"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={(dates) => setSelectedDates(dates || [])}
                                initialFocus
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </PopoverContent>
                    </Popover>
                    {selectedDates.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedDates.map((date, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded"
                                >
                                    {format(date, "MMM dd, yyyy")}
                                    <button
                                        onClick={() =>
                                            setSelectedDates(selectedDates.filter((_, i) => i !== index))
                                        }
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Room Types Selection */}
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label>Select Room Types *</Label>
                        {roomTypes.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAllRooms}
                            >
                                {allRoomsSelected ? "Deselect All" : "Select All"}
                            </Button>
                        )}
                    </div>
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                        {roomTypes.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No room types available</p>
                        ) : (
                            <div className="space-y-3">
                                {roomTypes.map((room) => (
                                    <div key={room.id} className="flex items-center gap-3">
                                        <Checkbox
                                            id={`room-${room.id}`}
                                            checked={selectedRooms.includes(room.roomType)}
                                            onCheckedChange={() => handleRoomToggle(room.roomType)}
                                        />
                                        <Label
                                            htmlFor={`room-${room.id}`}
                                            className="cursor-pointer flex-1"
                                        >
                                            {room.roomName}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedRooms.length > 0 && (
                        <p className="text-sm text-gray-600">
                            {selectedRooms.length} room type(s) selected
                        </p>
                    )}
                </div>

                {/* Rate Plans Selection */}
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label>Select Rate Plans *</Label>
                        {ratePlans.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAllRatePlans}
                            >
                                {allRatePlansSelected ? "Deselect All" : "Select All"}
                            </Button>
                        )}
                    </div>
                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                        {ratePlans.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No rate plans available</p>
                        ) : (
                            <div className="space-y-3">
                                {ratePlans.map((plan) => (
                                    <div key={plan.id} className="flex items-center gap-3">
                                        <Checkbox
                                            id={`plan-${plan.id}`}
                                            checked={selectedRatePlans.includes(plan.ratePlanCode)}
                                            onCheckedChange={() => handleRatePlanToggle(plan.ratePlanCode)}
                                        />
                                        <Label
                                            htmlFor={`plan-${plan.id}`}
                                            className="cursor-pointer flex-1"
                                        >
                                            {plan.ratePlanName}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {selectedRatePlans.length > 0 && (
                        <p className="text-sm text-gray-600">
                            {selectedRatePlans.length} rate plan(s) selected
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                        placeholder="Add any additional notes about this restriction..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* Action Toggle */}
                <div className="grid gap-2">
                    <Label>Action *</Label>
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                            <Switch
                                id="action-toggle"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                            />
                            <Label htmlFor="action-toggle" className="cursor-pointer font-medium">
                                {isActive ? (
                                    <span className="flex items-center gap-2 text-red-600">
                                        <Ban className="w-4 h-4" />
                                        Apply Restriction
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-green-600">
                                        <DoorOpen className="w-4 h-4" />
                                        Remove Restriction
                                    </span>
                                )}
                            </Label>
                        </div>
                        <span className="text-sm text-gray-600">
                            {isActive 
                                ? "Will block bookings for selected dates" 
                                : "Will allow bookings for selected dates"}
                        </span>
                    </div>
                </div>

                {/* Summary */}
                {selectedRooms.length > 0 && selectedRatePlans.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Summary:</p>
                        <p className="text-sm text-blue-800">
                            Applying <strong>{restrictionType}</strong> restriction to{" "}
                            <strong>{selectedRooms.length}</strong> room type(s) with{" "}
                            <strong>{selectedRatePlans.length}</strong> rate plan(s) for{" "}
                            <strong>{selectedDates.length}</strong> date(s)
                        </p>
                        <p className="text-xs text-blue-700 mt-2">
                            All selected rate plans will be applied to all selected room types.
                        </p>
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                        {isSubmitting ? "Processing..." : isActive ? "Apply Restriction" : "Remove Restriction"}
                    </Button>
                    <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
}