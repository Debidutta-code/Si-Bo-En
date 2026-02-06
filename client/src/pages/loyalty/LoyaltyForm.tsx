import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAllFieldService, getFieldsService, updateManyFieldsService, addFieldsService, getLoyalityByCreationService } from "./services";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {  Save, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import Loader from "@/components/Loader/Loader";

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
}

interface IMasterField {
  id: string;
  name: string;
  apiCode: string;
  fieldType?: string;
}

export default function LoyaltyForm() {
  const { creationId } = useParams();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading Registration Form Fields..."
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
    setLoader({ isLoading: true, message: "Loading Registration Form Fields..." });
    try {
      if (!creationId) {
        toast.error("Creation ID is missing");
        return;
      }
      
      const creationLoyaltyResponse = await getLoyalityByCreationService(creationId);
      
      if (!creationLoyaltyResponse.success || !creationLoyaltyResponse.data?.id) {
        toast.error("Loyalty program not found for this creation");
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
          fieldType: field.fieldType || field.type
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
            masterRegistrationFieldId: field.masterRegistrationFieldId || field.fieldName
          }));
          setConfiguredFields(configured);
        } else {
          setConfiguredFields([]);
        }
      }
    } catch (error) {
      toast.error("Failed to load fields");
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
      toast.error("Loyalty Program ID is required");
      return;
    }

    if (selectedFields.size === 0) {
      toast.error("Please select at least one field");
      return;
    }

    setLoader({ isLoading: true, message: "Adding fields..." });
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
        toast.success(`${fieldsToAdd.length} field(s) added successfully`);
        setSelectedFields(new Set());
        setIsAddDialogOpen(false);
        await fetchFields();
      } else {
        toast.error(response.message || "Failed to add fields");
      }
    } catch (error) {
      toast.error("An error occurred while adding fields");
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
      toast.error("Loyalty Program ID is required");
      return;
    }

    setLoader({ isLoading: true, message: "Saving field configuration..." });
    try {
      const fieldsToUpdate = configuredFields.map((field) => ({
        fieldName: field.fieldName,
        visibleInRegistration: field.visibleInRegistration,
        visibleInCustomerForm: field.visibleInCustomerForm,
        required: field.required
      }));

      const response = await updateManyFieldsService(loyaltyProgramId, fieldsToUpdate);

      if (response.success) {
        toast.success("Registration form updated successfully");
        await fetchFields();
      } else {
        toast.error(response.message || "Failed to update form");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
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
    <div className="container mx-auto p-4 md:p-6 lg:p-8">

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Registration Form</CardTitle>
            <CardDescription>
              Configure which fields appear in the loyalty program registration and customer forms
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Fields
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Fields to Registration Form</DialogTitle>
                  <DialogDescription>
                    Select fields from the master list to add to your loyalty program registration form
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {getAvailableFieldsToAdd().length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      All available fields have been added to the registration form
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
                            <div className="font-medium">{field.name}</div>
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
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddFields}
                    disabled={selectedFields.size === 0}
                  >
                    Add {selectedFields.size > 0 && `(${selectedFields.size})`} Field{selectedFields.size !== 1 ? 's' : ''}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-3 pr-4 font-medium text-sm">Field</th>
                  <th className="pb-3 px-4 font-medium text-sm text-center">Visible in registration form</th>
                  <th className="pb-3 px-4 font-medium text-sm text-center">Visible in customer form</th>
                  <th className="pb-3 px-4 font-medium text-sm text-center">Required</th>
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
                    
                    <td className="py-4 pr-4 font-medium">{field.fieldName}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={field.visibleInRegistration}
                          onCheckedChange={() => handleCheckboxChange(index, 'visibleInRegistration')}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={field.visibleInCustomerForm}
                          onCheckedChange={() => handleCheckboxChange(index, 'visibleInCustomerForm')}
                        />
                      </div>
                    </td>
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
              No fields available. Please configure master registration fields first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
