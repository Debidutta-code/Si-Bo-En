import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
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
import type { ICTaxRule, ITaxRule, TaxType, TaxApplicableOn } from "../interface";

interface TaxRuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: ICTaxRule) => Promise<void>;
    taxRule?: ITaxRule | null;
    mode: "create" | "edit";
}

export default function TaxRuleDialog({
    open,
    onOpenChange,
    onSave,
    taxRule,
    mode,
}: TaxRuleDialogProps) {
    const [formData, setFormData] = useState<ICTaxRule>({
        name: "",
        type: "percentage",
        value: 0,
        applicableOn: "room_rate",
        description: "",
        validFrom: new Date(),
        validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        isInclusive: false,
        priority: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);
    // Update form data when taxRule or mode changes
    useEffect(() => {
        if (open) {
            if (taxRule && mode === "edit") {
                setFormData({
                    name: taxRule.name,
                    type: taxRule.type,
                    value: taxRule.value,
                    applicableOn: taxRule.applicableOn,
                    description: taxRule.description || "",
                    validFrom: new Date(taxRule.validFrom),
                    validTo: new Date(taxRule.validTo),
                    isInclusive: taxRule.isInclusive,
                    priority: taxRule.priority,
                });
            } else {
                setFormData({
                    name: "",
                    type: "percentage",
                    value: 0,
                    applicableOn: "room_rate",
                    description: "",
                    validFrom: new Date(),
                    validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    isInclusive: false,
                    priority: 0,
                });
            }
        }
    }, [taxRule, mode, open]);

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
                type: "percentage",
                value: 0,
                applicableOn: "room_rate",
                description: "",
                validFrom: new Date(),
                validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                isInclusive: false,
                priority: 0,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "create" ? "Create Tax Rule" : "Edit Tax Rule"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "Create a new tax rule for your property" 
                            : "Update the tax rule details"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tax Rule Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Tax Rule Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., GST, Service Tax, VAT"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </div>

                    {/* Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tax Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: TaxType) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">
                                {formData.type === "percentage" ? "Value (%)" : "Amount"} *
                            </Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                max={formData.type === "percentage" ? 100 : undefined}
                                step={formData.type === "percentage" ? 0.01 : 1}
                                placeholder={formData.type === "percentage" ? "0.00" : "0"}
                                value={formData.value || ""}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        value: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* Applicable On */}
                    <div className="space-y-2">
                        <Label htmlFor="applicableOn">Applicable On *</Label>
                        <Select
                            value={formData.applicableOn}
                            onValueChange={(value: TaxApplicableOn) =>
                                setFormData({ ...formData, applicableOn: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="room_rate">Room Rate</SelectItem>
                                <SelectItem value="total_amount">Total Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority (0-5) *</Label>
                        <Input
                            id="priority"
                            type="number"
                            min="0"
                            max="5"
                            placeholder="0"
                            value={formData.priority}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    priority: parseInt(e.target.value) || 0,
                                })
                            }
                        />
                        <p className="text-xs text-gray-500">
                            Higher priority taxes are calculated first
                        </p>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Valid From *</Label>
                            <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.validFrom && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.validFrom ? (
                                            format(formData.validFrom, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.validFrom}
                                        onSelect={(date) => {

                                            date && setFormData({ ...formData, validFrom: date });
                                            setFromDateOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Valid To *</Label>
                            <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !formData.validTo && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.validTo ? (
                                            format(formData.validTo, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.validTo}
                                        onSelect={(date) => {
                                            date && setFormData({ ...formData, validTo: date });
                                            setToDateOpen(false);
                                        }}
                                        initialFocus
                                        disabled={(date) =>
                                            formData.validFrom ? date < formData.validFrom : false
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Add any additional details about this tax rule..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                    {/* Is Inclusive */}
                    {/* <div className="flex items-center justify-between space-x-2 py-2">
                        <div className="space-y-0.5">
                            <Label htmlFor="isInclusive" className="cursor-pointer">
                                Tax Inclusive
                            </Label>
                            <p className="text-xs text-gray-500">
                                Include tax in displayed price
                            </p>
                        </div>
                        <Switch
                            id="isInclusive"
                            checked={formData.isInclusive}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isInclusive: checked })
                            }
                        />
                    </div> */}
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
