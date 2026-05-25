import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, Plus, Trash2, Languages } from "lucide-react";
import toast from "react-hot-toast";
import type { ICMasterRoomView, IMasterRoomView } from "../types";
import {
    createNewRoomView,
    deleteRoomViewService,
    getAllRoomViews,
    updateRoomViewService,
} from "../services/room-view.services";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "./multilang/ManagementTranslationDialogs";
import {
    upsertMasterRoomViewTranslationService,
    getAllMasterRoomViewTranslationsService,
    deleteMasterRoomViewTranslationLocaleService,
} from "../services/multilanguage.services";
import { useTranslation } from "react-i18next";

interface RoomViewTabProps {
    roomViews: IMasterRoomView[];
    setRoomViews: React.Dispatch<React.SetStateAction<IMasterRoomView[]>>;
}

export default function RoomViewTab({ roomViews, setRoomViews }: RoomViewTabProps) {
    const { t } = useTranslation();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [createInput, setCreateInput] = useState<string>("");
    const [editInput, setEditInput] = useState<string>("");
    const [selectedRoomView, setSelectedRoomView] = useState<IMasterRoomView | null>(null);

    const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
    const [addTranslationOpen, setAddTranslationOpen] = useState(false);
    const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
    const [editTranslationOpen, setEditTranslationOpen] = useState(false);
    const [editingLocale, setEditingLocale] = useState<string>("");
    const [editingData, setEditingData] = useState<Record<string, any>>({});
    const sortedRoomViews = useMemo(() => {
        return [...roomViews].sort((a, b) => a.viewName.localeCompare(b.viewName));
    }, [roomViews]);

    const handleCreateRoomView = async () => {
        const payload: ICMasterRoomView = { viewName: createInput };
        const response = await createNewRoomView(payload);
        if (response?.success) {
            toast.success("Room view created successfully");
            const data = await getAllRoomViews();
            setRoomViews(data.data);
            setCreateInput("");
            setIsCreateDialogOpen(false);
            return;
        }
        toast.error(response?.message || "Failed to create room view");
    };

    const openEditDialog = (roomView: IMasterRoomView) => {
        setSelectedRoomView(roomView);
        setEditInput(roomView.viewName || "");
        setIsEditDialogOpen(true);
    };

    const handleUpdateRoomView = async () => {
        if (!selectedRoomView?.id) {
            toast.error("Select a room view to update");
            return;
        }
        const payload: ICMasterRoomView = { viewName: editInput };
        const response = await updateRoomViewService(selectedRoomView.id, payload);
        if (response?.success) {
            toast.success("Room view updated successfully");
            const data = await getAllRoomViews();
            setRoomViews(data.data);
            setIsEditDialogOpen(false);
            setSelectedRoomView(null);
            setEditInput("");
            return;
        }
        toast.error(response?.message || "Failed to update room view");
    };

    const handleDeleteRoomView = async (id: string) => {
        const response = await deleteRoomViewService(id);
        if (response?.success) {
            toast.success("Room view deleted successfully");
            const data = await getAllRoomViews();
            setRoomViews(data.data); return;
        }
        toast.error(response?.message || "Failed to delete room view");
    };

    const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
    const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t("Management.roomViewsTitle")}</CardTitle>
                        <CardDescription>{t("Management.manageRoomViews")}</CardDescription>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                {t("Management.addRoomView")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t("Management.createRoomView")}</DialogTitle>
                                <DialogDescription>{t("Management.addNewRoomView")}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Input
                                    value={createInput}
                                    onChange={(e) => setCreateInput(e.target.value)}
                                    placeholder="e.g., Ocean View"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") { e.preventDefault(); handleCreateRoomView(); }
                                    }}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); setCreateInput(""); }}>{t("Common.cancel", { ns: "translation" })}</Button>
                                <Button onClick={handleCreateRoomView}>{t("Common.save", { ns: "translation" })}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {sortedRoomViews.map((view) => (
                        <Badge
                            key={view.id}
                            variant="outline"
                            className="text-sm py-2 px-3 flex items-center gap-2"
                        >
                            {view._translations?.viewName || view.viewName}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="hover:text-blue-600 ml-1">
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(view)}>
                                        <Pencil className="h-4 w-4 mr-2" /> {t("Common.edit", { ns: "translation" })}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openAddTranslation(view.id)}>
                                        <Plus className="h-4 w-4 mr-2" /> {t("Common.addTranslation", { ns: "translation" })}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openCheckTranslations(view.id)}>
                                        <Languages className="h-4 w-4 mr-2" /> {t("Common.checkTranslation", { ns: "translation" })}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDeleteRoomView(view.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> {t("Common.delete", { ns: "translation" })}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Badge>
                    ))}
                    {sortedRoomViews.length === 0 && (
                        <div className="w-full text-center py-12 text-gray-500">
                            {t("Management.noRoomViewsFound")}
                        </div>
                    )}
                </div>
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Management.updateRoomView")}</DialogTitle>
                        <DialogDescription>{t("Management.editRoomView")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            placeholder="e.g., City View"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleUpdateRoomView(); }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedRoomView(null); setEditInput(""); }}>{t("Management.Common.cancel", { ns: "translation" })}</Button>
                        <Button onClick={handleUpdateRoomView}>{t("Common.edit", { ns: "translation" })}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {translationEntityId && (
                <>
                    <AddTranslationDialog
                        open={addTranslationOpen}
                        onOpenChange={setAddTranslationOpen}
                        entityId={translationEntityId}
                        title={t("Management.Common.addTranslation", { ns: "translation", defaultValue: "Add Room View Translation" })}
                        fields={[
                            { key: "viewName", label: t("Management.roomViewsTitle"), placeholder: "e.g., Vista al mar" }
                        ]}
                        onSave={async (id, locale, data) => {
                            return await upsertMasterRoomViewTranslationService(id, { [locale]: data });
                        }}
                    />
                    <CheckTranslationsDialog
                        open={checkTranslationsOpen}
                        onOpenChange={setCheckTranslationsOpen}
                        entityId={translationEntityId}
                        title={t("Management.Common.checkTranslation", { ns: "translation", defaultValue: "Room View Translations" })}
                        displayFields={[
                            { key: "viewName", label: t("Management.roomViewsTitle") }
                        ]}
                        onFetch={getAllMasterRoomViewTranslationsService}
                        onDelete={deleteMasterRoomViewTranslationLocaleService}
                        onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
                    />
                    <EditTranslationDialog
                        open={editTranslationOpen}
                        onOpenChange={setEditTranslationOpen}
                        entityId={translationEntityId!}
                        locale={editingLocale}
                        initialData={editingData}
                        title={t("Management.Common.editTranslation", { ns: "translation", defaultValue: "Edit Room View Translation" })}
                        fields={[
                            { key: "viewName", label: t("Management.roomViewsTitle"), placeholder: "e.g., Vista al mar" }
                        ]}
                        onSave={async (id, locale, data) => upsertMasterRoomViewTranslationService(id, { [locale]: data })}
                    />
                </>
            )}
        </Card>
    );
}
