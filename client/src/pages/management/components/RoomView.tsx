
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

interface RoomViewTabProps {
    roomViews: IMasterRoomView[];
    setRoomViews: React.Dispatch<React.SetStateAction<IMasterRoomView[]>>;
}

export default function RoomViewTab({ roomViews, setRoomViews }: RoomViewTabProps) {
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
                        <CardTitle>Room Views</CardTitle>
                        <CardDescription>Manage room views</CardDescription>
                    </div>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Room View
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Room View</DialogTitle>
                                <DialogDescription>Add a new room view</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
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
                                <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); setCreateInput(""); }}>Cancel</Button>
                                <Button onClick={handleCreateRoomView}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {sortedRoomViews.map((rv) => (
                        <Badge
                            key={rv.id}
                            variant="outline"
                            className="text-sm py-2 px-3 flex items-center gap-2"
                        >
                            <span className={rv.isActive ? "" : "text-gray-400 line-through"}>
  {rv._translations?.viewName ?? rv.viewName}
</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type="button" className="hover:text-blue-600" aria-label={`Actions for ${rv.viewName}`}>
                                        <MoreVertical className="h-3 w-3" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditDialog(rv)}>
                                        <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openAddTranslation(rv.id)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Translation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openCheckTranslations(rv.id)}>
                                        <Languages className="h-4 w-4 mr-2" /> Check Translations
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRoomView(rv.id)}>
                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Badge>
                    ))}

                    {sortedRoomViews.length === 0 && (
                        <div className="w-full text-center py-12 text-gray-500">
                            No room views found. Create your first room view to get started.
                        </div>
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        setIsEditDialogOpen(open);
                        if (!open) { setSelectedRoomView(null); setEditInput(""); }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Room View</DialogTitle>
                            <DialogDescription>Edit the selected room view</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-2">
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
                            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setSelectedRoomView(null); setEditInput(""); }}>Cancel</Button>
                            <Button onClick={handleUpdateRoomView}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>

            {translationEntityId && (
                <>
                    <AddTranslationDialog
                        open={addTranslationOpen}
                        onOpenChange={setAddTranslationOpen}
                        entityId={translationEntityId}
                        title="Add Room View Translation"
                        fields={[{ key: "viewName", label: "View Name", placeholder: "e.g., Vista al mar" }]}
                        onSave={async (id, locale, data) => {
                            return await upsertMasterRoomViewTranslationService(id, { [locale]: data });
                        }}
                    />
                    <CheckTranslationsDialog
                        open={checkTranslationsOpen}
                        onOpenChange={setCheckTranslationsOpen}
                        entityId={translationEntityId}
                        title="Room View Translations"
                        displayFields={[{ key: "viewName", label: "Name" }]}
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
                        title="Edit Room View Translation"
                        fields={[{ key: "viewName", label: "View Name", placeholder: "e.g., Vista al mar" }]}
                        onSave={async (id, locale, data) => upsertMasterRoomViewTranslationService(id, { [locale]: data })}
                    />
                </>
            )}
        </Card>
    );
}
