import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Plus, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  createPropertyLoyalityConfigService,
  deletePropertyLoyalityConfigService,
  updatePropertyLoyalityConfigService,
  getPropertiesByLoyaltyProgramService
} from "../services/property-loyality.service";
import type { IPropertyLoyaltyConfig } from "../interfaces/property-loyality.interface";

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
  availableProperties 
}: AddPropertyToLoyaltyProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assignedProperties, setAssignedProperties] = useState<IPropertyLoyaltyConfig[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);

  useEffect(() => {
    if (loyaltyProgramId) {
      fetchAssignedProperties();
    }
  }, [loyaltyProgramId]);

  const fetchAssignedProperties = async (): Promise<void> => {
    try {
      const response = await getPropertiesByLoyaltyProgramService(loyaltyProgramId);
      if (response.success && response.data) {
        setAssignedProperties(response.data);
      }
    } catch (error) {
      console.error("Error fetching assigned properties:", error);
    }
  };

  const handleAddProperty = async (): Promise<void> => {
    if (!selectedPropertyId) {
      toast.error("Please select a property");
      return;
    }

    const selectedProperty = availableProperties.find(p => p.id === selectedPropertyId);
    if (!selectedProperty) {
      toast.error("Property not found");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createPropertyLoyalityConfigService({
        creationLoyaltyConfigId: loyaltyProgramId,
        propertyId: selectedProperty.id,
        propertyCode: selectedProperty.propertyCode,
        propertyName: selectedProperty.propertyName
      });

      if (response.success) {
        toast.success("Property added to loyalty program successfully");
        setIsDialogOpen(false);
        setSelectedPropertyId("");
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

  const handleToggleStatus = async (property: IPropertyLoyaltyConfig): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await updatePropertyLoyalityConfigService(property.propertyId, !property.isActive);
      if (response.success) {
        toast.success(`Property ${!property.isActive ? "activated" : "deactivated"}`);
        await fetchAssignedProperties();
      } else {
        toast.error(response.message || "Failed to update property status");
      }
    } catch (error) {
      toast.error("An error occurred while updating property status");
    } finally {
      setIsLoading(false);
    }
  };

  const unassignedProperties = availableProperties.filter(
    prop => !assignedProperties.some(assigned => assigned.propertyId === prop.id)
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
          <Button onClick={() => setIsDialogOpen(true)} >
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
            <p className="text-sm mt-1">Click "Add Property" to assign properties to this loyalty program</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedProperties.map((property) => (
              <Card key={property.id} className={!property.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{property.propertyName}</CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {property.propertyCode}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletePropertyId(property.propertyId)}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`status-${property.id}`} className="text-sm">
                      {property.isActive ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`status-${property.id}`}
                      checked={property.isActive}
                      onCheckedChange={() => handleToggleStatus(property)}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
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
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
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
                        {property.propertyName} ({property.propertyCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProperty} disabled={isLoading || !selectedPropertyId}>
              {isLoading ? "Adding..." : "Add Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Property Confirmation */}
      <AlertDialog open={!!deletePropertyId} onOpenChange={() => setDeletePropertyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this property from the loyalty program? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletePropertyId && handleRemoveProperty(deletePropertyId)}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
