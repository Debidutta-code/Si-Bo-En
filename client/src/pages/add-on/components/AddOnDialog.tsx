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
                        {mode === "create" ? "Create New Add-On" : "Edit Add-On"}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === "create" 
                            ? "Add a new service or amenity to your property" 
                            : "Update the add-on details"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">Add-On Name *</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Airport Transfer"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
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
                                    <SelectValue placeholder="Select category" />
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

                        <div className="space-y-2">
                            <Label htmlFor="subcategory">Subcategory *</Label>
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
                                    <SelectValue placeholder="Select subcategory" />
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

                        <div className="space-y-2">
                            <Label htmlFor="variant">Variant *</Label>
                            <Select
                                value={formData.variantId || ""}
                                onValueChange={(value) => setFormData({ ...formData, variantId: value })}
                                disabled={!formData.subcategoryId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select variant" />
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

                        <div className="space-y-2">
                            <Label htmlFor="postingRhythm">Posting Rhythm *</Label>
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
                                    <SelectItem value="per_stay">Per Stay</SelectItem>
                                    <SelectItem value="per_night">Per Night</SelectItem>
                                    <SelectItem value="per_person_per_night">Per Person Per Night</SelectItem>
                                    <SelectItem value="per_room_per_night">Per Room Per Night</SelectItem>
                                    <SelectItem value="per_person_per_stay">Per Person Per Stay</SelectItem>
                                    <SelectItem value="per_person_per_room">Per Person Per Room</SelectItem>
                                    <SelectItem value="per_room">Per Room</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe the add-on service..."
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>Images</Label>
                            <div className="space-y-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsImageModalOpen(true)}
                                    className="w-full"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Images
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

                        <div className="flex items-center justify-between col-span-2">
                            <Label htmlFor="isActive">Active Status</Label>
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
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={ !formData.variantId}
                    >
                        {mode === "create" ? "Create Add-On" : "Update Add-On"}
                    </Button>
                </DialogFooter>
            </DialogContent>

            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                // uploadImages={uploadImages}
                onUploadSuccess={handleImageUploadSuccess}
            />
        </Dialog>
    );
}
