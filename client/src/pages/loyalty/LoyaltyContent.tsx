import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  createConditionService,
  updateConditionService,
  deleteConditionService,
  getConditionsByProgramIdService,
  createSpecialConditionService,
  updateSpecialConditionService,
  deleteSpecialConditionService,
  getSpecialConditionsByProgramIdService
} from "./services/loyality-condition.service";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "../management/components/multilang/ManagementTranslationDialogs";
import {
  upsertLoyaltyConditionsTranslationService,
  getAllLoyaltyConditionsTranslationsService,
  deleteLoyaltyConditionsTranslationLocaleService,
  upsertLoyaltySpecialConditionTranslationService,
  getAllLoyaltySpecialConditionTranslationsService,
  deleteLoyaltySpecialConditionTranslationLocaleService,
} from "./services/multilang.service";
import type { ILoyalityCondition, ILoyalitySpecialCondition } from "./interfaces";
import { getLoyaltyProgramByCreationId } from "./services/loyality-program.service";
import type { ILoader } from "../dashboard/interface";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";

export default function LoyaltyContent() {
  const { creationId } = useParams();
  const [isLoading, setIsLoading] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty program..."
  });
  const [loyaltyProgramId, setLoyaltyProgramId] = useState<string>("");
  
  const [conditions, setConditions] = useState<ILoyalityCondition[]>([]);
  const [specialConditions, setSpecialConditions] = useState<ILoyalitySpecialCondition[]>([]);
  
  const [isConditionDialogOpen, setIsConditionDialogOpen] = useState(false);
  const [isSpecialDialogOpen, setIsSpecialDialogOpen] = useState(false);
  
  const [editingCondition, setEditingCondition] = useState<ILoyalityCondition | null>(null);
  const [editingSpecialCondition, setEditingSpecialCondition] = useState<ILoyalitySpecialCondition | null>(null);
  
  const [conditionForm, setConditionForm] = useState({ text: "", language: "en" as const });
  const [specialConditionForm, setSpecialConditionForm] = useState({ title: "", subTitle: "", language: "en" as const });
  
  const [deleteConditionId, setDeleteConditionId] = useState<string | null>(null);
  const [deleteSpecialConditionId, setDeleteSpecialConditionId] = useState<string | null>(null);

  // Translation states
  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [translationEntityType, setTranslationEntityType] = useState<"condition" | "special">("condition");
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (creationId) {
      fetchLoyaltyProgram();
    }
  }, [creationId]);

  useEffect(() => {
    if (loyaltyProgramId) {
      fetchConditions();
      fetchSpecialConditions();
    }
  }, [loyaltyProgramId]);

  const fetchLoyaltyProgram = async (): Promise<void> => {
    try {
      const response = await getLoyaltyProgramByCreationId(creationId!);
      if (response.success && response.data) {
        setLoyaltyProgramId(response.data.id);
      } else {
        toast.error("No loyalty program found");
      }
    } catch (error) {
      toast.error("Failed to fetch loyalty program");
    } finally {
      setIsLoading({ isLoading: false, message: "" });
    }
  };

  const fetchConditions = async (): Promise<void> => {
    const response = await getConditionsByProgramIdService(loyaltyProgramId);
    if (response.success && response.data) {
      setConditions(response.data);
    }
  };

  const fetchSpecialConditions = async (): Promise<void> => {
    const response = await getSpecialConditionsByProgramIdService(loyaltyProgramId);
    if (response.success && response.data) {
      setSpecialConditions(response.data);
    }
  };

  const handleCreateCondition = async (): Promise<void> => {
    if (!conditionForm.text.trim()) {
      toast.error("Condition text is required");
      return;
    }

    setIsLoading({ isLoading: true, message: "Creating condition..." });
    const response = await createConditionService({
      loyaltyProgramId,
      text: conditionForm.text,
      language: conditionForm.language
    });

    if (response.success) {
      toast.success("Condition created successfully");
      setConditionForm({ text: "", language: "en" });
      setIsConditionDialogOpen(false);
      await fetchConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
  };

  const handleUpdateCondition = async (): Promise<void> => {
    if (!editingCondition || !conditionForm.text.trim()) {
      toast.error("Condition text is required");
      return;
    }

    setIsLoading({ isLoading: true, message: "Updating condition..." });
    const response = await updateConditionService(editingCondition.id, {
      text: conditionForm.text,
      language: conditionForm.language,
      isActive: editingCondition.isActive
    });

    if (response.success) {
      toast.success("Condition updated successfully");
      setEditingCondition(null);
      setConditionForm({ text: "", language: "en" });
      setIsConditionDialogOpen(false);
      await fetchConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
  };

  const handleDeleteCondition = async (): Promise<void> => {
    if (!deleteConditionId) return;

    setIsLoading({ isLoading: true, message: "Deleting condition..." });
    const response = await deleteConditionService(deleteConditionId);
    if (response.success) {
      toast.success("Condition deleted successfully");
      await fetchConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
    setDeleteConditionId(null);
  };

  const handleToggleConditionStatus = async (condition: ILoyalityCondition): Promise<void> => {
    setIsLoading({ isLoading: true, message: "Updating status..." });
    const response = await updateConditionService(condition.id, {
      text: condition.text,
      language: condition.language,
      isActive: !condition.isActive
    });

    if (response.success) {
      toast.success(`Condition ${!condition.isActive ? "activated" : "deactivated"}`);
      await fetchConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
  };

  const handleCreateSpecialCondition = async (): Promise<void> => {
    if (!specialConditionForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading({ isLoading: true, message: "Creating special condition..." });
    const response = await createSpecialConditionService({
      loyaltyProgramId,
      title: specialConditionForm.title,
      subTitle: specialConditionForm.subTitle || null,
      language: specialConditionForm.language
    });

    if (response.success) {
      toast.success("Special condition created successfully");
      setSpecialConditionForm({ title: "", subTitle: "", language: "en" });
      setIsSpecialDialogOpen(false);
      await fetchSpecialConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
  };

  const handleUpdateSpecialCondition = async (): Promise<void> => {
    if (!editingSpecialCondition || !specialConditionForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsLoading({ isLoading: true, message: "Updating special condition..." });
    const response = await updateSpecialConditionService(editingSpecialCondition.id, {
      title: specialConditionForm.title,
      subTitle: specialConditionForm.subTitle || null,
      language: specialConditionForm.language,
      isActive: editingSpecialCondition.isActive
    });

    if (response.success) {
      toast.success("Special condition updated successfully");
      setEditingSpecialCondition(null);
      setSpecialConditionForm({ title: "", subTitle: "", language: "en" });
      setIsSpecialDialogOpen(false);
      await fetchSpecialConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
  };

  const handleDeleteSpecialCondition = async (): Promise<void> => {
    if (!deleteSpecialConditionId) return;

    setIsLoading({ isLoading: true, message: "Deleting special condition..." });
    const response = await deleteSpecialConditionService(deleteSpecialConditionId);
    if (response.success) {
      toast.success("Special condition deleted successfully");
      await fetchSpecialConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
    setDeleteSpecialConditionId(null);
  };

  const handleToggleSpecialConditionStatus = async (condition: ILoyalitySpecialCondition): Promise<void> => {
    setIsLoading({ isLoading: true, message: "Updating status..." });
    const response = await updateSpecialConditionService(condition.id, {
      title: condition.title,
      subTitle: condition.subTitle,
      language: condition.language,
      isActive: !condition.isActive
    });

    if (response.success) {
      toast.success(`Special condition ${!condition.isActive ? "activated" : "deactivated"}`);
      await fetchSpecialConditions();
    } else {
      toast.error(response.message);
    }
    setIsLoading({ isLoading: false, message: "" });
  };

  const openEditConditionDialog = (condition: ILoyalityCondition): void => {
    setEditingCondition(condition);
    setConditionForm({ text: condition.text, language: condition.language });
    setIsConditionDialogOpen(true);
  };

  const openEditSpecialConditionDialog = (condition: ILoyalitySpecialCondition): void => {
    setEditingSpecialCondition(condition);
    setSpecialConditionForm({
      title: condition.title,
      subTitle: condition.subTitle || "",
      language: condition.language
    });
    setIsSpecialDialogOpen(true);
  };

  const closeConditionDialog = (): void => {
    setIsConditionDialogOpen(false);
    setEditingCondition(null);
    setConditionForm({ text: "", language: "en" });
  };

  const closeSpecialConditionDialog = (): void => {
    setIsSpecialDialogOpen(false);
    setEditingSpecialCondition(null);
    setSpecialConditionForm({ title: "", subTitle: "", language: "en" });
  };

if (isLoading.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={isLoading.message} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <BackButton />

      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conditions">Terms & Conditions</TabsTrigger>
          <TabsTrigger value="special">Special Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Terms & Conditions</h2>
            <Button onClick={() => setIsConditionDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Condition
            </Button>
          </div>

          <div className="grid gap-4">
            {conditions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No conditions added yet. Click "Add Condition" to create one.
                </CardContent>
              </Card>
            ) : (
              conditions.map((condition) => (
                <Card key={condition.id} className={!condition.isActive ? "opacity-50" : ""}>
                  <CardHeader className="p-0 flex flex-row-reverse items-center justify-between space-y-0 pb-2">
                    <div className="flex justify-between items-center gap-2 px-4">
                      <Switch
                        checked={condition.isActive}
                        onCheckedChange={() => handleToggleConditionStatus(condition)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditConditionDialog(condition)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Add Translation"
                        onClick={() => { setTranslationEntityId(condition.id); setTranslationEntityType("condition"); setAddTranslationOpen(true); }}
                      >
                        <Plus className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Check Translations"
                        onClick={() => { setTranslationEntityId(condition.id); setTranslationEntityType("condition"); setCheckTranslationsOpen(true); }}
                      >
                        <Languages className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConditionId(condition.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm px-4">{condition._translations?condition._translations.text:condition.text}</p>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Special Conditions</h2>
            <Button onClick={() => setIsSpecialDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Special Condition
            </Button>
          </div>

          <div className="grid gap-4">
            {specialConditions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No special conditions added yet. Click "Add Special Condition" to create one.
                </CardContent>
              </Card>
            ) : (
              specialConditions.map((condition) => (
                <Card key={condition.id} className={!condition.isActive ? "opacity-50" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  </CardHeader>
                  <CardContent className="flex justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">{condition._translations?condition._translations.title:condition.title}</h3>
                      {condition.subTitle && (
                        <p className="text-sm text-muted-foreground">{condition._translations?condition._translations.subTitle:condition.subTitle}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={condition.isActive}
                        onCheckedChange={() => handleToggleSpecialConditionStatus(condition)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditSpecialConditionDialog(condition)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Add Translation"
                        onClick={() => { setTranslationEntityId(condition.id); setTranslationEntityType("special"); setAddTranslationOpen(true); }}
                      >
                        <Plus className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Check Translations"
                        onClick={() => { setTranslationEntityId(condition.id); setTranslationEntityType("special"); setCheckTranslationsOpen(true); }}
                      >
                        <Languages className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteSpecialConditionId(condition.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isConditionDialogOpen} onOpenChange={setIsConditionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCondition ? "Edit Condition" : "Add New Condition"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition-text">Condition Text</Label>
              <Textarea
                id="condition-text"
                value={conditionForm.text}
                onChange={(e) => setConditionForm({ ...conditionForm, text: e.target.value })}
                placeholder="Enter condition text..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeConditionDialog}>
              Cancel
            </Button>
            <Button onClick={editingCondition ? handleUpdateCondition : handleCreateCondition}>
              {editingCondition ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSpecialDialogOpen} onOpenChange={setIsSpecialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpecialCondition ? "Edit Special Condition" : "Add New Special Condition"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="special-title">Title</Label>
              <Input
                id="special-title"
                value={specialConditionForm.title}
                onChange={(e) => setSpecialConditionForm({ ...specialConditionForm, title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            <div>
              <Label htmlFor="special-subtitle">Subtitle (Optional)</Label>
              <Textarea
                id="special-subtitle"
                value={specialConditionForm.subTitle}
                onChange={(e) => setSpecialConditionForm({ ...specialConditionForm, subTitle: e.target.value })}
                placeholder="Enter subtitle..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSpecialConditionDialog}>
              Cancel
            </Button>
            <Button onClick={editingSpecialCondition ? handleUpdateSpecialCondition : handleCreateSpecialCondition}>
              {editingSpecialCondition ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Condition Confirmation */}
      <AlertDialog open={!!deleteConditionId} onOpenChange={() => setDeleteConditionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this condition. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCondition}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Special Condition Confirmation */}
      <AlertDialog open={!!deleteSpecialConditionId} onOpenChange={() => setDeleteSpecialConditionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this special condition. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSpecialCondition}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Translation Dialogs */}
      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title={translationEntityType === "condition" ? "Add Condition Translation" : "Add Special Condition Translation"}
            fields={
              translationEntityType === "condition"
                ? [{ key: "text", label: "Condition Text", placeholder: "Enter translated text..." }]
                : [
                    { key: "title", label: "Title", placeholder: "Enter translated title..." },
                    { key: "subTitle", label: "Subtitle", placeholder: "Enter translated subtitle..." }
                  ]
            }
            onSave={async (id, locale, data) => {
              if (translationEntityType === "condition") {
                return await upsertLoyaltyConditionsTranslationService(id, { [locale]: data });
              }
              return await upsertLoyaltySpecialConditionTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title={translationEntityType === "condition" ? "Condition Translations" : "Special Condition Translations"}
            displayFields={
              translationEntityType === "condition"
                ? [{ key: "text", label: "Text" }]
                : [
                    { key: "title", label: "Title" },
                    { key: "subTitle", label: "Subtitle" }
                  ]
            }
            onFetch={translationEntityType === "condition" ? getAllLoyaltyConditionsTranslationsService : getAllLoyaltySpecialConditionTranslationsService}
            onDelete={translationEntityType === "condition" ? deleteLoyaltyConditionsTranslationLocaleService : deleteLoyaltySpecialConditionTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title={translationEntityType === "condition" ? "Edit Condition Translation" : "Edit Special Condition Translation"}
            fields={
              translationEntityType === "condition"
                ? [{ key: "text", label: "Condition Text", placeholder: "Enter translated text..." }]
                : [
                    { key: "title", label: "Title", placeholder: "Enter translated title..." },
                    { key: "subTitle", label: "Subtitle", placeholder: "Enter translated subtitle..." }
                  ]
            }
            onSave={async (id, locale, data) => {
              if (translationEntityType === "condition") {
                return await upsertLoyaltyConditionsTranslationService(id, { [locale]: data });
              }
              return await upsertLoyaltySpecialConditionTranslationService(id, { [locale]: data });
            }}
          />
        </>
      )}
    </div>
  );
}
