import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, X, Loader2 } from "lucide-react";
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
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ICreateCharges, RatePlan, RoomTypes, IBaseGuestAmounts, IAdditionalGuestAmount, qualifyingAgeCode } from "../types";
import { currencies } from "@/components/currency-code/cuurency";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

interface CreateMappingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (mapping: ICreateCharges) => Promise<void>;
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
        const { t } = useTranslation();

    type LocalForm = {
        ratePlanCode: string;
        roomTypeCode: string;
        startDate: string;
        endDate: string;
        currencyCode: string;
        adultsBase: IBaseGuestAmounts[];
        childrenBase: IBaseGuestAmounts[];
        additionalGuestAmounts: IAdditionalGuestAmount[];
    };

    const [localForm, setLocalForm] = useState<LocalForm>({
        ratePlanCode: filters.ratePlanCode || "",
        roomTypeCode: filters.roomTypeCode || "",
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
        currencyCode: "USD",
        adultsBase: [{ numberOfGuests: 1, amountBeforeTax: "", ageQualifyingCode: "10" as qualifyingAgeCode }],
        childrenBase: [] as IBaseGuestAmounts[],
        additionalGuestAmounts: [] as IAdditionalGuestAmount[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);


    const handleAddChildBase = () => {
        const selectedRoom = roomTypes.find(room => room.id === localForm.roomTypeCode);
        const current = localForm.childrenBase.length;
        if (selectedRoom && selectedRoom.maxNumberOfChildren < current + 1) {
            toast.error(t("MapRatePlan.toast.maxChildRows"));
            return;
        }
        const nextGuestNumber = current + 1;
        setLocalForm({
            ...localForm,
            childrenBase: [
                ...localForm.childrenBase,
                { numberOfGuests: nextGuestNumber, amountBeforeTax: "", ageQualifyingCode: "8" as qualifyingAgeCode },
            ],
        });
    };


    const handleRemoveChildBase = (index: number) => {
        const updated = localForm.childrenBase
            .filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, numberOfGuests: i + 1 }));
        setLocalForm({ ...localForm, childrenBase: updated });
    };

    const handleAdultBaseChange = (index: number, field: keyof IBaseGuestAmounts, value: number | string) => {
        const selectedRoom = roomTypes.find(room => room.id === localForm.roomTypeCode);
        const updated = [...localForm.adultsBase];
        let newValue: any = value;
        if (field === 'numberOfGuests') {
            const n = Number(value) || 0;
            if (n < 1) {
                newValue = 1;
            } else if (selectedRoom && n > selectedRoom.maxNumberOfAdults) {
                newValue = selectedRoom.maxNumberOfAdults;
                toast.error(t("MapRatePlan.toast.adultsExceedMax", { max: selectedRoom.maxNumberOfAdults }));
            } else {
                newValue = n;
            }
        }
        updated[index] = { ...updated[index], [field]: newValue } as any;
        setLocalForm({ ...localForm, adultsBase: updated });
    };

    const handleChildBaseChange = (index: number, field: keyof IBaseGuestAmounts, value: number | string) => {
        const selectedRoom = roomTypes.find(room => room.id === localForm.roomTypeCode);
        const updated = [...localForm.childrenBase];
        let newValue: any = value;
        if (field === 'numberOfGuests') {
            const n = Number(value) || 0;
            if (n < 1) {
                newValue = 1;
            } else if (selectedRoom && n > selectedRoom.maxNumberOfChildren) {
                newValue = selectedRoom.maxNumberOfChildren;
                toast.error(t("MapRatePlan.toast.childrenExceedMax", { max: selectedRoom.maxNumberOfChildren }));
            } else {
                newValue = n;
            }
        }
        updated[index] = { ...updated[index], [field]: newValue } as any;
        setLocalForm({ ...localForm, childrenBase: updated });
    };

    useEffect(() => {
        const selectedRoom = roomTypes.find(room => room.id === localForm.roomTypeCode);
        if (!selectedRoom) return;

        // Pre-populate ALL adult rows from 1 to maxNumberOfAdults
        const adultsBase: IBaseGuestAmounts[] = Array.from(
            { length: selectedRoom.maxNumberOfAdults },
            (_, i) => ({
                numberOfGuests: i + 1,
                amountBeforeTax: "",
                ageQualifyingCode: "10" as qualifyingAgeCode,
            })
        );

        // Trim children if needed
        let children = localForm.childrenBase;
        if (children.length > selectedRoom.maxNumberOfChildren) {
            children = children
                .slice(0, selectedRoom.maxNumberOfChildren)
                .map((c, i) => ({ ...c, numberOfGuests: i + 1 }));
            toast(t("MapRatePlan.toast.trimmedAdults", { max: selectedRoom.maxNumberOfAdults }));
        }

        setLocalForm(prev => ({ ...prev, adultsBase, childrenBase: children }));
    }, [localForm.roomTypeCode]);
    const availableAgeCodes: qualifyingAgeCode[] = ["10", "8", "5"];

    const handleAddAdditionalGuestAmount = () => {
        const selectedAgeCodes = localForm.additionalGuestAmounts.map(item => item.ageQualifyingCode);

        const nextAgeCode = availableAgeCodes.find(code => !selectedAgeCodes.includes(code));

        if (!nextAgeCode) {
            toast.error(t("MapRatePlan.toast.allAgeCategoriesAdded"));
            return;
        }

        setLocalForm({
            ...localForm,
            additionalGuestAmounts: [
                ...localForm.additionalGuestAmounts,
                { ageQualifyingCode: nextAgeCode as qualifyingAgeCode, amount: 0 },
            ],
        });
    };

    // Your handleRemoveAdditionalGuestAmount stays the same
    const handleRemoveAdditionalGuestAmount = (index: number) => {
        const updated = localForm.additionalGuestAmounts.filter((_, i) => i !== index);
        setLocalForm({ ...localForm, additionalGuestAmounts: updated });
    };
    const selectedRoom = roomTypes.find(room => room.id === localForm.roomTypeCode);

    const isChildLimitReached = selectedRoom
        ? localForm.childrenBase.length >= selectedRoom.maxNumberOfChildren
        : false;
    const handleAdditionalGuestAmountChange = (
        index: number,
        field: keyof IAdditionalGuestAmount,
        value: string | number
    ) => {
        const updated = [...localForm.additionalGuestAmounts];
        updated[index] = { ...updated[index], [field]: value };
        setLocalForm({ ...localForm, additionalGuestAmounts: updated });
    };

    const handleSubmit = async () => {
        if (!localForm.ratePlanCode) {
            toast.error(t("MapRatePlan.toast.selectRatePlan"));
            return;
        }
        if (!localForm.roomTypeCode) {
            toast.error(t("MapRatePlan.toast.selectRoomType"));
            return;
        }
        if (!localForm.startDate || !localForm.endDate) {
            toast.error(t("MapRatePlan.toast.selectDates"));
            return;
        }
        if (localForm.adultsBase.length === 0) {
            toast.error(t("MapRatePlan.toast.adultBaseRequired"));
            return;
        }

        
        setIsSubmitting(true);
        try {
            const payload: ICreateCharges = {
                ratePlanCode: localForm.ratePlanCode,
                roomTypeCode: selectedRoom?.roomType || "",
                startDate: localForm.startDate,
                endDate: localForm.endDate,
                currencyCode: localForm.currencyCode as CurrencyCode,
                baseByGuestAmounts: [
                    ...localForm.adultsBase.map(a => ({ ...a, ageQualifyingCode: "10" as qualifyingAgeCode })),
                    ...localForm.childrenBase.map(c => ({ ...c, ageQualifyingCode: "8" as qualifyingAgeCode })),
                ],
                additionalGuestAmounts: localForm.additionalGuestAmounts,
            };

            await onSave(payload);

            // Reset local form on success
            setLocalForm({
                ratePlanCode: filters.ratePlanCode || "",
                roomTypeCode: filters.roomTypeCode || "",
                startDate: filters.startDate || "",
                endDate: filters.endDate || "",
                currencyCode: "USD",
                adultsBase: [{ numberOfGuests: 1, amountBeforeTax: "", ageQualifyingCode: "10" as qualifyingAgeCode }],
                childrenBase: [],
                additionalGuestAmounts: [],
            });
        } catch (error) {
            console.error("Failed to create mapping:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) {
            toast.error("Please wait while mapping is being created");
            return;
        }
        setLocalForm({
            ratePlanCode: filters.ratePlanCode || "",
            roomTypeCode: filters.roomTypeCode || "",
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            currencyCode: "USD",
            adultsBase: [{ numberOfGuests: 1, amountBeforeTax: "", ageQualifyingCode: "10" as qualifyingAgeCode }],
            childrenBase: [],
            additionalGuestAmounts: [],
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            if (!open && isSubmitting) {
                toast.error(t("MapRatePlan.toast.waitWhileCreating"));
                return;
            }
            if (!open) handleClose();
        }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{t("MapRatePlan.createMapping.title")}</DialogTitle>
                    <DialogDescription>
                        {t("MapRatePlan.createMapping.titleDesc")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t("MapRatePlan.roomTypeLabel")} *</Label>
                            <Select
                                value={localForm.roomTypeCode}
                                onValueChange={(value) =>
                                    setLocalForm({ ...localForm, roomTypeCode: value })
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("MapRatePlan.selectRoomType")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {roomTypes.map((room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room._translations?room._translations.roomName:room.roomName} ({room.roomType})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("MapRatePlan.ratePlanLabel")} *</Label>
                            <Select
                                value={localForm.ratePlanCode}
                                onValueChange={(value) =>
                                    setLocalForm({ ...localForm, ratePlanCode: value })
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("MapRatePlan.selectRatePlan")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ratePlans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.ratePlanCode}>
                                            {plan._translations?plan._translations.ratePlanName:plan.ratePlanName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t("MapRatePlan.startDate")} *</Label>
                            <Input
                                type="date"
                                value={localForm.startDate}
                                onChange={(e) =>
                                    setLocalForm({ ...localForm, startDate: e.target.value })
                                }
                                min={new Date().toISOString().split("T")[0]}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t("MapRatePlan.endDate")} *</Label>
                            <Input
                                type="date"
                                value={localForm.endDate}
                                onChange={(e) => setLocalForm({ ...localForm, endDate: e.target.value })}
                                min={localForm.startDate || new Date().toISOString().split("T")[0]}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currencyCode">{t("MapRatePlan.currencyCode")}</Label>
                            <Select
                                value={localForm.currencyCode}
                                onValueChange={(value) => setLocalForm({ ...localForm, currencyCode: value as CurrencyCode })}
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

                    </div>

                    {/* Base Guest Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("MapRatePlan.createMapping.baseGuestAmountsAdults")}</CardTitle>
                            <CardDescription>
                                {t("MapRatePlan.createMapping.baseGuestAmountsAdultsDesc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {localForm.adultsBase.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Select a room type to populate adult guest rows
                                </p>
                            ) : (
                                localForm.adultsBase.map((item, index) => (
                                    <div key={index} className="flex items-end gap-3">
                                        <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.createMapping.numberOfAdults")}</Label>
                                            <Input
                                                type="number"
                                                value={item.numberOfGuests}
                                                disabled  // 🔒 always locked
                                                className="bg-muted cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.createMapping.amount")} </Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.1"
                                                value={item.amountBeforeTax}
                                                onChange={(e) =>
                                                    handleAdultBaseChange(index, "amountBeforeTax", e.target.value)
                                                }
                                                disabled={isSubmitting}
                                                placeholder="Enter amount"
                                            />
                                        </div>
                                        {/* No remove button — rows are fixed */}
                                    </div>
                                ))
                            )}
                            {/* No "Add" button — rows are auto-generated */}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("MapRatePlan.createMapping.baseGuestAmountsChildren")}</CardTitle>
                            <CardDescription>
                                {t("MapRatePlan.createMapping.baseGuestAmountsChildrenDesc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {localForm.childrenBase.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.createMapping.numberOfChildren")}</Label>
                                        <Input
                                            type="number"
                                            value={item.numberOfGuests}
                                            disabled  // 🔒 locked, auto-assigned
                                            className="bg-muted cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.createMapping.amount")} </Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={item.amountBeforeTax}
                                            onChange={(e) =>
                                                handleChildBaseChange(index, "amountBeforeTax", e.target.value)
                                            }
                                            disabled={isSubmitting}
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveChildBase(index)}
                                        disabled={isSubmitting}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddChildBase}
                                className="w-full"
                                disabled={isSubmitting || isChildLimitReached}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Children Guest Amount
                            </Button>
                        </CardContent>
                    </Card>
                    {/* Additional Guest Amounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t("MapRatePlan.createMapping.additionalGuestAmounts")}</CardTitle>
                            <CardDescription>
                                {t("MapRatePlan.createMapping.additionalGuestAmountsDesc")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {localForm.additionalGuestAmounts.map((item, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.createMapping.ageCode")}</Label>
                                        <Select
                                            value={item.ageQualifyingCode}
                                            onValueChange={(value) =>
                                                handleAdditionalGuestAmountChange(index, "ageQualifyingCode", value)
                                            }
                                            disabled={isSubmitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["10", "8", "5"]
                                                    .filter(code => {
                                                        // Show current selection and only available codes that aren't used elsewhere
                                                        return item.ageQualifyingCode === code ||
                                                            !localForm.additionalGuestAmounts.some((guest, i) =>
                                                                i !== index && guest.ageQualifyingCode === code
                                                            );
                                                    })
                                                    .map((code) => (
                                                        <SelectItem key={code} value={code}>
                                                            {code === "10" ? t("MapRatePlan.createMapping.adult") : code === "8" ? t("MapRatePlan.createMapping.child") : t("MapRatePlan.createMapping.infant")}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label>{t("MapRatePlan.createMapping.amount")} </Label>
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
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleRemoveAdditionalGuestAmount(index)}
                                        disabled={isSubmitting}
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
                                disabled={isSubmitting}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t("MapRatePlan.createMapping.addAdditionalGuestAmount")}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        {t("RatePlanManagement.cancel")}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            localForm.adultsBase.length === 0 ||
                            localForm.adultsBase.some(
                                (a) => !a.amountBeforeTax || parseFloat(String(a.amountBeforeTax)) <= 0
                            )
                        }
                    >
                          {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t("MapRatePlan.createMapping.creatingMapping")}
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                {t("MapRatePlan.createMapping.createMappingBtn")}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}