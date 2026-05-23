import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import ImageUploadModal from "@/components/property/ImageUploadModal";
import { X, Upload } from "lucide-react";
import type {
    IAddon,
    IAddonCreate,
    IAddonUpdate,
    IAddonCategory,
    IAddonSubCategory,
    IAddonVariant,
    PostingRhythm
} from "../interface";
import { useTranslation } from "react-i18next";

interface AddOnDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: IAddonCreate | IAddonUpdate) => Promise<void>;
    addOn?: IAddon | null;
    categories: IAddonCategory[];
    subCategories: IAddonSubCategory[];
    variants: IAddonVariant[];
    mode: "create" | "edit";
}

export default function AddOnDialog({
    open,
    onOpenChange,
    onSave,
    addOn,
    categories,
    subCategories,
    variants,
    mode
}: AddOnDialogProps) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState<IAddonCreate | IAddonUpdate>({
        name: "",
        postingRhythm: "per_night",
        description: "",
        isActive: true,
        images: [],
        categoryId: "",
        subcategoryId: "",
        variantId: "",
    });
    const [filteredSubCategories, setFilteredSubCategories] = useState<IAddonSubCategory[]>([]);
    const [filteredVariants, setFilteredVariants] = useState<IAddonVariant[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        if (addOn && mode === "edit") {
            setFormData({
                name: addOn.name,
                postingRhythm: addOn.postingRhythm,
                description: addOn.description || "",
                isActive: addOn.isActive,
                images: addOn.images,
                categoryId: addOn.categoryId || "",
                subcategoryId: addOn.subcategoryId || "",
                variantId: addOn.variantId || "",
            });
        }
    }, [addOn, mode]);

    useEffect(() => {
        if (formData.categoryId) {
            const filtered = subCategories.filter(
                (sub) => sub.categoryId === formData.categoryId
            );
            setFilteredSubCategories(filtered);
        } else {
            setFilteredSubCategories([]);
        }
    }, [formData.categoryId, subCategories]);

    useEffect(() => {
        if (formData.subcategoryId) {
            const filtered = variants.filter(
                (variant) => variant.subcategoryId === formData.subcategoryId
            );
            setFilteredVariants(filtered);
        } else {
            setFilteredVariants([]);
        }
    }, [formData.subcategoryId, variants]);

    const handleSave = async () => {
        await onSave(formData);
        resetForm();
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    const handleImageUploadSuccess = (uploadedUrls: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), ...uploadedUrls]
        }));
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index) || []
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            postingRhythm: "per_night",
            description: "",
            isActive: true,
            images: [],
            categoryId: "",
            subcategoryId: "",
            variantId: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">
                        {mode === "create" ? t("Addon.dialog.createTitle") : t("Addon.dialog.editTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? t("Addon.dialog.createDescription")
                            : t("Addon.dialog.editDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">

                        {/* Add-On Name */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">{t("Addon.dialog.form.addonNameLabel")}</Label>
                            <Input
                                id="name"
                                placeholder={t("Addon.dialog.form.addonNamePlaceholder")}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="category">{t("Addon.dialog.form.categoryLabel")}</Label>
                            <Select
                                value={formData.categoryId || ""}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    categoryId: value,
                                    subcategoryId: "",
                                    variantId: ""
                                })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("Addon.dialog.form.categoryPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subcategory */}
                        <div className="space-y-2">
                            <Label htmlFor="subcategory">{t("Addon.dialog.form.subcategoryLabel")}</Label>
                            <Select
                                value={formData.subcategoryId || ""}
                                onValueChange={(value) => setFormData({
                                    ...formData,
                                    subcategoryId: value,
                                    variantId: ""
                                })}
                                disabled={!formData.categoryId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("Addon.dialog.form.subcategoryPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredSubCategories?.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Variant */}
                        <div className="space-y-2">
                            <Label htmlFor="variant">{t("Addon.dialog.form.variantLabel")}</Label>
                            <Select
                                value={formData.variantId || ""}
                                onValueChange={(value) => setFormData({ ...formData, variantId: value })}
                                disabled={!formData.subcategoryId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("Addon.dialog.form.variantPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredVariants.map((variant) => (
                                        <SelectItem key={variant.id} value={variant.id}>
                                            {variant.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Posting Rhythm */}
                        <div className="space-y-2">
                            <Label htmlFor="postingRhythm">{t("Addon.dialog.form.postingRhythmLabel")}</Label>
                            <Select
                                value={formData.postingRhythm}
                                onValueChange={(value: PostingRhythm) =>
                                    setFormData({ ...formData, postingRhythm: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="per_stay">{t("Addon.dialog.postingRhythm.perStay")}</SelectItem>
                                    <SelectItem value="per_night">{t("Addon.dialog.postingRhythm.perNight")}</SelectItem>
                                    <SelectItem value="per_person_per_night">{t("Addon.dialog.postingRhythm.perPersonPerNight")}</SelectItem>
                                    <SelectItem value="per_room_per_night">{t("Addon.dialog.postingRhythm.perRoomPerNight")}</SelectItem>
                                    <SelectItem value="per_person_per_stay">{t("Addon.dialog.postingRhythm.perPersonPerStay")}</SelectItem>
                                    <SelectItem value="per_person_per_room">{t("Addon.dialog.postingRhythm.perPersonPerRoom")}</SelectItem>
                                    <SelectItem value="per_room">{t("Addon.dialog.postingRhythm.perRoom")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description">{t("Addon.decs")}</Label>
                            <Textarea
                                id="description"
                                placeholder={t("Addon.dialog.form.descriptionPlaceholder")}
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-2 col-span-2">
                            <Label>{t("Addon.dialog.form.imagesLabel")}</Label>
                            <div className="space-y-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsImageModalOpen(true)}
                                    className="w-full"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {t("Addon.dialog.form.uploadImages")}
                                </Button>

                                {formData.images && formData.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        {formData.images.map((imageUrl, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Add-on ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between col-span-2">
                            <Label htmlFor="isActive">{t("Addon.dialog.form.activeStatus")}</Label>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        {t("Addon.dialog.buttons.cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.variantId}>
                        {mode === "create" ? t("Addon.dialog.buttons.create") : t("Addon.dialog.buttons.update")}
                    </Button>
                </DialogFooter>
            </DialogContent>

            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onUploadSuccess={handleImageUploadSuccess}
            />
        </Dialog>
    );
}