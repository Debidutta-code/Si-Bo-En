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
import type { IAddonSubCategory, IAddonSubCategoryCreate, IAddonCategory } from "../interface";

interface SubCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: IAddonSubCategoryCreate) => Promise<void>;
    subCategory?: IAddonSubCategory | null;
    categories: IAddonCategory[];
    mode: "create" | "edit";
}

export default function SubCategoryDialog({
    open,
    onOpenChange,
    onSave,
    subCategory,
    categories,
    mode,
}: SubCategoryDialogProps) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState<IAddonSubCategoryCreate>({
        name: "",
        categoryId: "",
    });

    useEffect(() => {
        if (subCategory && mode === "edit") {
            setFormData({
                name: subCategory.name,
                categoryId: subCategory.categoryId,
            });
        }
    }, [subCategory, mode]);

    const handleSave = async () => {
        await onSave(formData);
        setFormData({ name: "", categoryId: "" });
    };

    const handleClose = () => {
        setFormData({ name: "", categoryId: "" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? t("Addon.SubCategoryDialog.title.create") : t("Addon.SubCategoryDialog.title.edit")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" ? t("Addon.SubCategoryDialog.description.create") : t("Addon.SubCategoryDialog.description.edit")}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sub-category">{t("Addon.SubCategoryDialog.form.categoryLabel")}</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t("Addon.SubCategoryDialog.form.categoryPlaceholder")} />
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
                        <Label htmlFor="sub-category-name">{t("Addon.SubCategoryDialog.form.nameLabel")}</Label>
                        <Input
                            id="sub-category-name"
                            placeholder={t("Addon.SubCategoryDialog.form.namePlaceholder")}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        {t("Addon.SubCategoryDialog.form.cancel")}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.name.trim() || !formData.categoryId}
                    >
                        {mode === "create" ? t("Addon.SubCategoryDialog.form.create") : t("Addon.SubCategoryDialog.form.update")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}