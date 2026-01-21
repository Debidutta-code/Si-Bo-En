import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, X, Upload, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { capitalizeFirstLetter } from "@/lib/utils";
import type { INewGBP } from "@/pages/property/types/types";
import { createEntity } from "./api/newEntity";
import toast from "react-hot-toast";
import ImageUploadModal from "@/components/property/ImageUploadModal";
import { uploadImages } from "@/components/property/api/create/propertyinfo";
import { Label } from "@/components/ui/label";
const CreateEntityDialog = ({ currentTab, creationId, level ,fetchProperties}: { currentTab: string, creationId: string, level: number, fetchProperties: () => void }) => {
    const [newGBP, setNewGBP] = useState<INewGBP>({
        name: "",
        type: "property",
        creationId: creationId,
        level: level,
        images: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

    const handleUploadSuccess = (uploadedUrls: string[]) => {
        setNewGBP(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    };

    const handleRemoveImage = (index: number) => {
        setNewGBP(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleCreate = async () => {
        setIsLoading(true);
        if (!newGBP.name.trim()) {
            toast.error("Fill the name")
            setIsLoading(false);
            return;
        }
        try {
            const res = await createEntity(newGBP)
            // console.log(res)
            if (res.success) {
                toast.success("Created successfully")
                setNewGBP({
                    name: "",
                    type: "property",
                    creationId: creationId,
                    level: level,
                    images: []
                });
                fetchProperties();
            } else {
                toast.error(res.message)
            }

        } catch (error) {
            toast.error("Failed to create ")

        } finally {
            setIsLoading(false)
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={"secondary"}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create {capitalizeFirstLetter(currentTab)}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex w-full justify-between">
                        <AlertDialogTitle>Create New Entity</AlertDialogTitle>
                        <AlertDialogCancel className="rounded-full h-10 w-10 p-0">
                            <X className="h-4 w-4" />
                        </AlertDialogCancel>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <label htmlFor="entity-name" className="text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="entity-name"
                            placeholder={`Enter ${newGBP.type} name`}
                            value={newGBP.name}
                            onChange={(e) => setNewGBP({ ...newGBP, name: e.target.value })}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label htmlFor="entity-type" className="text-sm font-medium">
                            Type
                        </label>
                        <Select
                            value={newGBP.type}
                            onValueChange={(value: "group" | "brand" | "property") =>
                                setNewGBP({ ...newGBP, type: value })
                            }
                        >
                            <SelectTrigger id="entity-type" className="mt-1">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="group">Group</SelectItem>
                                <SelectItem value="brand">Brand</SelectItem>
                                <SelectItem value="property">Property</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-medium">Images ({newGBP.images.length})</Label>
                        <div className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsImageUploadModalOpen(true)}
                                className="w-full"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Images
                            </Button>
                        </div>
                        
                        {newGBP.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {newGBP.images.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Upload ${index + 1}`}
                                            className="w-full h-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleCreate();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? `Creating...`
                            : `Create ${capitalizeFirstLetter(newGBP.type)}`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

            {/* Image Upload Modal */}
            <ImageUploadModal
                isOpen={isImageUploadModalOpen}
                onClose={() => setIsImageUploadModalOpen(false)}
                uploadImages={uploadImages}
                onUploadSuccess={handleUploadSuccess}
            />
        </AlertDialog>
    );
};

export default CreateEntityDialog;