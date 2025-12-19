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
import  type { IAddonSubCategory, IAddonSubCategoryCreate, IAddonCategory } from "../interface";

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
    mode 
}: SubCategoryDialogProps) {
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
        setFormData({ name: "",  categoryId: "" });
    };

    const handleClose = () => {
        setFormData({ name: "",  categoryId: "" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Create New Subcategory" : "Edit Subcategory"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "Add a new subcategory" 
                            : "Update subcategory details"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sub-category">Category *</Label>
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
                        <Label htmlFor="sub-category-name">Subcategory Name *</Label>
                        <Input
                            id="sub-category-name"
                            placeholder="e.g., Airport Transfer, Room Service"
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
                        disabled={!formData.name.trim() || !formData.categoryId}
                    >
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
