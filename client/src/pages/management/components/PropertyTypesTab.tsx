import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Trash2, MoreVertical, Languages } from "lucide-react";
import toast from "react-hot-toast";
import type { IPropertyType } from "../types";
import { createPropertyTypeService, deletePropertyTypeService } from "../services/management.services";
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertMasterPropertyTypeTranslationService,
  getAllMasterPropertyTypeTranslationsService,
  deleteMasterPropertyTypeTranslationLocaleService,
} from "../services/multilanguage.services";
import { useTranslation } from "react-i18next";

interface PropertyTypesTabProps {
  propertyTypes: IPropertyType[];
  setPropertyTypes: React.Dispatch<React.SetStateAction<IPropertyType[]>>;
}

export default function PropertyTypesTab({ propertyTypes, setPropertyTypes }: PropertyTypesTabProps) {
    const { t } = useTranslation();

  const [isPropertyTypeDialogOpen, setIsPropertyTypeDialogOpen] = useState<boolean>(false);
  const [propertyTypeForm, setPropertyTypeForm] = useState({ name: "", description: "" });

  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});

  const handleCreatePropertyType = async () => {
    const response = await createPropertyTypeService(propertyTypeForm.name, propertyTypeForm.description);
    if (response.success) {
      toast.success(t('Toast.propertyTypeCreatedSuccessfully'));
      setPropertyTypes([...propertyTypes, response.data]);
      setPropertyTypeForm({ name: "", description: "" });
      setIsPropertyTypeDialogOpen(false);
    } else {
      toast.error(response.error || t('Toast.failedToCreatePropertyType'));
    }
  };

  const handleDeletePropertyType = async (propertyTypeName: string) => {
    const response = await deletePropertyTypeService(propertyTypeName);
    if (response.success) {
      toast.success(t('Toast.propertyTypeDeletedSuccessfully'));
      setPropertyTypes(propertyTypes.filter((type) => type.propertyTypeName !== propertyTypeName));
    } else {
      toast.error(response.error || t('Toast.failedToDeletePropertyType'));
    }
  };

  const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
  const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t('Management.propertyTypesTitle')}</CardTitle>
            <CardDescription>{t('Management.managePropertyTypes')}</CardDescription>
          </div>
          <Dialog open={isPropertyTypeDialogOpen} onOpenChange={setIsPropertyTypeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('Management.addPropertyType')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('Management.createNewPropertyType')}</DialogTitle>
                <DialogDescription>{t('Management.addNewPropertyTypeDescription')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="propertyTypeName">{t('Management.propertyTypeName')}</Label>
                  <Input
                    id="propertyTypeName"
                    value={propertyTypeForm.name}
                    onChange={(e) => setPropertyTypeForm({ ...propertyTypeForm, name: e.target.value })}
                    placeholder="e.g., Hotel"
                  />
                </div>
                <div>
                  <Label htmlFor="propertyTypeDescription">{t('Management.description')}</Label>
                  <Input
                    id="propertyTypeDescription"
                    value={propertyTypeForm.description}
                    onChange={(e) => setPropertyTypeForm({ ...propertyTypeForm, description: e.target.value })}
                    placeholder="Describe this property type"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPropertyTypeDialogOpen(false)}>                  {t('Common.cancel')}
</Button>
                <Button onClick={handleCreatePropertyType}>{t('Common.create')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyTypes.map((type) => (
            <Card key={type.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{type._translations?type._translations.propertyTypeName:type.propertyTypeName}</CardTitle>
                    <CardDescription className="mt-1">{type._translations?type._translations.propertyTypeDescription:type.propertyTypeDescription}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openAddTranslation(type.id)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Translation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openCheckTranslations(type.id)}>
                        <Languages className="h-4 w-4 mr-2" /> Check Translations
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePropertyType(type.propertyTypeName)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
          {propertyTypes.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              {t('Management.noPropertyTypesFound')}
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
            title="Add Property Type Translation"
            fields={[
              { key: "propertyTypeName", label: "Property Type Name", placeholder: "e.g., Hotel" },
              { key: "propertyTypeDescription", label: "Description", placeholder: "Describe this type" },
            ]}
            onSave={async (id, locale, data) => {
              return await upsertMasterPropertyTypeTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title="Property Type Translations"
            displayFields={[
              { key: "propertyTypeName", label: "Name" },
              { key: "propertyTypeDescription", label: "Description" },
            ]}
            onFetch={getAllMasterPropertyTypeTranslationsService}
            onDelete={deleteMasterPropertyTypeTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title="Edit Property Type Translation"
            fields={[
              { key: "propertyTypeName", label: "Property Type Name", placeholder: "e.g., Hotel" },
              { key: "propertyTypeDescription", label: "Description", placeholder: "Describe this type" },
            ]}
            onSave={async (id, locale, data) => upsertMasterPropertyTypeTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
