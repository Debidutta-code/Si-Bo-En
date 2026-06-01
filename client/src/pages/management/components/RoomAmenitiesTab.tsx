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
import { AddTranslationDialog, CheckTranslationsDialog, EditTranslationDialog } from "./multilang/ManagementTranslationDialogs";
import {
  upsertMasterAmenityTranslationService,
  getAllMasterAmenityTranslationsService,
  deleteMasterAmenityTranslationLocaleService,
} from "../services/multilanguage.services";
import { useTranslation } from "react-i18next";

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
  const [editTranslationOpen, setEditTranslationOpen] = useState(false);
  const [editingLocale, setEditingLocale] = useState<string>("");
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  const { t } = useTranslation();
  const handleAddRoomAmenityToList = () => {
    if (!roomAmenityInput.trim()) return;
    if (amenitiesList.includes(roomAmenityInput.trim())) {
      toast.error(t("Management.Toast.amenityAlreadyInList", { ns: "translation" }));
      return;
    }
    setAmenitiesList([...amenitiesList, roomAmenityInput.trim()]);
    setRoomAmenityInput("");
  };

  const handleCreateRoomAmenities = async () => {
    const response = await createRoomAmenitiesService(amenitiesList);
    if (response.success) {
      toast.success(t("Management.Toast.roomAmenitiesCreatedSuccessfully", { ns: "translation" }));
      setRoomAmenities([...response.data]);
      setAmenitiesList([]);
      setIsRoomAmenityDialogOpen(false);
    } else {
      toast.error(response.error || t("Management.Toast.failedToCreateRoomAmenities", { ns: "translation" }));
    }
  };

  const handleDeleteRoomAmenity = async (amenityName: string) => {
    const response = await deleteRoomAmenitiesService([amenityName]);
    if (response.success) {
      toast.success(t("Management.Toast.roomAmenityDeletedSuccessfully", { ns: "translation" }));
      setRoomAmenities(roomAmenities.filter((amenity) => amenity.amenityName !== amenityName));
    } else {
      toast.error(response.error || t("Management.Toast.failedToDeleteRoomAmenity", { ns: "translation" }));
    }
  };

  const openAddTranslation = (id: string) => { setTranslationEntityId(id); setAddTranslationOpen(true); };
  const openCheckTranslations = (id: string) => { setTranslationEntityId(id); setCheckTranslationsOpen(true); };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("Management.roomAmenitiesTitle")}</CardTitle>
            <CardDescription>{t("Management.manageRoomAmenities")}</CardDescription>
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
                {t("Management.addAmenities")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("Management.createRoomAmenities")}</DialogTitle>
                <DialogDescription>{t("Management.addNewRoomAmenities")}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={roomAmenityInput}
                    onChange={(e) => setRoomAmenityInput(e.target.value)}
                    placeholder={t("Management.RoomAmenity.placeholder")}

                    onKeyPress={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleAddRoomAmenityToList(); }
                    }}
                  />
                  <Button onClick={handleAddRoomAmenityToList}>{t("Management.add")}</Button>

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
                <Button variant="outline" onClick={() => { setIsRoomAmenityDialogOpen(false); setAmenitiesList([]); }}>{t("Management.cancel")}</Button>

                <Button onClick={handleCreateRoomAmenities}>{t("Management.create")}</Button>

              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {roomAmenities.map((amenity) => (
            <Badge key={amenity.id} variant="outline" className="text-sm py-2 px-3 flex items-center gap-2">
              {amenity._translations ? amenity._translations.amenityName : amenity.amenityName}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:text-blue-600 ml-1">
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openAddTranslation(amenity.id)}>
                    <Plus className="h-4 w-4 mr-2" /> {t("Common.addTranslation")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openCheckTranslations(amenity.id)}>
                    <Languages className="h-4 w-4 mr-2" /> {t("Common.checkTranslation")}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRoomAmenity(amenity.amenityName)}>
                    <Trash2 className="h-4 w-4 mr-2" /> {t("Common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Badge>
          ))}
          {roomAmenities.length === 0 && (
            <div className="w-full text-center py-12 text-gray-500">
              {t("Management.noRoomAmenitiesFound")}
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
            title={t("Common.addTranslation", { ns: "translation", defaultValue: "Add Room Amenity Translation" })}
            fields={[
              { key: "amenityName", label: t("Management.roomAmenitiesTitle"), placeholder: t("Management.PropertyAmenity.placeholder") },
            ]}
            onSave={async (id, locale, data) => {
              return await upsertMasterAmenityTranslationService(id, { [locale]: data });
            }}
          />
          <CheckTranslationsDialog
            open={checkTranslationsOpen}
            onOpenChange={setCheckTranslationsOpen}
            entityId={translationEntityId}
            title={t("Common.checkTranslation",)}
            displayFields={[
              { key: "amenityName", label: t("Management.roomAmenitiesTitle") },
              { key: "description", label: t("Management.description") },
            ]}
            onFetch={getAllMasterAmenityTranslationsService}
            onDelete={deleteMasterAmenityTranslationLocaleService}
            onEdit={(locale, data) => { setEditingLocale(locale); setEditingData(data); setEditTranslationOpen(true); }}
          />
          <EditTranslationDialog
            open={editTranslationOpen}
            onOpenChange={setEditTranslationOpen}
            entityId={translationEntityId!}
            locale={editingLocale}
            initialData={editingData}
            title={t("Common.editTranslation", { ns: "translation", defaultValue: "Edit Room Amenity Translation" })}
            fields={[
              { key: "amenityName", label: t("Management.roomAmenitiesTitle"), placeholder: t("Management.PropertyAmenity.placeholder") },
            ]}
            onSave={async (id, locale, data) => upsertMasterAmenityTranslationService(id, { [locale]: data })}
          />
        </>
      )}
    </Card>
  );
}
