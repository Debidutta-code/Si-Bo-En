import { useState, useEffect } from "react";
import { Edit, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import type {
    Charges, IBaseGuestAmounts, IAdditionalGuestAmount,
    IUpdatedCharges, RoomTypes, qualifyingAgeCode
} from "../types";

interface UpdatePriceDialogProps {
    mapping: Charges | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (updatedMapping: IUpdatedCharges) => void;
    roomTypes: RoomTypes[];
}

const availableAgeCodes: qualifyingAgeCode[] = ["10", "8", "5"];

export default function UpdatePriceDialog({
    mapping,
    open,
    onOpenChange,
    onSave,
    roomTypes,
}: UpdatePriceDialogProps) {
    const { t } = useTranslation();
    const [adultsBase, setAdultsBase] = useState<IBaseGuestAmounts[]>([]);
    const [childrenBase, setChildrenBase] = useState<IBaseGuestAmounts[]>([]);
    const [additionalGuestAmounts, setAdditionalGuestAmounts] = useState<IAdditionalGuestAmount[]>([]);

    // Derive the room for this mapping so we can enforce limits
    const selectedRoom = roomTypes.find(r => r.roomType === mapping?.roomTypeCode);

    const isAdultLimitReached = selectedRoom
        ? adultsBase.length >= selectedRoom.maxNumberOfAdults
        : false;

    const isChildLimitReached = selectedRoom
        ? childrenBase.length >= selectedRoom.maxNumberOfChildren
        : false;

    useEffect(() => {
        if (mapping) {
            const adults = (mapping.baseGuestAmounts || [])
                .filter(g => g.ageQualifyingCode === "10")
                .map((g, i) => ({
                    numberOfGuests: g.numberOfGuests ?? i + 1,
                    amountBeforeTax: g.amountBeforeTax,
                    ageQualifyingCode: g.ageQualifyingCode,
                }));

            const children = (mapping.baseGuestAmounts || [])
                .filter(g => g.ageQualifyingCode === "8")
                .map((g, i) => ({
                    numberOfGuests: g.numberOfGuests ?? i + 1,
                    amountBeforeTax: g.amountBeforeTax,
                    ageQualifyingCode: g.ageQualifyingCode,
                }));

            setAdultsBase(adults.length > 0
                ? adults
                : [{ numberOfGuests: 1, amountBeforeTax: "0", ageQualifyingCode: "10" }]
            );
            setChildrenBase(children);
            setAdditionalGuestAmounts(
                (mapping.additionalGuestAmounts || []).map(g => ({
                    ageQualifyingCode: g.ageQualifyingCode,
                    amount: g.amount,
                }))
            );
        }
    }, [mapping]);

    // ── Adults ──────────────────────────────────────────────
    const handleAddAdult = () => {
        if (isAdultLimitReached) {
            toast.error(t("MapRatePlan.toast.maxAdultsForRoom", { max: selectedRoom?.maxNumberOfAdults }));
            return;
        }
        setAdultsBase(prev => [
            ...prev,
            { numberOfGuests: prev.length + 1, amountBeforeTax: "", ageQualifyingCode: "10" },
        ]);
    };

    const handleRemoveAdult = (index: number) => {
        if (adultsBase.length <= 1) {
            toast.error(t("MapRatePlan.toast.minOneAdultRequiredError"));
            return;
        }
        setAdultsBase(prev =>
            prev.filter((_, i) => i !== index).map((a, i) => ({ ...a, numberOfGuests: i + 1 }))
        );
    };

    const handleAdultChange = (index: number, field: keyof IBaseGuestAmounts, value: string | number) => {
        setAdultsBase(prev => {
            const updated = [...prev];
            if (field === "numberOfGuests") {
                const n = Number(value) || 1;
                if (selectedRoom && n > selectedRoom.maxNumberOfAdults) {
                    toast.error(t("MapRatePlan.toast.maxAdultsError", { max: selectedRoom.maxNumberOfAdults }));
                    updated[index] = { ...updated[index], numberOfGuests: selectedRoom.maxNumberOfAdults };
                    return updated;
                }
                updated[index] = { ...updated[index], numberOfGuests: Math.max(1, n) };
            } else {
                updated[index] = { ...updated[index], [field]: value } as any;
            }
            return updated;
        });
    };

    // ── Children ────────────────────────────────────────────
    const handleAddChild = () => {
        if (isChildLimitReached) {
            toast.error(t("MapRatePlan.toast.maxChildrenForRoom", { max: selectedRoom?.maxNumberOfChildren }));
            return;
        }
        setChildrenBase(prev => [
            ...prev,
            { numberOfGuests: prev.length + 1, amountBeforeTax: "", ageQualifyingCode: "8" },
        ]);
    };

    const handleRemoveChild = (index: number) => {
        setChildrenBase(prev =>
            prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, numberOfGuests: i + 1 }))
        );
    };

    const handleChildChange = (index: number, field: keyof IBaseGuestAmounts, value: string | number) => {
        setChildrenBase(prev => {
            const updated = [...prev];
            if (field === "numberOfGuests") {
                const n = Number(value) || 1;
                if (selectedRoom && n > selectedRoom.maxNumberOfChildren) {
                    toast.error(t("MapRatePlan.toast.maxChildrenError", { max: selectedRoom.maxNumberOfChildren }));
                    updated[index] = { ...updated[index], numberOfGuests: selectedRoom.maxNumberOfChildren };
                    return updated;
                }
                updated[index] = { ...updated[index], numberOfGuests: Math.max(1, n) };
            } else {
                updated[index] = { ...updated[index], [field]: value } as any;
            }
            return updated;
        });
    };

    // ── Additional guests ───────────────────────────────────
    const handleAddAdditional = () => {
        const usedCodes = additionalGuestAmounts.map(a => a.ageQualifyingCode);
        const nextCode = availableAgeCodes.find(c => !usedCodes.includes(c));
        if (!nextCode) {
            toast.error(t("MapRatePlan.toast.allAgeCategoriesError"));
            return;
        }
        setAdditionalGuestAmounts(prev => [
            ...prev,
            { ageQualifyingCode: nextCode as qualifyingAgeCode, amount: 0 },
        ]);
    };

    const handleRemoveAdditional = (index: number) => {
        setAdditionalGuestAmounts(prev => prev.filter((_, i) => i !== index));
    };

    const handleAdditionalChange = (index: number, field: keyof IAdditionalGuestAmount, value: string | number) => {
        setAdditionalGuestAmounts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // ── Submit ──────────────────────────────────────────────
    const handleSave = () => {
        if (!mapping) return;

        const combined = [...adultsBase, ...childrenBase];
        const hasInvalid = combined.some(g => parseFloat(String(g.amountBeforeTax)) <= 0);
        if (hasInvalid) {
            toast.error(t("MapRatePlan.toast.baseAmountsPositive"));
            return;
        }

        const updated: IUpdatedCharges = {
            id: mapping.id,
            baseGuestAmounts: [
                ...adultsBase.map(a => ({ ...a, ageQualifyingCode: "10" as qualifyingAgeCode })),
                ...childrenBase.map(c => ({ ...c, ageQualifyingCode: "8" as qualifyingAgeCode })),
            ],
            additionalGuestAmounts,
        };

        onSave(updated);
        onOpenChange(false);
    };

    if (!mapping) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <Edit className="w-6 h-6" />
                        {t("MapRatePlan.updatePrice.title")}
                    </DialogTitle>
                    <DialogDescription>
                        {t("MapRatePlan.updatePrice.titleDesc", { ratePlan: mapping.ratePlanName, roomType: mapping.roomTypeName })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">

                    {/* Adults */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("MapRatePlan.updatePrice.baseGuestAmountsAdults")}</CardTitle>
                            <CardDescription>{t("MapRatePlan.updatePrice.baseGuestAmountsAdultsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {adultsBase.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.updatePrice.numberOfAdults")}</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.numberOfGuests}
                                            onChange={e => handleAdultChange(index, "numberOfGuests", parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.updatePrice.amount")}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={item.amountBeforeTax}
                                            onChange={e => handleAdultChange(index, "amountBeforeTax", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveAdult(index)}
                                        disabled={adultsBase.length <= 1}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddAdult}
                                className="w-full"
                                disabled={isAdultLimitReached}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {isAdultLimitReached
                                    ? t("MapRatePlan.updatePrice.maxAdultsReached", { max: selectedRoom?.maxNumberOfAdults })
                                    : t("MapRatePlan.updatePrice.addAdultGuestAmount")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Children */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("MapRatePlan.updatePrice.baseGuestAmountsChildren")}</CardTitle>
                            <CardDescription>{t("MapRatePlan.updatePrice.baseGuestAmountsChildrenDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {childrenBase.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.updatePrice.numberOfChildren")}</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.numberOfGuests}
                                            onChange={e => handleChildChange(index, "numberOfGuests", parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.updatePrice.amount")}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={item.amountBeforeTax}
                                            onChange={e => handleChildChange(index, "amountBeforeTax", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveChild(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddChild}
                                className="w-full"
                                disabled={isChildLimitReached}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {isChildLimitReached
                                    ? t("MapRatePlan.updatePrice.maxChildrenReached", { max: selectedRoom?.maxNumberOfChildren })
                                    : t("MapRatePlan.updatePrice.addChildGuestAmount")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Additional */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("MapRatePlan.updatePrice.additionalGuestAmounts")}</CardTitle>
                            <CardDescription>{t("MapRatePlan.updatePrice.additionalGuestAmountsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {additionalGuestAmounts.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.updatePrice.ageCode")}</Label>
                                        <Select
                                            value={item.ageQualifyingCode}
                                            onValueChange={value => handleAdditionalChange(index, "ageQualifyingCode", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableAgeCodes
                                                    .filter(code =>
                                                        item.ageQualifyingCode === code ||
                                                        !additionalGuestAmounts.some((g, i) => i !== index && g.ageQualifyingCode === code)
                                                    )
                                                    .map(code => (
                                                        <SelectItem key={code} value={code}>
                                                            {code === "10" ? t("MapRatePlan.updatePrice.adult") : code === "8" ? t("MapRatePlan.updatePrice.child") : t("MapRatePlan.updatePrice.infant")}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.updatePrice.amount")}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.amount}
                                            onChange={e => handleAdditionalChange(index, "amount", parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveAdditional(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddAdditional}
                                className="w-full"
                                disabled={additionalGuestAmounts.length >= availableAgeCodes.length}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t("MapRatePlan.updatePrice.addAdditionalGuestAmount")}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t("MapRatePlan.updatePrice.cancel")}
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        {t("MapRatePlan.updatePrice.saveChanges")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}