import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MoreVertical, Languages } from "lucide-react";
import toast from "react-hot-toast";
import type { IAmenity } from "../types";
import { createRoomAmenitiesService, deleteRoomAmenitiesService } from "../services/management.services";
import { AddTranslationDialog, CheckTranslationsDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertMasterAmenityTranslationService,
  getAllMasterAmenityTranslationsService,
  deleteMasterAmenityTranslationLocaleService,
} from "../services/multilanguage.services";

interface RoomAmenitiesTabProps {
  roomAmenities: IAmenity[];
  setRoomAmenities: React.Dispatch<React.SetStateAction<IAmenity[]>>;
}

export default function RoomAmenitiesTab({ roomAmenities, setRoomAmenities }: RoomAmenitiesTabProps) {
  const [isRoomAmenityDialogOpen, setIsRoomAmenityDialogOpen] = useState<boolean>(false);
  const [roomAmenityInput, setRoomAmenityInput] = useState("");
  const [amenitiesList, setAmenitiesList] = useState<string[]>([]);

  const [translationEntityId, setTranslationEntityId] = useState<string | null>(null);
  const [addTranslationOpen, setAddTranslationOpen] = useState(false);
  const [checkTranslationsOpen, setCheckTranslationsOpen] = useState(false);

  const handleAddRoomAmenityToList = () => {
    if (!roomAmenityInput.trim()) return;
    if (amenitiesList.includes(roomAmenityInput.trim())) {
      toast.error("Amenity already in list");
      return;
    }
    setAmenitiesList([...amenitiesList, roomAmenityInput.trim()]);
    setRoomAmenityInput("");
  };

  const handleCreateRoomAmenities = async () => {
    const response = await createRoomAmenitiesService(amenitiesList);
    if (response.success) {
      toast.success("Room amenities created successfully");
      setRoomAmenities([...response.data]);
      setAmenitiesList([]);
      setIsRoomAmenityDialogOpen(false);
    } else {
      toast.error(response.error || "Failed to create amenities");
    }
  };

  const handleDeleteRoomAmenity = async (amenityName: string) => {
    const response = await deleteRoomAmenitiesService([amenityName]);
    if (response.success) {
      toast.success("Room amenity deleted successfully");
      setRoomAmenities(roomAmenities.filter((amenity) => amenity.amenityName !== amenityName));
    } else {
      toast.error(response.error || "Failed to delete amenity");
    }
  };

  const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
  const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Room Amenities</CardTitle>
            <CardDescription>Manage room amenities</CardDescription>
          </div>
          <Dialog
            open={isRoomAmenityDialogOpen}
            onOpenChange={(open) => {
              setIsRoomAmenityDialogOpen(open);
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
                <DialogTitle>Create Room Amenities</DialogTitle>
                <DialogDescription>Add new room amenities</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={roomAmenityInput}
                    onChange={(e) => setRoomAmenityInput(e.target.value)}
                    placeholder="e.g., Air Conditioning"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddRoomAmenityToList(); }
                    }}
                  />
                  <Button onClick={handleAddRoomAmenityToList}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {amenity}
                      <button onClick={() => setAmenitiesList(amenitiesList.filter((_, i) => i !== index))} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsRoomAmenityDialogOpen(false); setAmenitiesList([]); }}>Cancel</Button>
                <Button onClick={handleCreateRoomAmenities}>Create All</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {roomAmenities.map((amenity) => (
            <Badge key={amenity.id} variant="outline" className="text-sm py-2 px-3 flex items-center gap-2">
              {amenity.amenityName}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-blue-600 ml-1">
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openAddTranslation(amenity.id)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Translation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openCheckTranslations(amenity.id)}>
                    <Languages className="h-4 w-4 mr-2" /> Check Translations
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRoomAmenity(amenity.amenityName)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Badge>
          ))}
          {roomAmenities.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              No room amenities found. Create your first amenity to get started.
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
            title="Add Room Amenity Translation"
            fields={[
              { key: "amenityName", label: "Amenity Name", placeholder: "e.g., Aire acondicionado" },
              { key: "description", label: "Description", placeholder: "Describe this amenity" },
            ]}
            onSave={async (id, locale, data) => {
              return await upsertMasterAmenityTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title="Room Amenity Translations"
            displayFields={[
              { key: "amenityName", label: "Name" },
              { key: "description", label: "Description" },
            ]}
            onFetch={getAllMasterAmenityTranslationsService}
            onDelete={deleteMasterAmenityTranslationLocaleService}
          />
        </>
      )}
    </Card>
  );
}
