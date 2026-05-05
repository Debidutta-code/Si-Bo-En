import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Building2,
  Trash2,
  PenTool,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  createPropertyLoyalityConfigService,
  deletePropertyLoyalityConfigService,
  updatePropertyLoyalityConfigService,
  getPropertiesByLoyaltyProgramService,
} from "../services/property-loyality.service";
import type { IPropertyLoyaltyConfig } from "../interfaces/property-loyality.types";
import ImageUploadModal from "@/components/property/ImageUploadModal";

interface Property {
  id: string;
  propertyCode: string;
  propertyName: string;
}

interface AddPropertyToLoyaltyProps {
  loyaltyProgramId: string;
  availableProperties: Property[];
}

export default function AddPropertyToLoyalty({
  loyaltyProgramId,
  availableProperties,
  }: AddPropertyToLoyaltyProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedProperties, setAssignedProperties] = useState<
    IPropertyLoyaltyConfig[]
  >([]);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] =
    useState<IPropertyLoyaltyConfig | null>(null);
  const [isUpdateImageModalOpen, setIsUpdateImageModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    loyalityConfigLogo: string | null;
  }>({
    id: "",
    loyalityConfigLogo: null,
  });
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (loyaltyProgramId) {
      fetchAssignedProperties();
    }
  }, [loyaltyProgramId]);

  const fetchAssignedProperties = async (): Promise<void> => {
    try {
      const response =
        await getPropertiesByLoyaltyProgramService(loyaltyProgramId);
      if (response.success && response.data) {
        setAssignedProperties(response.data);
      }
    } catch (error) {
      console.error("Error fetching assigned properties:", error);
    }
  };

  const handleAddProperty = async (): Promise<void> => {
    if (!selectedProperty.id) {
      toast.error("Please select a property");
      return;
    }
    const property = availableProperties.find(
      (p) => p.id === selectedProperty.id,
    );
    if (!property) {
      toast.error("Property not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createPropertyLoyalityConfigService({
        creationLoyaltyConfigId: loyaltyProgramId,
        propertyId: selectedProperty.id,
        propertyCode: property.propertyCode,
        propertyName: property.propertyName,
        loyalityConfigLogo: selectedProperty.loyalityConfigLogo,
      });

      if (response.success) {
        toast.success("Property added to loyalty program successfully");
        setIsDialogOpen(false);
        setSelectedProperty({
          id: "",
          loyalityConfigLogo: "",
        });
        await fetchAssignedProperties();
      } else {
        toast.error(response.message || "Failed to add property");
      }
    } catch (error) {
      toast.error("An error occurred while adding property");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProperty = async (propertyId: string): Promise<void> => {
    if (!propertyId) return;

    setIsLoading(true);
    try {
      const response = await deletePropertyLoyalityConfigService(propertyId);
      if (response.success) {
        toast.success("Property removed from loyalty program");
        await fetchAssignedProperties();
      } else {
        toast.error(response.message || "Failed to remove property");
      }
    } catch (error) {
      toast.error("An error occurred while removing property");
    } finally {
      setIsLoading(false);
      setDeletePropertyId(null);
    }
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;
    setIsLoading(true);
    try {
      const response = await updatePropertyLoyalityConfigService(
        editingProperty.propertyId,
        editingProperty.isActive,
        editingProperty.loyalityConfigLogo,
      );

      if (response.success) {
        toast.success("Property updated successfully");
        setIsUpdateDialogOpen(false);
        setEditingProperty(null);
        await fetchAssignedProperties();
      } else {
        toast.error(response.message || "Failed to update property");
      }
    } catch (error) {
      toast.error("An error occurred while updating property");
    } finally {
      setIsLoading(false);
    }
  };

  const unassignedProperties = availableProperties.filter(
    (prop) =>
      !assignedProperties.some((assigned) => assigned.propertyId === prop.id),
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Properties in Loyalty Program
            </CardTitle>
            <CardDescription className="mt-1">
              Manage which properties are part of this loyalty program
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {assignedProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No properties assigned yet</p>
            <p className="text-sm mt-1">
              Click "Add Property" to assign properties to this loyalty program
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedProperties.map((property) => (
              <Card
                key={property.id}
                className={`overflow-hidden flex flex-col transition-opacity ${!property.isActive
                    ? "opacity-60 grayscale-[50%]"
                    : "border-border"
                  }`}
              >
                {/* Top Section: Info & Actions */}
                <div className="flex items-start justify-between p-4 pb-2">
                  <div className="flex flex-col gap-1 pr-4">
                    <h3 className="text-base font-semibold leading-none tracking-tight">
                      {property.propertyName}
                    </h3>
                    {/* {property.creationLoyaltyConfig.discountPercentage != null && (
                      <span className="text-sm font-medium text-muted-foreground">
                        {property.creationLoyaltyConfig.discountPercentage}% Discount
                      </span>
                    )} */}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isLoading}
                        className="h-8 w-8 -mr-2 -mt-1 shrink-0 text-muted-foreground"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingProperty(property);
                          setIsUpdateDialogOpen(true);
                        }}
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        onClick={() => setDeletePropertyId(property.propertyId)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bottom Section: Totally for Image */}
                {property.loyalityConfigLogo ? (
                  <div className="mt-2 w-full h-32 bg-secondary/20 p-4 flex items-center justify-center border-t">
                    <img
                      src={property.loyalityConfigLogo}
                      alt={`${property.propertyName} Logo`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  /* Optional empty space if you want all cards to be the same height when there is no image */
                  <div className="mt-2 w-full h-4" />
                )}
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Property to Loyalty Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="property-select">Select Property</Label>
              <Select
                value={selectedProperty.id}
                onValueChange={(value) =>
                  setSelectedProperty((prev) => ({ ...prev, id: value }))
                }
              >
                <SelectTrigger id="property-select">
                  <SelectValue placeholder="Choose a property" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedProperties.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      All properties are already assigned
                    </div>
                  ) : (
                    unassignedProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.propertyName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Loyalty Image</Label>
              <div className="mt-2 flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center gap-3">
                  {selectedProperty.loyalityConfigLogo ? (
                    <div className="relative h-12 w-12 rounded overflow-hidden">
                      <img
                        src={selectedProperty.loyalityConfigLogo}
                        alt="Loyalty Logo"
                        className="object-cover h-full w-full"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        None
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium">
                    {selectedProperty.loyalityConfigLogo
                      ? "Logo uploaded"
                      : "Upload a logo"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImageModalOpen(true)}
                >
                  {selectedProperty.loyalityConfigLogo ? "Change" : "Upload"}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProperty}
              disabled={isLoading || !selectedProperty.id}
            >
              {isLoading ? "Adding..." : "Add Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Property Loyalty</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingProperty ? (
              <>
                <div>
                  <div className="flex items-center justify-between border rounded-md p-3">
                    <Label
                      htmlFor={`edit-status-${editingProperty.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {editingProperty.isActive ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`edit-status-${editingProperty.id}`}
                      checked={editingProperty.isActive}
                      onCheckedChange={(checked) =>
                        setEditingProperty((prev) =>
                          prev ? { ...prev, isActive: checked } : null,
                        )
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label>Loyalty Image</Label>
                  <div className="mt-2 flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-3">
                      {editingProperty.loyalityConfigLogo ? (
                        <div className="relative h-12 w-20 rounded overflow-hidden flex items-center justify-start border">
                          <img
                            src={editingProperty.loyalityConfigLogo}
                            alt="Loyalty Logo"
                            className="object-contain h-full max-w-full"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            None
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {editingProperty.loyalityConfigLogo
                          ? "Logo uploaded"
                          : "Upload a logo"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUpdateImageModalOpen(true)}
                    >
                      {editingProperty.loyalityConfigLogo ? "Change" : "Upload"}
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProperty}
              disabled={isLoading || !editingProperty}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ImageUploadModal
        isOpen={isUpdateImageModalOpen}
        onClose={() => setIsUpdateImageModalOpen(false)}
        onUploadSuccess={(urls) => {
          if (urls.length > 0) {
            setEditingProperty((prev) =>
              prev ? { ...prev, loyalityConfigLogo: urls[0] } : null,
            );
          }
        }}
      />
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onUploadSuccess={(urls) => {
          if (urls.length > 0) {
            setSelectedProperty((prev) => ({
              ...prev,
              loyalityConfigLogo: urls[0],
            }));
          }
        }}
      />

      {/* Delete Property Confirmation */}
      <AlertDialog
        open={!!deletePropertyId}
        onOpenChange={() => setDeletePropertyId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this property from the loyalty
              program? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletePropertyId && handleRemoveProperty(deletePropertyId)
              }
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
