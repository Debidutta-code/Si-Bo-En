import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Pencil, Trash2, Smartphone, Monitor, Tablet } from "lucide-react";
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
import { createPromoCodeService, deletePromoCodeService, fetchPromoCodesService, updatePromoCodeService, fetchRatePlansService, fetchRoomTypesService } from "./services";
import type { DiscountType, ICreatePromoCode, IRPromoCode, RatePlan, RoomTypes } from "./interfaces";
import { currencies } from "@/components/currency-code/cuurency";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

export default function PromoCodePage() {
    const { propertyId } = useParams<{ propertyId: string }>();
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
        setLoading({ isLoading: true, text: "Loading promo codes..." });
        try {
            const response = await fetchPromoCodesService(propertyId);
            if (response.success) {
                setPromoCodes(response.data || []);
            } else {
                toast.error(response.message || "Failed to fetch promo codes");
            }
        } catch (error) {
            toast.error("An error occurred while fetching promo codes");
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
            console.error("Failed to fetch room types", error);
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
            console.error("Failed to fetch rate plans", error);
        }
    };

    const handleCreateOrUpdate = async () => {
        setLoading({ isLoading: true, text: editingPromoCode ? "Updating promo code..." : "Creating promo code..." });
        try {
            let response;
            if (editingPromoCode) {
                response = await updatePromoCodeService(editingPromoCode.id, { ...formData, id: editingPromoCode.id } as any);
            } else {
                response = await createPromoCodeService(formData);
            }

            if (response.success) {
                toast.success(editingPromoCode ? "Promo code updated successfully" : "Promo code created successfully");
                setIsDialogOpen(false);
                resetForm();
                fetchPromoCodes();
            } else {
                toast.error(response.message || "Failed to save promo code");
            }
        } catch (error) {
            toast.error("An error occurred while saving promo code");
        } finally {
            setLoading({ isLoading: false, text: "" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!propertyId) return;

        setLoading({ isLoading: true, text: "Deleting promo code..." });
        try {
            const response = await deletePromoCodeService(propertyId, id);
            if (response.success) {
                toast.success("Promo code deleted successfully");
                fetchPromoCodes();
            } else {
                toast.error(response.message || "Failed to delete promo code");
            }
        } catch (error) {
            toast.error("An error occurred while deleting promo code");
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
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // const isPromoCodeActive = (promoCode: IRPromoCode) => {
    //     const now = new Date();
    //     const validFrom = new Date(promoCode.validFrom);
    //     const validTo = new Date(promoCode.validTo);
    //     return promoCode.isActive && now >= validFrom && now <= validTo;
    // };
    if (loading.isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader text="Loading promo codes..." />
            </div>
        );
    }
    return (
        <div className="container mx-auto p-6 space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <BackButton />
                    <h1 className="text-3xl font-bold mt-2">Promo Codes</h1>
                    <p className="text-muted-foreground">Manage promotional codes for your property</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Promo Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPromoCode ? "Edit Promo Code" : "Create New Promo Code"}</DialogTitle>
                            <DialogDescription>
                                {editingPromoCode ? "Update the promo code details" : "Fill in the details to create a new promo code"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Promo Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Summer Sale 2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Promo Code * (8-12 characters)</Label>
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
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe the promo code offer"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Discount Configuration */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Discount Configuration</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discountType">Discount Type</Label>
                                        <Select
                                            value={formData.discountType}
                                            onValueChange={(value: DiscountType) => setFormData({ ...formData, discountType: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage</SelectItem>
                                                <SelectItem value="flat">Flat Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discountValue">
                                            Discount Value {formData.discountType === "percentage" ? "(%)" : "($)"}
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
                                            <Label htmlFor="currencyCode">Currency Code</Label>
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
                                        <Label htmlFor="minBookingAmount">Min Booking Amount </Label>
                                        <Input
                                            id="minBookingAmount"
                                            type="number"
                                            min={0}

                                            value={formData.minBookingAmount || ""}
                                            onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value ? parseFloat(e.target.value) : null })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxDiscountAmount">Max Discount Amount</Label>
                                        <Input
                                            id="maxDiscountAmount"
                                            type="number"
                                            min={0}

                                            value={formData.maxDiscountAmount || ""}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Validity Period */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Validity Period</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="validFrom">Valid From</Label>
                                        <Input
                                            id="validFrom"
                                            type="datetime-local"
                                            value={formData.validFrom instanceof Date ? formData.validFrom.toISOString().slice(0, 16) : ""}
                                            onChange={(e) => setFormData({ ...formData, validFrom: new Date(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="validTo">Valid To</Label>
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
                                <h3 className="text-lg font-semibold">Usage Limits</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="usageLimit">Total Usage Limit</Label>
                                        <Input
                                            id="usageLimit"
                                            type="number"
                                            min={1}
                                            value={formData.usageLimit || ""}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                                            placeholder="Unlimited"
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
                                <h3 className="text-lg font-semibold">Platform Applicability</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Smartphone className="h-4 w-4" />
                                            <Label htmlFor="mobileApp">Mobile App</Label>
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
                                            <Label htmlFor="desktop">Desktop</Label>
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
                                            <Label htmlFor="tablet">Tablet</Label>
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
                                    <h3 className="text-lg font-semibold">Applicable Room Types</h3>
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
                                        <Label htmlFor="specificRoomTypes">Select Specific Room Types</Label>
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
                                                <Label htmlFor={`rt-${roomType.id}`}>{roomType.roomName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSpecificRoomTypes && roomTypes.length === 0 && <p className="text-sm text-muted-foreground">No room types available.</p>}
                                {!isSpecificRoomTypes && <p className="text-sm text-muted-foreground">Applicable to all room types.</p>}
                            </div>

                            <Separator />

                            {/* Rate Plan Applicability */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Applicable Rate Plans</h3>
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
                                        <Label htmlFor="specificRatePlans">Select Specific Rate Plans</Label>
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
                                                <Label htmlFor={`rp-${ratePlan.id}`}>{ratePlan.ratePlanName}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isSpecificRatePlans && ratePlans.length === 0 && <p className="text-sm text-muted-foreground">No rate plans available.</p>}
                                {!isSpecificRatePlans && <p className="text-sm text-muted-foreground">Applicable to all rate plans.</p>}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => {
                                setIsDialogOpen(false);
                                resetForm();
                            }}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateOrUpdate}>
                                {editingPromoCode ? "Update" : "Create"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Promo Codes List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Promo Codes</CardTitle>
                    <CardDescription>Manage all your promotional codes</CardDescription>
                </CardHeader>
                <CardContent>
                    {promoCodes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No promo codes found. Create one to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {promoCodes.map((promoCode) => (
                                    <TableRow key={promoCode.id}>
                                        <TableCell className="font-mono font-bold">{promoCode.code}</TableCell>
                                        <TableCell>{promoCode.name}</TableCell>
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
                                                <div className="text-muted-foreground">to {formatDate(promoCode.validTo)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {promoCode.usageLimit ? (
                                                <Badge variant="secondary">{promoCode.usageLimit} uses</Badge>
                                            ) : (
                                                <Badge variant="secondary">Unlimited</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {promoCode.isActive ? (
                                                <Badge className="bg-green-500">Active</Badge>
                                            ) : (
                                                <Badge variant="destructive">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
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
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this promo code. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setDeleteDialogOpen(false);
                            setPromoCodeToDelete(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}