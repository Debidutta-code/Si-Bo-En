import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Smartphone, Monitor, Tablet, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { usePropertyContext } from "@/contexts/PropertyContext";
import { createPromoCodeService, deletePromoCodeService, fetchPromoCodesService, updatePromoCodeService, fetchRatePlansService, fetchRoomTypesService } from "./services";
import type { DiscountType, ICreatePromoCode, IRPromoCode, RatePlan, RoomTypes } from "./interfaces";
import { currencies } from "@/components/currency-code/cuurency";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "../management/components/multilang/ManagementTranslationDialogs";
import {
    upsertPromoCodeTranslationService,
    getAllPromoCodeTranslationsService,
    deletePromoCodeTranslationLocaleService,
} from "./services/promo-code-multilang.service";
import { languages } from "@/components/language/language";

export default function PromoCodePage() {
    const { t } = useTranslation();
    const { propertyId } = useParams<{ propertyId: string }>();
    const { languages: propertyLanguages } = usePropertyContext();
    const availableLanguages = propertyLanguages && propertyLanguages.length > 0
        ? languages.filter((l) => propertyLanguages.some((pl) => pl.language === l.code))
        : languages;

    const [loading, setLoading] = useState<{
        isLoading: boolean;
        text: string;
    }>({
        isLoading: false,
        text: "",
    });

    const [promoCodes, setPromoCodes] = useState<IRPromoCode[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomTypes[]>([]);
    const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromoCode, setEditingPromoCode] = useState<IRPromoCode | null>(null);
    const [isSpecificRoomTypes, setIsSpecificRoomTypes] = useState(false);
    const [isSpecificRatePlans, setIsSpecificRatePlans] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [promoCodeToDelete, setPromoCodeToDelete] = useState<string | null>(null);

    const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
    const [addTranslationOpen, setAddTranslationOpen] = useState(false);
    const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
    const [editTranslationOpen, setEditTranslationOpen] = useState(false);
    const [editingLocale, setEditingLocale] = useState<string>("");
    const [editingData, setEditingData] = useState<Record<string, any>>({});

    const [formData, setFormData] = useState<ICreatePromoCode>({
        name: "",
        code: "",
        description: "",
        propertyId: propertyId || "",
        discountType: "percentage",
        discountValue: 0,
        validFrom: new Date(),
        validTo: new Date(),
        minBookingAmount: null,
        maxDiscountAmount: null,
        isApplicableForMobileApp: true,
        isApplicableForDesktop: true,
        isApplicableForTablet: true,
        // isApplicableForWalkIn: true,
        // isApplicableForOTA: true,
        // isApplicableForCorporate: true,
        currencyCode: "USD",
        usageLimit: null,
        // usageLimitPerUser: null,
        applicableRoomTypes: [],
        applicableRatePlans: [],
    });

    useEffect(() => {
        if (propertyId) {
            fetchPromoCodes();
            fetchRoomTypes();
            fetchRatePlans();
        }
    }, [propertyId]);

    const fetchPromoCodes = async () => {
        if (!propertyId) return;
        setLoading({ isLoading: true, text: t("PromoCode.loadingPromoCodes") });
        try {
            const response = await fetchPromoCodesService(propertyId);
            if (response.success) {
                setPromoCodes(response.data || []);
            } else {
                toast.error(response.message || t("PromoCode.failedToFetchPromoCodes"));
            }
        } catch (error) {
            toast.error(t("PromoCode.errorFetchingPromoCodes"));
        } finally {
            setLoading({ isLoading: false, text: "" });
        }
    };

    const fetchRoomTypes = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchRoomTypesService(propertyId);
            if (response.success) {
                setRoomTypes(response.data || []);
            }
        } catch (error) {
            console.error(t("PromoCode.failedToFetchRoomTypes"), error);
        }
    };

    const fetchRatePlans = async () => {
        if (!propertyId) return;
        try {
            const response = await fetchRatePlansService(propertyId);
            if (response.success) {
                setRatePlans(response.data || []);
            }
        } catch (error) {
            console.error(t("PromoCode.failedToFetchRatePlans"), error);
        }
    };

    const handleCreateOrUpdate = async () => {
        setLoading({ isLoading: true, text: editingPromoCode ? t("PromoCode.updatingPromoCode") : t("PromoCode.creatingPromoCode") });
        try {
            let response;
            if (editingPromoCode) {
                response = await updatePromoCodeService(editingPromoCode.id, { ...formData, id: editingPromoCode.id } as any);
            } else {
                response = await createPromoCodeService(formData);
            }

            if (response.success) {
                toast.success(editingPromoCode ? t("PromoCode.promoCodeUpdated") : t("PromoCode.promoCodeCreated"));
                setIsDialogOpen(false);
                resetForm();
                fetchPromoCodes();
            } else {
                toast.error(response.message || t("PromoCode.failedToSavePromoCode"));
            }
        } catch (error) {
            toast.error(t("PromoCode.errorSavingPromoCode"));
        } finally {
            setLoading({ isLoading: false, text: "" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!propertyId) return;

        setLoading({ isLoading: true, text: t("PromoCode.deletingPromoCode") });
        try {
            const response = await deletePromoCodeService(propertyId, id);
            if (response.success) {
                toast.success(t("PromoCode.promoCodeDeleted"));
                fetchPromoCodes();
            } else {
                toast.error(response.message || t("PromoCode.failedToDeletePromoCode"));
            }
        } catch (error) {
            toast.error(t("PromoCode.errorDeletingPromoCode"));
        } finally {
            setLoading({ isLoading: false, text: "" });
            setDeleteDialogOpen(false);
            setPromoCodeToDelete(null);
        }
    };

    const openDeleteDialog = (id: string) => {
        setPromoCodeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (promoCodeToDelete) {
            handleDelete(promoCodeToDelete);
        }
    };

    const handleEdit = (promoCode: IRPromoCode) => {
        setEditingPromoCode(promoCode);
        setFormData({
            name: promoCode.name,
            code: promoCode.code,
            description: promoCode.description || "",
            propertyId: promoCode.propertyId,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
            validFrom: new Date(promoCode.validFrom),
            validTo: new Date(promoCode.validTo),
            minBookingAmount: promoCode.minBookingAmount,
            maxDiscountAmount: promoCode.maxDiscountAmount,
            isApplicableForMobileApp: promoCode.isApplicableForMobileApp,
            isApplicableForDesktop: promoCode.isApplicableForDesktop,
            isApplicableForTablet: promoCode.isApplicableForTablet,
            usageLimit: promoCode.usageLimit,
            currencyCode: promoCode.currencyCode,
            // usageLimitPerUser: promoCode.usageLimitPerUser,
            applicableRoomTypes: promoCode.applicableRoomTypes,
            applicableRatePlans: promoCode.applicableRatePlans,
        });
        const hasSpecificRoomTypes = promoCode.applicableRoomTypes && promoCode.applicableRoomTypes.length > 0 && !promoCode.applicableRoomTypes.includes("all");
        const hasSpecificRatePlans = promoCode.applicableRatePlans && promoCode.applicableRatePlans.length > 0 && !promoCode.applicableRatePlans.includes("all");
        setIsSpecificRoomTypes(hasSpecificRoomTypes);
        setIsSpecificRatePlans(hasSpecificRatePlans);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingPromoCode(null);
        setIsSpecificRoomTypes(false);
        setIsSpecificRatePlans(false);
        setFormData({
            name: "",
            code: "",
            description: "",
            propertyId: propertyId || "",
            discountType: "percentage",
            discountValue: 0,
            validFrom: new Date(),
            validTo: new Date(),
            minBookingAmount: null,
            maxDiscountAmount: null,
            isApplicableForMobileApp: true,
            isApplicableForDesktop: true,
            isApplicableForTablet: true,
            currencyCode: "USD",
            usageLimit: null,
            // usageLimitPerUser: null,
            applicableRoomTypes: [],
            applicableRatePlans: [],
        });
    };

    const formatDate = (date: Date | string) => {
        const dateStr = typeof date === 'string' ? date : date.toISOString();
        const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
        const monthKeys = ['january','february','march','april','may','june','july','august','september','october','november','december'];
        return `${t(`Months.${monthKeys[m - 1]}`)} ${d}, ${y}`;
    };

    if (loading.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader text={t("PromoCode.loadingPromoCodes")} />
            </div>
        );
    }
    return (
        <div className="container mx-auto p-6 space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <BackButton />
                    <h1 className="text-3xl font-bold mt-2">{t("PromoCode.title")}</h1>
                    <p className="text-muted-foreground">{t("PromoCode.managePromoCodes")}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t("PromoCode.createPromoCode")}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPromoCode ? t("PromoCode.editPromoCode") : t("PromoCode.createNewPromoCode")}</DialogTitle>
                            <DialogDescription>
                                {editingPromoCode ? t("PromoCode.updatePromoCodeDetails") : t("PromoCode.fillDetailsToCreate")}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t("PromoCode.basicInformation")}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t("PromoCode.promoName")} *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Summer Sale 2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">{t("PromoCode.promoCodeChars")}</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g., SUMMER2024"
                                            maxLength={12}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">{t("PromoCode.description")}</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={t("PromoCode.describePromoCode")}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* Translations section removed in favor of independent translation dialogs */}

                            {/* Discount Configuration */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t("PromoCode.discountConfiguration")}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discountType">{t("PromoCode.discountType")}</Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(value: DiscountType) => setFormData({ ...formData, discountType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">{t("PromoCode.percentage")}</SelectItem>
                                                <SelectItem value="flat">{t("PromoCode.flatAmount")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discountValue">
                                            {t("PromoCode.discountValue")} {formData.discountType === "percentage" ? "(%)" : "($)"}
                                        </Label>
                                        <Input
                                            id="discountValue"
                                            type="number"
                                            min={0}
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                            placeholder={formData.discountType === "percentage" ? "e.g., 20" : "e.g., 500"}
                                        />
                                    </div>
                                </div>
                                {
                                    formData.discountType === "flat" && (

                                        <div className="space-y-2">
                                            <Label htmlFor="currencyCode">{t("PromoCode.currencyCode")}</Label>
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
                                    )

                                }
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="minBookingAmount">{t("PromoCode.minBookingAmount")} </Label>
                                        <Input
                                            id="minBookingAmount"
                                            type="number"
                                            min={0}

                                            value={formData.minBookingAmount || ""}
                                            onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value ? parseFloat(e.target.value) : null })}
                                            placeholder={t("PromoCode.optional")}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxDiscountAmount">{t("PromoCode.maxDiscountAmount")}</Label>
                                        <Input
                                            id="maxDiscountAmount"
                                            type="number"
                                            min={0}

                                            value={formData.maxDiscountAmount || ""}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null })}
                                            placeholder={t("PromoCode.optional")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Validity Period */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t("PromoCode.validityPeriod")}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="validFrom">{t("PromoCode.validFrom")}</Label>
                                        <Input
                                            id="validFrom"
                                            type="datetime-local"
                                            value={formData.validFrom instanceof Date ? formData.validFrom.toISOString().slice(0, 16) : ""}
                                            onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="validTo">{t("PromoCode.validTo")}</Label>
                                        <Input
                                            id="validTo"
                                            type="datetime-local"
                                            value={formData.validTo instanceof Date ? formData.validTo.toISOString().slice(0, 16) : ""}
                                            onChange={(e) => setFormData({ ...formData, validTo: new Date(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Usage Limits */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t("PromoCode.usageLimits")}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="usageLimit">{t("PromoCode.totalUsageLimit")}</Label>
                                        <Input
                                            id="usageLimit"
                                            type="number"
                                            min={1}
                                            value={formData.usageLimit || ""}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                                            placeholder={t("PromoCode.unlimited")}
                                        />
                                    </div>
                                    {/* <div className="space-y-2">
                                        <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
                                        <Input
                                            id="usageLimitPerUser"
                                            type="number"
                                            min={1}
                                            value={formData.usageLimitPerUser || ""}
                                            onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value ? parseInt(e.target.value) : null })}
                                            placeholder="Unlimited"
                                        />
                                    </div> */}
                                </div>
                            </div>

                            <Separator />

                            {/* Platform Applicability */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">{t("PromoCode.platformApplicability")}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Smartphone className="h-4 w-4" />
                                            <Label htmlFor="mobileApp">{t("PromoCode.mobileApp")}</Label>
                                        </div>
                                        <Switch
                                            id="mobileApp"
                                            checked={formData.isApplicableForMobileApp}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isApplicableForMobileApp: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Monitor className="h-4 w-4" />
                                            <Label htmlFor="desktop">{t("PromoCode.desktop")}</Label>
                                        </div>
                                        <Switch
                                            id="desktop"
                                            checked={formData.isApplicableForDesktop}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isApplicableForDesktop: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Tablet className="h-4 w-4" />
                                            <Label htmlFor="tablet">{t("PromoCode.tablet")}</Label>
                                        </div>
                                        <Switch
                                            id="tablet"
                                            checked={formData.isApplicableForTablet}
                                            onCheckedChange={(checked) => setFormData({ ...formData, isApplicableForTablet: checked })}
                                        />
                                    </div>
                                </div>
                            </div>


                            <Separator />

                            {/* Room Type Applicability */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{t("PromoCode.applicableRoomTypes")}</h3>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="specificRoomTypes"
                                            checked={isSpecificRoomTypes}
                                            onCheckedChange={(checked) => {
                                                setIsSpecificRoomTypes(checked);
                                                if (!checked) {
                                                    setFormData({ ...formData, applicableRoomTypes: [] });
                                                }
                                            }}
                                        />
                                        <Label htmlFor="specificRoomTypes">{t("PromoCode.selectSpecificRoomTypes")}</Label>
                                    </div>
                                </div>

                                {isSpecificRoomTypes && (
                                    <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                                        {roomTypes.map((roomType) => (
                                            <div key={roomType.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`rt-${roomType.id}`}
                                                    checked={(formData.applicableRoomTypes || []).includes(roomType.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentTypes = formData.applicableRoomTypes || [];
                                                        if (checked) {
                                                            setFormData({
                                                                ...formData,
                                                                applicableRoomTypes: [...currentTypes, roomType.id]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                applicableRoomTypes: currentTypes.filter(id => id !== roomType.id)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`rt-${roomType.id}`}>{roomType._translations ? roomType._translations.roomName : roomType.roomName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSpecificRoomTypes && roomTypes.length === 0 && <p className="text-sm text-muted-foreground">{t("PromoCode.noRoomTypesAvailable")}</p>}
                                {!isSpecificRoomTypes && <p className="text-sm text-muted-foreground">{t("PromoCode.applicableToAllRoomTypes")}</p>}
                            </div>

                            <Separator />

                            {/* Rate Plan Applicability */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">{t("PromoCode.applicableRatePlans")}</h3>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="specificRatePlans"
                                            checked={isSpecificRatePlans}
                                            onCheckedChange={(checked) => {
                                                setIsSpecificRatePlans(checked);
                                                if (!checked) {
                                                    setFormData({ ...formData, applicableRatePlans: [] });
                                                }
                                            }}
                                        />
                                        <Label htmlFor="specificRatePlans">{t("PromoCode.selectSpecificRatePlans")}</Label>
                                    </div>
                                </div>

                                {isSpecificRatePlans && (
                                    <div className="grid grid-cols-2 gap-4 border p-4 rounded-md">
                                        {ratePlans.map((ratePlan) => (
                                            <div key={ratePlan.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`rp-${ratePlan.id}`}
                                                    checked={(formData.applicableRatePlans || []).includes(ratePlan.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentPlans = formData.applicableRatePlans || [];
                                                        if (checked) {
                                                            setFormData({
                                                                ...formData,
                                                                applicableRatePlans: [...currentPlans, ratePlan.id]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                applicableRatePlans: currentPlans.filter(id => id !== ratePlan.id)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`rp-${ratePlan.id}`}>{ratePlan._translations ? ratePlan._translations.ratePlanName : ratePlan.ratePlanName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSpecificRatePlans && ratePlans.length === 0 && <p className="text-sm text-muted-foreground">{t("PromoCode.noRatePlansAvailable")}</p>}
                                {!isSpecificRatePlans && <p className="text-sm text-muted-foreground">{t("PromoCode.applicableToAllRatePlans")}</p>}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setIsDialogOpen(false);
                                resetForm();
                            }}>
                                {t("PromoCode.cancel")}
                            </Button>
                            <Button onClick={handleCreateOrUpdate}>
                                {editingPromoCode ? t("PromoCode.update") : t("PromoCode.create")}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Promo Codes List */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("PromoCode.activePromoCodes")}</CardTitle>
                    <CardDescription>{t("PromoCode.managePromotionalCodes")}</CardDescription>
                </CardHeader>
                <CardContent>
                    {promoCodes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t("PromoCode.noPromoCodesFound")}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("PromoCode.code")}</TableHead>
                                    <TableHead>{t("PromoCode.name")}</TableHead>
                                    <TableHead>{t("PromoCode.discount")}</TableHead>
                                    <TableHead>{t("PromoCode.validity")}</TableHead>
                                    <TableHead>{t("PromoCode.usage")}</TableHead>
                                    <TableHead>{t("PromoCode.status")}</TableHead>
                                    <TableHead className="text-right">{t("PromoCode.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promoCodes.map((promoCode) => (
                                    <TableRow key={promoCode.id}>
                                        <TableCell className="font-mono font-bold">{promoCode.code}</TableCell>
                                        <TableCell>{promoCode._translations ? promoCode._translations.name : promoCode.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                {promoCode.discountType === "percentage" ? (
                                                    <>
                                                        {promoCode.discountValue}%
                                                    </>
                                                ) : (
                                                    <>
                                                        {promoCode.discountValue} {promoCode.currencyCode}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div>{formatDate(promoCode.validFrom)}</div>
                                                <div className="text-muted-foreground">{t("PromoCode.to")} {formatDate(promoCode.validTo)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {promoCode.usageLimit ? (
                                                <Badge variant="secondary">{promoCode.usageLimit} {t("PromoCode.uses")}</Badge>
                                            ) : (
                                                <Badge variant="secondary">{t("PromoCode.unlimited")}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {promoCode.isActive ? (
                                                <Badge className="bg-green-500">{t("PromoCode.active")}</Badge>
                                            ) : (
                                                <Badge variant="destructive">{t("PromoCode.inactive")}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={t("Common.addTranslation")}
                                                    onClick={() => { setTranslationEntityId(promoCode.id); setAddTranslationOpen(true); }}
                                                >
                                                    <Plus className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={t("Common.checkTranslation")}
                                                    onClick={() => { setTranslationEntityId(promoCode.id); setCheckTranslationsOpen(true); }}
                                                >
                                                    <Languages className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(promoCode)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(promoCode.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("PromoCode.areYouSure")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("PromoCode.deletePromoCodeDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setDeleteDialogOpen(false);
                            setPromoCodeToDelete(null);
                        }}>
                            {t("PromoCode.cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("PromoCode.delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {translationEntityId && (
                <>
                    <AddTranslationDialog
                        open={addTranslationOpen}
                        onOpenChange={setAddTranslationOpen}
                        entityId={translationEntityId}
                        title={t('PromoCode.addTranslation')}
                        fields={[
                            { key: "name", label: t('PromoCode.transName'), placeholder: t('PromoCode.placeholder.name') },
                            { key: "description", label: t('PromoCode.transDecs'), placeholder: t('PromoCode.placeholder.description') }
                        ]}
                        onSave={async (id, locale, data) => {
                            return await upsertPromoCodeTranslationService(id, { [locale]: data });
                        }}
                        allowedLanguageCodes={availableLanguages.map((l) => l.code)}
                    />
                    <CheckTranslationsDialog
                        open={checkTranslationsOpen}
                        onOpenChange={setCheckTranslationsOpen}
                        entityId={translationEntityId}
                        title={t('PromoCode.translations')}
                        displayFields={[
                            { key: "name", label: t('PromoCode.transName') },
                            { key: "description", label: t('PromoCode.transDecs') }
                        ]}
                        onFetch={getAllPromoCodeTranslationsService}
                        onDelete={deletePromoCodeTranslationLocaleService}
                        onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
                    />
                    <EditTranslationDialog
                        open={editTranslationOpen}
                        onOpenChange={setEditTranslationOpen}
                        entityId={translationEntityId!}
                        locale={editingLocale}
                        initialData={editingData}
                        title={t('PromoCode.editTranslation')}
                        fields={[
                            { key: "name", label: t('PromoCode.transName'), placeholder: t('PromoCode.placeholder.name') },
                            { key: "description", label: t('PromoCode.transDecs'), placeholder: t('PromoCode.placeholder.description') }
                        ]}
                        onSave={async (id, locale, data) => upsertPromoCodeTranslationService(id, { [locale]: data })}
                    />
                </>
            )}
        </div>
    );
}