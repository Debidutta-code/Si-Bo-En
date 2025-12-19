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
    const [formData, setFormData] = useState<IAddonCategoryCreate>({
        name: category?.name || "",
    });

    const handleSave = async () => {
        await onSave(formData);
        setFormData({ name: ""});
    };

    const handleClose = () => {
        setFormData({ name: ""});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Create New Category" : "Edit Category"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "Add a new add-on category" 
                            : "Update category details"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="category-name">Category Name *</Label>
                        <Input
                            id="category-name"
                            placeholder="e.g., Transportation, Food & Beverage"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!formData.name.trim()}>
                        {mode === "create" ? "Create" : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
