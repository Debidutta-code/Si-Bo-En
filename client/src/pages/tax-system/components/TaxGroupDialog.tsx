import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ICTaxGroup, ITaxGroup, ITaxRule } from "../interface";

interface TaxGroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: ICTaxGroup) => Promise<void>;
    taxGroup?: ITaxGroup | null;
    mode: "create" | "edit";
    availableTaxRules: ITaxRule[];
    selectedRuleIds?: string[];
}

export default function TaxGroupDialog({
    open,
    onOpenChange,
    onSave,
    taxGroup,
    mode,
    availableTaxRules,
    selectedRuleIds = [],
}: TaxGroupDialogProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<ICTaxGroup>({
        name: "",
        isActive: true,
        taxRuleIds: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (taxGroup && mode === "edit") {
                setFormData({
                    name: taxGroup.name,
                    isActive: taxGroup.isActive,
                    taxRuleIds: selectedRuleIds,
                });
            } else {
                setFormData({
                    name: "",
                    isActive: true,
                    taxRuleIds: [],
                });
            }
        }
    }, [taxGroup, mode, selectedRuleIds, open]);

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
                isActive: true,
                taxRuleIds: [],
            });
        }
    };

    const handleRuleToggle = (ruleId: string) => {
        setFormData((prev) => {
            const currentRules = prev.taxRuleIds || [];
            const isSelected = currentRules.includes(ruleId);
            
            return {
                ...prev,
                taxRuleIds: isSelected
                    ? currentRules.filter((id) => id !== ruleId)
                    : [...currentRules, ruleId],
            };
        });
    };

    const selectedRules = availableTaxRules.filter((rule) =>
        formData.taxRuleIds?.includes(rule.id)
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "create" ? t("TaxGroupDialog.title.create") : t("TaxGroupDialog.title.edit")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? t("TaxGroupDialog.description.create")
                            : t("TaxGroupDialog.description.edit")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Tax Group Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">{t("TaxGroupDialog.form.name")}</Label>
                        <Input
                            id="name"
                            placeholder={t("TaxGroupDialog.form.namePlaceholder")}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />
                    </div>

                    {/* Is Active */}
                    <div className="flex items-center justify-between space-x-2 py-2 border-y">
                        <div className="space-y-0.5">
                            <Label htmlFor="isActive" className="cursor-pointer">
                                {t("TaxGroupDialog.form.activeStatus")}
                            </Label>
                            <p className="text-xs text-gray-500">
                                {t("TaxGroupDialog.form.activeStatusHint")}
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isActive: checked })
                            }
                        />
                    </div>

                    {/* Selected Rules Summary */}
                    {selectedRules.length > 0 && (
                        <div className="space-y-2">
                            <Label>{t("TaxGroupDialog.form.selectedRules", { count: selectedRules.length })}</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedRules.map((rule) => (
                                    <Badge key={rule.id} variant="secondary">
                                        {rule.name} ({rule.type === "percentage" ? `${rule.value}%` : `$${rule.value}`})
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tax Rules Selection */}
                    <div className="space-y-2">
                        <Label>{t("TaxGroupDialog.form.selectRules")}</Label>
                        <p className="text-xs text-gray-500 mb-2">
                            {t("TaxGroupDialog.form.selectRulesHint")}
                        </p>
                        
                        {availableTaxRules.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>{t("TaxGroupDialog.empty.noRules")}</p>
                                <p className="text-sm">{t("TaxGroupDialog.empty.createFirst")}</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-64 rounded-md border p-4">
                                <div className="space-y-3">
                                    {availableTaxRules.map((rule) => (
                                        <div
                                            key={rule.id}
                                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Checkbox
                                                id={`rule-${rule.id}`}
                                                checked={formData.taxRuleIds?.includes(rule.id)}
                                                onCheckedChange={() => handleRuleToggle(rule.id)}
                                            />
                                            <div className="flex-1 space-y-1">
                                                <Label
                                                    htmlFor={`rule-${rule.id}`}
                                                    className="text-sm font-medium cursor-pointer"
                                                >
                                                    {rule._translations?rule._translations.name:rule.name}
                                                </Label>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Badge variant="outline" className="text-xs">
                                                        {rule.type === "percentage"
                                                            ? `${rule.value}%`
                                                            : `$${rule.value}`}
                                                    </Badge>
                                                    <span>•</span>
                                                    <span>
                                                        {rule.applicableOn === "room_rate"
                                                            ? t("TaxGroupDialog.applicableOn.roomRate")
                                                            : t("TaxGroupDialog.applicableOn.totalAmount")}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{t("TaxGroupDialog.form.priority", { value: rule.priority })}</span>
                                                  
                                                </div>
                                                {rule.description && (
                                                    <p className="text-xs text-gray-400 line-clamp-1">
                                                        {rule.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        {t("TaxGroupDialog.form.cancel")}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSubmitting || !formData.name.trim()}
                    >
                        {isSubmitting ? t("TaxGroupDialog.form.saving") : mode === "create" ? t("TaxGroupDialog.form.create") : t("TaxGroupDialog.form.update")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
