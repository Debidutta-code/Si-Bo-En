import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import type {
    IAddonVariant,
    IAddonVariantCreate,
    IAddonCategory,
    IAddonSubCategory,
} from "../interface";

interface VariantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: IAddonVariantCreate) => Promise<void>;
    variant?: IAddonVariant | null;
    categories: IAddonCategory[];
    subCategories: IAddonSubCategory[];
    mode: "create" | "edit";
}

export default function VariantDialog({
    open,
    onOpenChange,
    onSave,
    variant,
    categories,
    subCategories,
    mode,
}: VariantDialogProps) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState<IAddonVariantCreate>({
        name: "",
        subcategoryId: "",
    });
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [filteredSubCategories, setFilteredSubCategories] = useState<IAddonSubCategory[]>([]);

    useEffect(() => {
        if (variant && mode === "edit") {
            const subCat = subCategories.find(s => s.id === variant.subcategoryId);
            if (subCat) {
                setSelectedCategoryId(subCat.categoryId);
            }
            setFormData({
                name: variant.name,
                subcategoryId: variant.subcategoryId,
            });
        }
    }, [variant, mode, subCategories]);

    useEffect(() => {
        if (selectedCategoryId) {
            const filtered = subCategories.filter(
                (sub) => sub.categoryId === selectedCategoryId
            );
            setFilteredSubCategories(filtered);
        } else {
            setFilteredSubCategories([]);
        }
    }, [selectedCategoryId, subCategories]);

    const handleSave = async () => {
        await onSave(formData);
        setFormData({ name: "", subcategoryId: "" });
        setSelectedCategoryId("");
    };

    const handleClose = () => {
        setFormData({ name: "", subcategoryId: "" });
        setSelectedCategoryId("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? t("Addon.VariantDialog.title.create") : t("Addon.VariantDialog.title.edit")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" ? t("Addon.VariantDialog.description.create") : t("Addon.VariantDialog.description.edit")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="variant-category">{t("Addon.VariantDialog.form.categoryLabel")}</Label>
                        <Select
                            value={selectedCategoryId}
                            onValueChange={(value) => {
                                setSelectedCategoryId(value);
                                setFormData({ ...formData, subcategoryId: "" });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("Addon.VariantDialog.form.categoryPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="variant-subcategory">{t("Addon.VariantDialog.form.subcategoryLabel")}</Label>
                        <Select
                            value={formData.subcategoryId}
                            onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                            disabled={!selectedCategoryId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("Addon.VariantDialog.form.subcategoryPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSubCategories.map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="variant-name">{t("Addon.VariantDialog.form.nameLabel")}</Label>
                        <Input
                            id="variant-name"
                            placeholder={t("Addon.VariantDialog.form.namePlaceholder")}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        {t("Addon.VariantDialog.form.cancel")}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.name.trim() || !formData.subcategoryId}
                    >
                        {mode === "create" ? t("Addon.VariantDialog.form.create") : t("Addon.VariantDialog.form.update")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}