import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, X, Upload, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { capitalizeFirstLetter } from "@/lib/utils";
import type { ICreation, INewGBP } from "@/pages/property/types/types";
import { createEntity, getAllCustoms } from "../api/newEntity";
import toast from "react-hot-toast";
import ImageUploadModal from "@/components/property/ImageUploadModal";
import { Label } from "@/components/ui/label";
import type { ILoader } from "@/pages/dashboard/interface";
import { useAppSelector } from "@/redux/hooks";
import { useTranslation } from "react-i18next";

const CreateEntityDialog = ({ currentTab, creationId, level, fetchProperties, creationType }:
    {
        currentTab: string,
        creationId: string,
        level: number,
        fetchProperties: () => void,
        creationType: "brand" | "group" | "super"
    }
) => {
    const { t } = useTranslation();
    const user = useAppSelector((state) => state.user.user);
    const [customs, setCustoms] = useState<ICreation[]>([]);
    const [open, setOpen] = useState<boolean>(false)
    const [selectedCustom, _setSelectedCustom] = useState<ICreation | null>(null);
    useEffect(() => {
        const fetchCustoms = async () => {
            setIsLoading({
                isLoading: true,
                message: t("CreateEntity.toast.loadingCustoms")
            });
            try {
                const customs = await getAllCustoms();
                setCustoms(customs.data);
            } catch (error) {
                toast.error(t("CreateEntity.toast.failedLoadCustoms"));
            } finally {
                setIsLoading({
                    isLoading: false,
                    message: ""
                });
            }
        };
        fetchCustoms();
    }, []);
    const [newGBP, setNewGBP] = useState<INewGBP>({
        name: "",
        type: "property",
        creationId: creationId,
        level: level,
        images: [],
        isCustom: false,
        assignTo: ""
    });

    const [isLoading, setIsLoading] = useState<ILoader>({
        isLoading: true,
        message: "Loading Customs ..."
    });
    const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);

    const handleUploadSuccess = (uploadedUrls: string[]) => {
        setNewGBP(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(t("CreateEntity.toast.uploadSuccess", { count: uploadedUrls.length }));
    };

    const handleRemoveImage = (index: number) => {
        setNewGBP(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleCreate = async () => {
        if (!newGBP.name.trim()) {
            toast.error(t("CreateEntity.toast.fillName"))
            return;
        }
        setIsLoading({
            isLoading: true,
            message: t("CreateEntity.toast.creating", { type: capitalizeFirstLetter(newGBP.type) })
        });
        try {
            const payload = { ...newGBP, isCustom: newGBP.assignTo ? true : false };
            if (user?.role === "regional_admin") {
                payload.assignTo = user.creation;
                payload.isCustom = true;
            }
            const res = await createEntity(payload)
            if (res.success) {
                toast.success(t("CreateEntity.toast.createdSuccess"))
                setNewGBP({
                    name: "",
                    type: "property",
                    creationId: creationId,
                    level: level,
                    images: [],
                    isCustom: false,
                    assignTo: ""
                });
                fetchProperties();
                setOpen(false)
            } else {
            toast.error(t("CreateEntity.toast.failedCreate"))
            }

        } catch (error) {
            toast.error("Failed to create ")

        } finally {
            setIsLoading({
                isLoading: false,
                message: ""
            })
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={"secondary"} onClick={() => setOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t("CreateEntity.button",{name:t(`CreateEntity.types.${currentTab}`)} )} 
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>

                <AlertDialogHeader>
                    <div className="flex w-full justify-between">
                        <AlertDialogTitle>{t("CreateEntity.title")}</AlertDialogTitle>
                        <AlertDialogCancel className="rounded-full h-10 w-10 p-0">
                            <X className="h-4 w-4" />
                        </AlertDialogCancel>
                    </div>
                </AlertDialogHeader>

                <div className="space-y-4 py-2">
                    <div>
                        <label htmlFor="entity-name" className="text-sm font-medium">
                            {t("CreateEntity.name")}
                        </label>
                        <Input
                            id="entity-name"
                            placeholder={t("CreateEntity.namePlaceholder", { type: newGBP.type })}
                            value={newGBP.name}
                            onChange={(e) => setNewGBP({ ...newGBP, name: e.target.value })}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label htmlFor="entity-type" className="text-sm font-medium">
                            {t("CreateEntity.type")}
                        </label>
                        <Select
                            value={newGBP.type}
                            onValueChange={(value: "group" | "brand" | "property" | "regional") =>
                                setNewGBP({ ...newGBP, type: value, isCustom: value === "regional" })
                            }
                        >
                            <SelectTrigger id="entity-type" className="mt-1">
                                <SelectValue placeholder={t("CreateEntity.typePlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {creationType === "group" && (
                                    <>
                                        <SelectItem value="brand">{t("CreateEntity.types.brand")}</SelectItem>
                                        <SelectItem value="property">{t("CreateEntity.types.property")}</SelectItem>
                                    </>
                                )} {creationType === "brand" && (
                                    <>
                                        <SelectItem value="property">{t("CreateEntity.types.property")}</SelectItem>
                                    </>
                                )}
                                {creationType === "super" && (
                                    <>
                                        <SelectItem value="group">{t("CreateEntity.types.group")}</SelectItem>
                                        <SelectItem value="brand">{t("CreateEntity.types.brand")}</SelectItem>
                                        <SelectItem value="property">{t("CreateEntity.types.property")}</SelectItem>
                                        <SelectItem value="regional">{t("CreateEntity.types.regional")}</SelectItem>

                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    {creationType === "super" && newGBP.type !== "regional" && (
                        <div>
                            <label htmlFor="entity-type" className="text-sm font-medium">
                                {t("CreateEntity.custom")}
                            </label>
                            <Select
                                value={selectedCustom?.id}
                                onValueChange={(value: string) =>
                                    setNewGBP({ ...newGBP, assignTo: value })
                                }
                            >
                                <SelectTrigger id="entity-type" className="mt-1">
                                    <SelectValue placeholder={t("CreateEntity.customPlaceholder")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {customs.length > 0 &&
                                        customs.map((regional) => (
                                            <SelectItem key={regional.id} value={regional.id}>
                                                {regional.name}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div>
                        <Label className="text-sm font-medium">{t("CreateEntity.images", { count: newGBP.images.length })}</Label>
                        <div className="mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsImageUploadModalOpen(true)}
                                className="w-full"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {t("CreateEntity.uploadImages")}
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
                    <AlertDialogCancel disabled={isLoading.isLoading}>{t("CreateEntity.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleCreate();
                        }}
                        disabled={isLoading.isLoading}
                    >
                        {isLoading.isLoading
                            ? t("CreateEntity.creating")
                            : t("CreateEntity.createButton", { type: capitalizeFirstLetter(newGBP.type) })}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>

            <ImageUploadModal
                isOpen={isImageUploadModalOpen}
                onClose={() => setIsImageUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </AlertDialog>
    );
};

export default CreateEntityDialog;