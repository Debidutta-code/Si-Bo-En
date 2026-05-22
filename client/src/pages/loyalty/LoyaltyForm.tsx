import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllFieldService, getFieldsService, updateManyFieldsService, addFieldsService, getLoyalityByCreationService } from "./services";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "@/components/Loader/Loader";
import BackButton from "@/components/shared/BackButton";
import { useTranslation } from "react-i18next";

interface ILoader {
  isLoading: boolean;
  message: string;
}

interface IFieldConfig {
  fieldName: string;
  apiCode: string;
  visibleInRegistration: boolean;
  visibleInCustomerForm: boolean;
  required: boolean;
  masterRegistrationFieldId: string;
  _translations?: { fieldName: string };
}

interface IMasterField {
  id: string;
  name: string;
  apiCode: string;
  fieldType?: string;
  _translations?: { fieldName: string };
}


export default function LoyaltyForm() {
  const { t } = useTranslation();

  const { creationId } = useParams();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: t('Loyalty.loadingFields')
  });

  const [loyaltyProgramId, setLoyaltyProgramId] = useState<string>("");
  const [availableMasterFields, setAvailableMasterFields] = useState<IMasterField[]>([]);
  const [configuredFields, setConfiguredFields] = useState<IFieldConfig[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFields();
  }, [creationId]);

  const fetchFields = async (): Promise<void> => {
    setLoader({ isLoading: true, message: t('Loyalty.loadingFields') });
    try {
      if (!creationId) {
        toast.error(t('Loyalty.creationIdMissing'));
        return;
      }

      const creationLoyaltyResponse = await getLoyalityByCreationService(creationId);

      if (!creationLoyaltyResponse.success || !creationLoyaltyResponse.data?.id) {
        toast.error(t('Loyalty.loyaltyNotFound'));
        return;
      }

      const actualLoyaltyProgramId = creationLoyaltyResponse.data.id;
      setLoyaltyProgramId(actualLoyaltyProgramId);

      const allFieldsResponse = await getAllFieldService();

      if (allFieldsResponse.success && allFieldsResponse.data) {
        const masterFields: IMasterField[] = allFieldsResponse.data.map((field: any) => ({
          id: field.id || field._id,
          name: field.fieldName || field.name,
          apiCode: field.fieldName || field.apiCode || field.name,
          fieldType: field.fieldType || field.type,
_translations: field._translations
        }));
        setAvailableMasterFields(masterFields);

        const configuredResponse = await getFieldsService(actualLoyaltyProgramId);

        if (configuredResponse.success && configuredResponse.data && Array.isArray(configuredResponse.data)) {
          const configured: IFieldConfig[] = configuredResponse.data.map((field: any) => ({
            fieldName: field.fieldName,
            apiCode: field.masterRegistrationFieldId || field.fieldName,
            visibleInRegistration: field.visibleInRegistration ?? true,
            visibleInCustomerForm: field.visibleInCustomerForm ?? true,
            required: field.required ?? false,
            masterRegistrationFieldId: field.masterRegistrationFieldId || field.fieldName,
_translations: field._translations
          }));
          setConfiguredFields(configured);
        } else {
          setConfiguredFields([]);
        }
      }
    } catch (error) {
      toast.error(t('Loyalty.failedToLoadFields'));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const getAvailableFieldsToAdd = (): IMasterField[] => {
    const configuredApiCodes = new Set(configuredFields.map(f => f.masterRegistrationFieldId));
    return availableMasterFields.filter(field => !configuredApiCodes.has(field.id));
  };

  const handleToggleFieldSelection = (fieldId: string) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const handleAddFields = async (): Promise<void> => {
    if (!loyaltyProgramId) {
      toast.error(t('Loyalty.loyaltyIdRequired'));
      return;
    }

    if (selectedFields.size === 0) {
      toast.error(t('Loyalty.selectAtLeastOne'));
      return;
    }

    setLoader({ isLoading: true, message: t('Loyalty.addingFields') });
    try {
      const fieldsToAdd = Array.from(selectedFields).map((fieldId) => {
        const masterField = availableMasterFields.find(f => f.id === fieldId);
        return {
          loyaltyProgramId: loyaltyProgramId,
          masterRegistrationFieldId: fieldId,
          fieldName: masterField?.apiCode || "",
          visibleInRegistration: true,
          visibleInCustomerForm: true,
          required: false
        };
      });

      const response = await addFieldsService(fieldsToAdd);

      if (response.success) {
        toast.success(t('Loyalty.fieldsAdded', { count: fieldsToAdd.length }));
        setSelectedFields(new Set());
        setIsAddDialogOpen(false);
        await fetchFields();
      } else {
        toast.error(response.message || t('Loyalty.failedToAddFields'));
      }
    } catch (error) {
      toast.error(t('Loyalty.errorAddingFields'));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleCheckboxChange = (index: number, field: keyof IFieldConfig): void => {
    setConfiguredFields(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: !updated[index][field]
      };
      return updated;
    });
  };

  const handleDragStart = (index: number): void => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setConfiguredFields(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(index, 0, removed);
      return updated;
    });

    setDraggedIndex(index);
  };

  const handleDragEnd = (): void => {
    setDraggedIndex(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!loyaltyProgramId) {
      toast.error(t('Loyalty.loyaltyIdRequired'));
      return;
    }

    setLoader({ isLoading: true, message: t('Loyalty.savingConfiguration') });
    try {
      const fieldsToUpdate = configuredFields.map((field) => ({
        fieldName: field.fieldName,
        visibleInRegistration: field.visibleInRegistration,
        visibleInCustomerForm: field.visibleInCustomerForm,
        required: field.required
      }));

      const response = await updateManyFieldsService(loyaltyProgramId, fieldsToUpdate);

      if (response.success) {
        toast.success(t('Loyalty.formUpdated'));
        await fetchFields();
      } else {
        toast.error(response.message || t('Loyalty.failedToUpdateForm'));
      }
    } catch (error) {
      toast.error(t('Loyalty.errorSaving'));
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-2 ">
      <BackButton />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{t('Loyalty.registerFormTitle')}</CardTitle>
            <CardDescription>
              {t('Loyalty.registerFormDescription')}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('Loyalty.addFields')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('Loyalty.addFieldsToForm')}</DialogTitle>
                  <DialogDescription>
                    {t('Loyalty.selectFieldsDescription')}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {getAvailableFieldsToAdd().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('Loyalty.allFieldsAdded')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getAvailableFieldsToAdd().map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleToggleFieldSelection(field.id)}
                        >
                          <Checkbox
                            checked={selectedFields.has(field.id)}
                            onCheckedChange={() => handleToggleFieldSelection(field.id)}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{field._translations?.fieldName ?? field.name}</div>
                            <div className="text-sm text-muted-foreground">{field.apiCode}</div>
                          </div>
                          {field.fieldType && (
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              {field.fieldType}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsAddDialogOpen(false);
                    setSelectedFields(new Set());
                  }}>
                    {t('Loyalty.cancel')}
                  </Button>
                  <Button
                    onClick={handleAddFields}
                    disabled={selectedFields.size === 0}
                  >
                    {t('Loyalty.addFields')} {selectedFields.size > 0 && `(${selectedFields.size})`} {selectedFields.size !== 1 ? '' : ''}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {t('Loyalty.saveChanges')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 pr-4 font-medium text-sm">{t('Loyalty.field')}</th>
                  <th className="pb-3 px-4 font-medium text-sm text-center">{t('Loyalty.visibleInRegistration')}</th>
                  <th className="pb-3 px-4 font-medium text-sm text-center">{t('Loyalty.required')}</th>
                </tr>
              </thead>
              <tbody>
                {configuredFields.map((field, index) => (
                  <tr
                    key={`${field.apiCode}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className="border-b hover:bg-muted/50 cursor-move transition-colors"
                  >
                    
                    <td className="py-4 pr-4 font-medium">{field._translations?.fieldName ?? field.fieldName}
</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={field.visibleInRegistration}
                          onCheckedChange={() => handleCheckboxChange(index, 'visibleInRegistration')}
                        />
                      </div>
                    </td>
                    {/* <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={field.visibleInCustomerForm}
                          onCheckedChange={() => handleCheckboxChange(index, 'visibleInCustomerForm')}
                        />
                      </div>
                    </td> */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={field.required}
                          onCheckedChange={() => handleCheckboxChange(index, 'required')}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {configuredFields.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {t('Loyalty.noFieldsConfigured')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
