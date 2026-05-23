import { useState } from "react";
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
import type { IAddonCategory, IAddonCategoryCreate } from "../interface";
import { useTranslation } from "react-i18next";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: IAddonCategoryCreate) => Promise<void>;
    category?: IAddonCategory | null;
    mode: "create" | "edit";
}

export default function CategoryDialog({
    open,
    onOpenChange,
    onSave,
    category,
    mode
}: CategoryDialogProps) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState<IAddonCategoryCreate>({
        name: category?.name || "",
    });

    const handleSave = async () => {
        await onSave(formData);
        setFormData({ name: "" });
    };

    const handleClose = () => {
        setFormData({ name: "" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? t("Addon.categoryDialog.createTitle") : t("Addon.categoryDialog.editTitle")}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create"
                            ? t("Addon.categoryDialog.createDescription")
                            : t("Addon.categoryDialog.editDescription")}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">{t("Addon.categoryDialog.form.categoryNameLabel")}</Label>
                        <Input
                            id="category-name"
                            placeholder={t("Addon.categoryDialog.form.categoryNamePlaceholder")}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        {t("Addon.categoryDialog.buttons.cancel")}
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.name.trim()}>
                        {mode === "create" ? t("Addon.categoryDialog.buttons.create") : t("Addon.categoryDialog.buttons.update")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}