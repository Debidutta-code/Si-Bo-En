import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Ban, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { ICStartStopSell } from "../types";
import type { RatePlan } from "../../rate-plan/interfaces/ratePlan.type";

interface RoomType {
    id: string;
    roomTypeCode: string;
    roomTypeName: string;
    
}

interface StartStopSellDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: ICStartStopSell & { isSellStop: boolean }) => Promise<any>;
    ratePlans: RatePlan[];
    roomTypes: RoomType[];
}

export default function StartStopSellDialog({
    open,
    onOpenChange,
    onSave,
    ratePlans,
    roomTypes,
}: StartStopSellDialogProps) {
    const [formData, setFormData] = useState<ICStartStopSell & { isSellStop: boolean }>({
        from: new Date(),
        to: new Date(),
        ratePlanCode: "",
        roomTypeCode: "",
        isSellStop: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

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

            const response = await onSave(dataToSend as any);
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
                onOpenChange(false);
            } else {
                toast.error(response.message || "Failed to update sell status");
            }
        } catch (error) {
            toast.error("An error occurred while updating sell status");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {formData.isSellStop ? (
                            <>
                                <Ban className="w-5 h-5 text-red-600" />
                                Stop Sales
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-5 h-5 text-green-600" />
                                Start Sales
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {formData.isSellStop 
                            ? "Block sales for specific rate plans and/or room types during selected dates. Select at least one."
                            : "Enable sales for specific rate plans and/or room types during selected dates. Select at least one."}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Action Type */}
                    <div className="grid gap-2">
                        <Label>Action</Label>
                        <Select
                            value={formData.isSellStop ? "stop" : "start"}
                            onValueChange={(value) =>
                                setFormData({ ...formData, isSellStop: value === "stop" })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="stop">
                                    <div className="flex items-center gap-2">
                                        <Ban className="w-4 h-4 text-red-600" />
                                        Stop Sales
                                    </div>
                                </SelectItem>
                                <SelectItem value="start">
                                    <div className="flex items-center gap-2">
                                        <PlayCircle className="w-4 h-4 text-green-600" />
                                        Start Sales
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
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
                                    <SelectItem key={room.id} value={room.roomTypeCode}>
                                        {room.roomTypeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>From Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !formData.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 p-2" />
                                        {formData.from ? format(formData.from, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.from}
                                        onSelect={(date) =>
                                            date && setFormData({ ...formData, from: date })
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-2">
                            <Label>To Date *</Label>
                            <Popover>
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
                                        onSelect={(date) =>
                                            date && setFormData({ ...formData, to: date })
                                        }
                                        initialFocus
                                        disabled={(date) => date < formData.from}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={formData.isSellStop ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                        {isSubmitting ? "Processing..." : formData.isSellStop ? "Stop Sales" : "Start Sales"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
