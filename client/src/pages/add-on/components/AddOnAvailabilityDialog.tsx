import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IAddonAvailabilityCreate, IAddon } from "../interface";

interface AddOnAvailabilityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: IAddonAvailabilityCreate) => Promise<void>;
    addOns: IAddon[];
    selectedAddonId?: string;
}

export default function AddOnAvailabilityDialog({
    open,
    onOpenChange,
    onSave,
    addOns,
    selectedAddonId,
}: AddOnAvailabilityDialogProps) {
    const [formData, setFormData] = useState<IAddonAvailabilityCreate>({
        addonId: selectedAddonId || "",
        from: new Date(),
        to: new Date(),
        price: 0,
        currencyCode: "INR",
        isAvailable: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedAddonId) {
            setFormData(prev => ({ ...prev, addonId: selectedAddonId }));
        }
    }, [selectedAddonId]);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await onSave(formData);
            resetForm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setFormData({
            addonId: selectedAddonId || "",
            from: new Date(),
            to: new Date(),
            price: 0,
            currencyCode: "INR",
            isAvailable: true,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create Availability</DialogTitle>
                    <DialogDescription>
                        Set pricing and availability for an add-on across a date range.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Add-On Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="addonId">Add-On *</Label>
                        <Select
                            value={formData.addonId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, addonId: value })
                            }
                            disabled={!!selectedAddonId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an add-on" />
                            </SelectTrigger>
                            <SelectContent>
                                {addOns.filter(a => a.isActive).map((addOn) => (
                                    <SelectItem key={addOn.id} value={addOn.id}>
                                        {addOn.name} ({addOn.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>From Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.from && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.from ? (
                                            format(formData.from, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                            <PopoverContent className="w-[8rem] sm:w-[10rem] md:w-[14rem] p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.from}
                                        onSelect={(date) =>
                                            date && setFormData({ ...formData, from: date })
                                        }
                                                                                                                    className="rounded-md border w-full"

                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>To Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.to && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.to ? (
                                            format(formData.to, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                            <PopoverContent className="w-[8rem] sm:w-[10rem] md:w-[14rem] p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.to}
                                        onSelect={(date) =>
                                            date && setFormData({ ...formData, to: date })
                                        }
                                        initialFocus
                                        disabled={(date) =>
                                            formData.from ? date < formData.from : false
                                        }
                                                                            className="rounded-md border w-full"

                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Price and Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price *</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter price"
                                value={formData.price || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        price: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currencyCode">Currency *</Label>
                            <Select
                                value={formData.currencyCode}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, currencyCode: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INR">INR (₹)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between space-x-2 py-2">
                        <Label htmlFor="isAvailable" className="cursor-pointer">
                            Available for Booking
                        </Label>
                        <Switch
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isAvailable: checked })
                            }
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Availability"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
