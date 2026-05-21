import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MoreVertical, Languages } from "lucide-react";
import toast from "react-hot-toast";
import type { ILoyaltyGuestField } from "../types";
import { createLoyaltyGuestFieldsService, deleteLoyaltyGuestFieldService } from "../services/management.services";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertMasterLoyaltyRegistrationFieldTranslationService,
  getAllMasterLoyaltyRegistrationFieldTranslationsService,
  deleteMasterLoyaltyRegistrationFieldTranslationLocaleService,
} from "../services/multilanguage.services";

interface LoyaltyFieldsTabProps {
  loyaltyGuestFields: ILoyaltyGuestField[];
  setLoyaltyGuestFields: React.Dispatch<React.SetStateAction<ILoyaltyGuestField[]>>;
}

export default function LoyaltyFieldsTab({ loyaltyGuestFields, setLoyaltyGuestFields }: LoyaltyFieldsTabProps) {
  const [isLoyaltyFieldDialogOpen, setIsLoyaltyFieldDialogOpen] = useState<boolean>(false);
  const [loyaltyFieldInput, setLoyaltyFieldInput] = useState("");
  const [loyaltyFieldsList, setLoyaltyFieldsList] = useState<string[]>([]);

  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});

  const handleAddLoyaltyFieldToList = () => {
    if (!loyaltyFieldInput.trim()) return;
    if (loyaltyFieldsList.includes(loyaltyFieldInput.trim())) {
      toast.error("Field already in list");
      return;
    }
    setLoyaltyFieldsList([...loyaltyFieldsList, loyaltyFieldInput.trim()]);
    setLoyaltyFieldInput("");
  };

  const handleCreateLoyaltyFields = async () => {
    const response = await createLoyaltyGuestFieldsService(loyaltyFieldsList);
    if (response.success) {
      toast.success("Loyalty fields created successfully");
      setLoyaltyGuestFields([...loyaltyGuestFields, ...response.data]);
      setLoyaltyFieldsList([]);
      setIsLoyaltyFieldDialogOpen(false);
    } else {
      toast.error(response.error || "Failed to create loyalty fields");
    }
  };

  const handleDeleteLoyaltyField = async (id: string) => {
    const response = await deleteLoyaltyGuestFieldService(id);
    if (response.success) {
      toast.success("Loyalty field deleted successfully");
      setLoyaltyGuestFields(loyaltyGuestFields.filter((field) => field.id !== id));
    } else {
      toast.error(response.error || "Failed to delete loyalty field");
    }
  };

  const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
  const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Loyalty Guest Registration Fields</CardTitle>
            <CardDescription>Manage custom fields for loyalty program registration</CardDescription>
          </div>
          <Dialog open={isLoyaltyFieldDialogOpen} onOpenChange={setIsLoyaltyFieldDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Fields
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Loyalty Registration Fields</DialogTitle>
                <DialogDescription>Add new custom fields for guest registration</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={loyaltyFieldInput}
                    onChange={(e) => setLoyaltyFieldInput(e.target.value)}
                    placeholder="e.g., Phone Number, Date of Birth"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddLoyaltyFieldToList(); }
                    }}
                  />
                  <Button onClick={handleAddLoyaltyFieldToList}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {loyaltyFieldsList.map((field, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {field}
                      <button onClick={() => setLoyaltyFieldsList(loyaltyFieldsList.filter((_, i) => i !== index))} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsLoyaltyFieldDialogOpen(false); setLoyaltyFieldsList([]); }}>Cancel</Button>
                <Button onClick={handleCreateLoyaltyFields}>Create All</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {loyaltyGuestFields.map((field) => (
            <Badge key={field.id} variant="outline" className="text-sm py-2 px-3 flex items-center gap-2">
             {field._translations?.fieldName ?? field.fieldName}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-blue-600 ml-1">
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openAddTranslation(field.id)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Translation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openCheckTranslations(field.id)}>
                    <Languages className="h-4 w-4 mr-2" /> Check Translations
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLoyaltyField(field.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Badge>
          ))}
          {loyaltyGuestFields.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              No loyalty fields found. Create your first field to get started.
            </div>
          )}
        </div>
      </CardContent>

      {translationEntityId && (
        <>
          <AddTranslationDialog
            open={addTranslationOpen}
            onOpenChange={setAddTranslationOpen}
            entityId={translationEntityId}
            title="Add Loyalty Field Translation"
            fields={[
              { key: "fieldName", label: "Field Name", placeholder: "e.g., Número de teléfono" },
            ]}
            onSave={async (id, locale, data) => {
              return await upsertMasterLoyaltyRegistrationFieldTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title="Loyalty Field Translations"
            displayFields={[{ key: "fieldName", label: "Field Name" }]}
            onFetch={getAllMasterLoyaltyRegistrationFieldTranslationsService}
            onDelete={deleteMasterLoyaltyRegistrationFieldTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title="Edit Loyalty Field Translation"
            fields={[{ key: "fieldName", label: "Field Name", placeholder: "e.g., Número de teléfono" }]}
            onSave={async (id, locale, data) => upsertMasterLoyaltyRegistrationFieldTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
