import { useEffect, useState } from "react";
import { Ban, PlayCircle, CalendarIcon } from "lucide-react";
import { useStartStopSellService } from "../services/index";
import axiosInstance from "@/components/axiosInstance";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface RatePlan {
    id: string;
    ratePlanCode: string;
    ratePlanName: string;
}

interface RoomType {
    id: string;
    roomName: string;
    roomType: string;
}

interface FormData {
    from: Date;
    to: Date;
    ratePlanCode: string;
    roomTypeCode: string;
    isSellStop: boolean;
}

interface StartStopSellFormProps {
    propertyId: string;
}

export default function StartStopSellForm({ propertyId }: StartStopSellFormProps) {
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        from: new Date(),
        to: new Date(),
        ratePlanCode: "",
        roomTypeCode: "",
        isSellStop: true,
    });

    useEffect(() => {
        if (propertyId) {
            fetchPropertyData();
        }
    }, [propertyId]);

    const fetchPropertyData = async () => {
        try {
            setIsLoading(true);
            const axios = axiosInstance();
            
            // Fetch rate plans
            try {
                const ratePlansResponse = await axios.get(`/ari/rate-plan/${propertyId}`);
                if (ratePlansResponse.data?.data) {
                    const ratePlansData = ratePlansResponse.data.data || [];
                    setRatePlans(ratePlansData);
                }
            } catch (rateError) {
                console.warn("Failed to fetch rate plans:", rateError);
            }

            // Fetch room types
            try {
                const roomTypesResponse = await axios.get(`/property-management/property/${propertyId}/room/inv-setup`);
                if (roomTypesResponse.data?.data) {
                    const roomTypesData = roomTypesResponse.data.data || [];
                    setRoomTypes(roomTypesData);
                }
            } catch (roomError) {
                console.warn("Failed to fetch room types:", roomError);
            }
        } catch (error) {
            console.error("Error fetching property data:", error);
            toast.error("Failed to load property data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.ratePlanCode && !formData.roomTypeCode) {
            toast.error("Please select at least one: Rate Plan or Room Type");
            return;
        }
        if (!formData.from || !formData.to) {
            toast.error("Please select both from and to dates");
            return;
        }
        if (formData.to < formData.from) {
            toast.error("To date cannot be earlier than From date");
            return;
        }

        setIsSubmitting(true);
        try {
            // Format dates to YYYY-MM-DD without timezone conversion
            const formatDateToLocal = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const dataToSend = {
                ...formData,
                from: formatDateToLocal(formData.from),
                to: formatDateToLocal(formData.to),
            };

            // Call the service to handle start/stop sell
            const response = await useStartStopSellService(propertyId, {
                from: new Date(dataToSend.from),
                to: new Date(dataToSend.to),
                ratePlanCode: dataToSend.ratePlanCode,
                roomTypeCode: dataToSend.roomTypeCode,
                isSellStop: dataToSend.isSellStop,
            });
            
            if (response.success) {
                toast.success(response.message || `Sale ${formData.isSellStop ? 'stopped' : 'started'} successfully`);
                // Reset form
                setFormData({
                    from: new Date(),
                    to: new Date(),
                    ratePlanCode: "",
                    roomTypeCode: "",
                    isSellStop: true,
                });
            } else {
                toast.error(response.message || "Failed to process start/stop sell");
            }
        } catch (error) {
            console.error("Start/Stop Sell Error:", error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading && (ratePlans.length === 0 || roomTypes.length === 0)) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid gap-6">
                {/* Action Type */}
                <div className="grid gap-2">
                    <Label>Action</Label>
                    <div className="flex gap-4">
                        <Button
                            variant={formData.isSellStop ? "default" : "outline"}
                            onClick={() => setFormData({ ...formData, isSellStop: true })}
                            className="flex items-center gap-2"
                        >
                            <Ban className="w-4 h-4" />
                            Stop Sales
                        </Button>
                        <Button
                            variant={!formData.isSellStop ? "default" : "outline"}
                            onClick={() => setFormData({ ...formData, isSellStop: false })}
                            className="flex items-center gap-2"
                        >
                            <PlayCircle className="w-4 h-4" />
                            Start Sales
                        </Button>
                    </div>
                </div>

                {/* Rate Plan Selection */}
                <div className="grid gap-2">
                    <Label>Rate Plan (Optional)</Label>
                    <Select
                        value={formData.ratePlanCode}
                        onValueChange={(value) =>
                            setFormData({ ...formData, ratePlanCode: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select rate plan (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {ratePlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.ratePlanCode}>
                                    {plan.ratePlanName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Room Type Selection */}
                <div className="grid gap-2">
                    <Label>Room Type (Optional)</Label>
                    <Select
                        value={formData.roomTypeCode}
                        onValueChange={(value) =>
                            setFormData({ ...formData, roomTypeCode: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select room type (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                            {roomTypes.map((room) => (
                                <SelectItem key={room.id} value={room.roomType}>
                                    {room.roomName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label>From Date *</Label>
                        <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !formData.from && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.from ? format(formData.from, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.from}
                                    onSelect={(date) => {
                                        date && setFormData({ ...formData, from: date });
                                        setFromDateOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid gap-2">
                        <Label>To Date *</Label>
                        <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        !formData.to && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.to ? format(formData.to, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.to}
                                    onSelect={(date) => {
                                        date && setFormData({ ...formData, to: date });
                                        setToDateOpen(false);
                                    }}
                                    initialFocus
                                    disabled={(date) => date < formData.from}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={formData.isSellStop ? "bg-destructive hover:bg-destructive/90" : "bg-success hover:bg-success/90"}
                    >
                        {isSubmitting ? "Processing..." : formData.isSellStop ? "Stop Sales" : "Start Sales"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setFormData({
                                from: new Date(),
                                to: new Date(),
                                ratePlanCode: "",
                                roomTypeCode: "",
                                isSellStop: true,
                            });
                        }}
                        disabled={isSubmitting}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}