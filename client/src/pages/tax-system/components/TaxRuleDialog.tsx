import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import type { ICTaxRule, ITaxRule, TaxType, TaxApplicableOn } from "../interface";
import { currencies } from "@/components/currency-code/cuurency";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

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
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ICTaxRule>({
        name: "",
        type: "percentage",
        value: 0,
        applicableOn: "room_rate",
        description: "",
        priority: 0,
        currencyCode: "AED",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
                    priority: taxRule.priority,
                    currencyCode: taxRule.currencyCode,
                });
            } else {
                setFormData({
                    name: "",
                    type: "percentage",
                    value: 0,
                    applicableOn: "room_rate",
                    description: "",
                    priority: 1,
                    currencyCode: "AED",
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
                priority: 0,
                currencyCode: "AED",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "create" ? t("TaxRuleDialog.title.create") : t("TaxRuleDialog.title.edit")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? t("TaxRuleDialog.description.create")
                            : t("TaxRuleDialog.description.edit")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tax Rule Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("TaxRuleDialog.form.name")}</Label>
                        <Input
                            id="name"
                            placeholder={t("TaxRuleDialog.form.namePlaceholder")}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </div>

                    {/* Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">{t("TaxRuleDialog.form.taxType")}</Label>
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
                                    <SelectItem value="percentage">{t("TaxRuleDialog.taxTypes.percentage")}</SelectItem>
                                    <SelectItem value="fixed">{t("TaxRuleDialog.taxTypes.fixed")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="value">
                                {formData.type === "percentage" ? t("TaxRuleDialog.form.valuePercent") : t("TaxRuleDialog.form.valueAmount")}
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
                    {formData.type === "fixed" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="currencyCode">{t("TaxRuleDialog.form.currencyCode")}</Label>
                                <Select
                                    value={formData.currencyCode}
                                    onValueChange={(value) => setFormData({ ...formData, currencyCode: value as CurrencyCode })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((currency) => (
                                            <SelectItem key={currency.code} value={currency.code}>
                                                {currency.name} ({currency.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                    {/* Applicable On */}
                    <div className="space-y-2">
                        <Label htmlFor="applicableOn">{t("TaxRuleDialog.form.applicableOn")}</Label>
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
                                <SelectItem value="room_rate">{t("TaxRuleDialog.applicableOn.roomRate")}</SelectItem>
                                <SelectItem value="total_amount">{t("TaxRuleDialog.applicableOn.totalAmount")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">{t("TaxRuleDialog.form.priority")}</Label>
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
                            {t("TaxRuleDialog.form.priorityHint")}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">{t("TaxRuleDialog.form.description")}</Label>
                        <Textarea
                            id="description"
                            placeholder={t("TaxRuleDialog.form.descriptionPlaceholder")}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            rows={3}
                        />
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        {t("TaxRuleDialog.form.cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? t("TaxRuleDialog.form.saving") : mode === "create" ? t("TaxRuleDialog.form.create") : t("TaxRuleDialog.form.update")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
