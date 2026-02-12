// components/TouristTaxDialog.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { ICTouristTax, ITouristTax, DiscountType, CurrencyCode, RatePlan } from "../interface";

interface TouristTaxDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: ICTouristTax) => Promise<void>;
    touristTax?: ITouristTax | null;
    mode: "create" | "edit";
    ratePlans: RatePlan[];
}

export default function TouristTaxDialog({
    open,
    onOpenChange,
    onSave,
    touristTax,
    mode,
    ratePlans,
}: TouristTaxDialogProps) {
    const [formData, setFormData] = useState<ICTouristTax>({
        ratePlanCode: "",
        discountType: "flat",
        discountValue: 0,
        currencyCode: "USD",
        name: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (touristTax && mode === "edit") {
                setFormData({
                    ratePlanCode: touristTax.ratePlanCode,
                    discountType: touristTax.discountType,
                    discountValue: touristTax.discountValue || 0,
                    currencyCode: touristTax.currencyCode || "USD",
                    name: ""
                });
            } else {
                setFormData({
                    ratePlanCode: "",
                    discountType: "flat",
                    discountValue: 0,
                    currencyCode: "USD",
                    name: ""
                });
            }
        }
    }, [touristTax, mode, open]);

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
        if (mode === "create") {
            setFormData({
                name: "",
                ratePlanCode: "",
                discountType: "flat",
                discountValue: 0,
                currencyCode: "USD",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "create" ? "Create Additional Charge" : "Edit Additional Charge"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? "Create a new tourist tax for your property"
                            : "Update the tourist tax details"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Rate Plan Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Tourist Tax name *</Label>
                        <Input
                            id="name"
                            placeholder={"Tourism Dhiram"}
                            value={formData.name || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                        />

                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ratePlan">Rate Plan *</Label>
                        <Select
                            value={formData.ratePlanCode}
                            onValueChange={(value) =>
                                setFormData({ ...formData, ratePlanCode: value })
                            }
                            disabled={mode === "edit"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a rate plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {ratePlans.map((ratePlan) => (
                                    <SelectItem key={ratePlan.id} value={ratePlan.ratePlanCode}>
                                        {ratePlan.ratePlanName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Discount Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discountType">Discount Type *</Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(value: DiscountType) =>
                                    setFormData({ ...formData, discountType: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flat">Flat Amount</SelectItem>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountValue">
                                {formData.discountType === "percentage" ? "Value (%)" : "Amount"} *
                            </Label>
                            <Input
                                id="discountValue"
                                type="number"
                                min="0"
                                max={formData.discountType === "percentage" ? 100 : undefined}
                                step={formData.discountType === "percentage" ? 0.01 : 1}
                                placeholder={formData.discountType === "percentage" ? "0.00" : "0"}
                                value={formData.discountValue || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountValue: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Currency Code */}
                    <div className="space-y-2">
                        <Label htmlFor="currencyCode">Currency *</Label>
                        <Select
                            value={formData.currencyCode}
                            onValueChange={(value: CurrencyCode) =>
                                setFormData({ ...formData, currencyCode: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="INR">INR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}