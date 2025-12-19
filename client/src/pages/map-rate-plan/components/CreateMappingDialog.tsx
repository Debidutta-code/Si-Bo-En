import { useState } from "react";
import { toast } from "react-hot-toast";
import { Plus, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ICreateCharges, RatePlan, RoomTypes, IBaseGuestAmounts, IAdditionalGuestAmount } from "../types";

interface CreateMappingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (mapping: ICreateCharges) => void;
    ratePlans: RatePlan[];
    roomTypes: RoomTypes[];
    filters: {
        ratePlanCode?: string;
        roomTypeCode?: string;
        startDate?: string;
        endDate?: string;
    };
}

export default function CreateMappingDialog({
    open,
    onOpenChange,
    onSave,
    ratePlans,
    roomTypes,
    filters,
}: CreateMappingDialogProps) {
    const [formData, setFormData] = useState<ICreateCharges>({
        ratePlanCode: filters.ratePlanCode || "",
        roomTypeCode: filters.roomTypeCode || "",
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
        currencyCode: "USD",
        baseByGuestAmounts: [{ numberOfGuests: 1, amountBeforeTax: "" }],
        additionalGuestAmounts: [],
    });

    const handleAddBaseGuestAmount = () => {
        const nextGuestNumber = formData.baseByGuestAmounts.length + 1;
        setFormData({
            ...formData,
            baseByGuestAmounts: [
                ...formData.baseByGuestAmounts,
                { numberOfGuests: nextGuestNumber, amountBeforeTax: "" },
            ],
        });
    };

    const handleRemoveBaseGuestAmount = (index: number) => {
        if (formData.baseByGuestAmounts.length <= 1) {
            toast.error("At least one base guest amount is required");
            return;
        }
        const updated = formData.baseByGuestAmounts.filter((_, i) => i !== index);
        setFormData({ ...formData, baseByGuestAmounts: updated });
    };

    const handleBaseGuestAmountChange = (index: number, field: keyof IBaseGuestAmounts, value: number) => {
        const updated = [...formData.baseByGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, baseByGuestAmounts: updated });
    };

    const handleAddAdditionalGuestAmount = () => {
        setFormData({
            ...formData,
            additionalGuestAmounts: [
                ...formData.additionalGuestAmounts,
                { ageQualifyingCode: "10", amount: 0 },
            ],
        });
    };

    const handleRemoveAdditionalGuestAmount = (index: number) => {
        const updated = formData.additionalGuestAmounts.filter((_, i) => i !== index);
        setFormData({ ...formData, additionalGuestAmounts: updated });
    };

    const handleAdditionalGuestAmountChange = (
        index: number,
        field: keyof IAdditionalGuestAmount,
        value: string | number
    ) => {
        const updated = [...formData.additionalGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, additionalGuestAmounts: updated });
    };

    const handleSubmit = () => {
        // Validation
        if (!formData.ratePlanCode) {
            toast.error("Please select a rate plan");
            return;
        }
        if (!formData.roomTypeCode) {
            toast.error("Please select a room type");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            toast.error("Please select start and end dates");
            return;
        }
        if (formData.baseByGuestAmounts.length === 0) {
            toast.error("At least one base guest amount is required");
            return;
        }

        // Check if all amounts are valid
        const hasInvalidAmount = formData.baseByGuestAmounts.some((item) => parseFloat(item.amountBeforeTax) <= 0);
        if (hasInvalidAmount) {
            toast.error("All base guest amounts must be greater than 0");
            return;
        }

        onSave(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            ratePlanCode: filters.ratePlanCode || "",
            roomTypeCode: filters.roomTypeCode || "",
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            currencyCode: "USD",
            baseByGuestAmounts: [{ numberOfGuests: 1, amountBeforeTax: "" }],
            additionalGuestAmounts: [],
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Mapping</DialogTitle>
                    <DialogDescription>
                        Map a rate plan to a room type and set pricing details
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Room Type *</Label>
                        <Select
                            value={formData.roomTypeCode}
                            onValueChange={(value) =>
                                setFormData({ ...formData, roomTypeCode: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                                {roomTypes.map((room) => (
                                    <SelectItem key={room.id} value={room.roomType}>
                                        {room.roomName} ({room.roomType})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                        <div className="space-y-2">
                            <Label>Rate Plan *</Label>
                            <Select
                                value={formData.ratePlanCode}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, ratePlanCode: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rate plan" />
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



                        <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>End Date *</Label>
                            <Input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                min={formData.startDate || new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Currency Code</Label>
                            <Input
                                value={formData.currencyCode}
                                onChange={(e) =>
                                    setFormData({ ...formData, currencyCode: e.target.value })
                                }
                                placeholder="USD"
                            />
                        </div>
                    </div>

                    {/* Base Guest Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Base Guest Amounts *</CardTitle>
                            <CardDescription>
                                Set pricing based on the number of guests
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {formData.baseByGuestAmounts.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>Number of Guests</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.numberOfGuests}
                                            onChange={(e) =>
                                                handleBaseGuestAmountChange(
                                                    index,
                                                    "numberOfGuests",
                                                    parseInt(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Amount ($)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.amountBeforeTax}
                                            onChange={(e) =>
                                                handleBaseGuestAmountChange(
                                                    index,
                                                    "amountBeforeTax",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveBaseGuestAmount(index)}
                                        disabled={formData.baseByGuestAmounts.length <= 1}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddBaseGuestAmount}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Guest Amount
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Additional Guest Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Additional Guest Amounts (Optional)</CardTitle>
                            <CardDescription>
                                Set pricing for additional guests by age category
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {formData.additionalGuestAmounts.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>Age Code</Label>
                                        <Select
                                            value={item.ageQualifyingCode}
                                            onValueChange={(value) =>
                                                handleAdditionalGuestAmountChange(index, "ageQualifyingCode", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">Adult (10)</SelectItem>
                                                <SelectItem value="8">Child (8)</SelectItem>
                                                <SelectItem value="5">Infant (5)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>Amount ($)</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.amount}
                                            onChange={(e) =>
                                                handleAdditionalGuestAmountChange(
                                                    index,
                                                    "amount",
                                                    parseFloat(e.target.value) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveAdditionalGuestAmount(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddAdditionalGuestAmount}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Additional Guest Amount
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>Create Mapping</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
