import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { IAmenity } from "../types";
import { createPropertyAmenitiesService, deletePropertyAmenitiesService } from "../services/management.services";

interface PropertyAmenitiesTabProps {
  propertyAmenities: IAmenity[];
  setPropertyAmenities: React.Dispatch<React.SetStateAction<IAmenity[]>>;
}

export default function PropertyAmenitiesTab({ propertyAmenities, setPropertyAmenities }: PropertyAmenitiesTabProps) {
  const [isPropertyAmenityDialogOpen, setIsPropertyAmenityDialogOpen] = useState<boolean>(false);
  const [propertyAmenityInput, setPropertyAmenityInput] = useState("");
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);

  const handleAddPropertyAmenityToList = () => {
    if (!propertyAmenityInput.trim()) return;
    if (amenitiesList.includes(propertyAmenityInput.trim())) {
      toast.error("Amenity already in list");
      return;
    }
    setAmenitiesList([...amenitiesList, propertyAmenityInput.trim()]);
    setPropertyAmenityInput("");
  };

  const handleCreatePropertyAmenities = async () => {
    const response = await createPropertyAmenitiesService(amenitiesList);
    if (response.success) {
      toast.success("Property amenities created successfully");
      setPropertyAmenities([ ...response.data]);
      setAmenitiesList([]);
      setIsPropertyAmenityDialogOpen(false);
    } else {
      toast.error(response.error || "Failed to create amenities");
    }
  };

  const handleDeletePropertyAmenity = async (amenityName: string) => {
    const response = await deletePropertyAmenitiesService([amenityName]);
    if (response.success) {
      toast.success("Property amenity deleted successfully");
      setPropertyAmenities(propertyAmenities.filter((amenity) => amenity.amenityName !== amenityName));
    } else {
      toast.error(response.error || "Failed to delete amenity");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Property Amenities</CardTitle>
            <CardDescription>Manage property amenities</CardDescription>
          </div>
          <Dialog
            open={isPropertyAmenityDialogOpen}
            onOpenChange={(open) => {
              setIsPropertyAmenityDialogOpen(open);
              if (!open) setAmenitiesList([]);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Amenities
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Property Amenities</DialogTitle>
                <DialogDescription>Add new property amenities</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={propertyAmenityInput}
                    onChange={(e) => setPropertyAmenityInput(e.target.value)}
                    placeholder="e.g., Swimming Pool"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPropertyAmenityToList();
                      }
                    }}
                  />
                  <Button onClick={handleAddPropertyAmenityToList}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                      <button
                        onClick={() => setAmenitiesList(amenitiesList.filter((_, i) => i !== index))}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPropertyAmenityDialogOpen(false);
                    setAmenitiesList([]);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreatePropertyAmenities}>Create All</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {propertyAmenities.map((amenity) => (
            <Badge key={amenity.id} variant="outline" className="text-sm py-2 px-3">
              {amenity.amenityName}
              <button
                onClick={() => handleDeletePropertyAmenity(amenity.amenityName)}
                className="ml-2 hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {propertyAmenities.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              No property amenities found. Create your first amenity to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
