import { useState, useEffect } from "react";
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
    IAddonSubCategory 
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
    mode 
}: VariantDialogProps) {
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
                        {mode === "create" ? "Create New Variant" : "Edit Variant"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "Add a new variant" 
                            : "Update variant details"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="variant-category">Category *</Label>
                        <Select
                            value={selectedCategoryId}
                            onValueChange={(value) => {
                                setSelectedCategoryId(value);
                                setFormData({ ...formData, subcategoryId: "" });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
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
                        <Label htmlFor="variant-subcategory">Subcategory *</Label>
                        <Select
                            value={formData.subcategoryId}
                            onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                            disabled={!selectedCategoryId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select subcategory" />
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
                        <Label htmlFor="variant-name">Variant Name *</Label>
                        <Input
                            id="variant-name"
                            placeholder="e.g., Standard, Premium, Deluxe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={!formData.name.trim() || !formData.subcategoryId}
                    >
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
