import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bed, Settings, Users, Camera, Upload, X } from "lucide-react";
import type { IRoomDetails } from "./types/types";
import ImageUploadModal from "../ImageUploadModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Loader from "@/components/Loader/Loader";
import { Switch } from "@/components/ui/switch";
import type { roomUnit, smokingPolicy } from "../create/types/types";
import type { IMasterRoomView } from "@/pages/management/types";
import toast from "react-hot-toast";
import { getAllRoomViews } from "@/pages/management/services/room-view.services";
import { useTranslation } from "react-i18next";
const roomSchema = z.object({
  roomName: z.string().min(3, "Room name is required and must be at least 3 characters."),
  roomType: z.string().min(1, "Please select a room type."),
  totalRoom: z.coerce.number().min(1, "Total rooms must be at least 1."),
  description: z.string().min(1, "Description must be at least 20 characters.").max(5000, "Description cannot exceed 500 characters."),
  maxOccupancy: z.coerce.number().min(1, "Max occupancy must be at least 1."),
  image: z.array(z.string()).min(1, "Please upload at least one room image."),
  floor: z.coerce.number(),
  roomSize: z.coerce.number().default(0),
  roomUnit: z.enum(["sqm", "sqft"]).default("sqft"),
  smokingPolicy: z.enum(["smoking", "non_smoking", "designated_area"]).default("designated_area"),
  maxNumberOfAdults: z.coerce.number().default(0),
  maxNumberOfChildren: z.coerce.number().default(0),
  numberOfBedrooms: z.coerce.number().optional(),// this is being used
  numberOfLivingRoom: z.coerce.number().optional(), //not used
  extraBed: z.coerce.number().optional(),// not used
  available: z.boolean().default(true),
  priority: z.coerce.number().min(0).default(0),
  RoomViews: z.object({
    MasterRoomView: z.object({
      id: z.string().min(1, "Please select a room view."),
      viewName: z.string()
    })
  }),
});

type FormErrors = z.inferFormattedError<typeof roomSchema>;

export default function Rooms({
  roomDetails,
  updateRoomDetails,
  isLoading,
}: {
  roomDetails: IRoomDetails;
  updateRoomDetails: Dispatch<SetStateAction<IRoomDetails>>;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  useEffect(() => {
    fetchRoomViews();
  }, []);
  const [errors, _setErrors] = useState<FormErrors | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomViews, setRoomViews] = useState<IMasterRoomView[]>([]);

  const updateRoom = (updates: IRoomDetails) => {
    updateRoomDetails((prev) => ({ ...prev, ...updates }));

  };
  const fetchRoomViews = async () => {
    try {
      const response = await getAllRoomViews();
      if (response.success && response.data) {
        setRoomViews(response.data);
      } else {
        toast.error(t("UpdateRooms.toast.roomViewsLoadFailed"));
      }
    } catch (error) {
      toast.error(t("UpdateRooms.toast.roomViewsFetchFailed"));
    }
  };
  const handleUploadSuccess = (newImageUrls: string[]) => {
    updateRoom({
      ...roomDetails,
      image: [...roomDetails.image, ...newImageUrls],

    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = (roomDetails.image || []).filter(
      (_, index) => index !== indexToRemove
    );
    updateRoom({ ...roomDetails, image: updatedImages });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text={t("UpdateRooms.loader.loading")} />
      </div>
    );
  }
  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 sm:p-12 bg-white">
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
                      <Bed className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black">
                      {t("UpdateRooms.sections.basicInfo")}
                    </h3>
                  </div>

                  <div>
                    <Label
                      htmlFor="roomName"
                      className="text-gray-800 font-medium"
                    >
                      {t("UpdateRooms.form.roomName")}
                    </Label>
                    <Input
                      id="roomName"
                      value={roomDetails.roomName || ""}
                      onChange={(e) =>
                        updateRoom({ ...roomDetails, roomName: e.target.value })
                      }
                      placeholder={t("UpdateRooms.placeholder.roomName")}
                      className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                    />
                    {errors?.roomName?._errors[0] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.roomName._errors[0]}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="roomType"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.roomCode")}
                      </Label>
                      <Input
                        id="roomType"
                        value={roomDetails.roomType || ""}
                        disabled
                        onChange={(e) =>
                          updateRoom({ ...roomDetails, roomType: e.target.value })
                        }
                        placeholder={t("UpdateRooms.placeholder.roomCode")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                      {errors?.roomType?._errors[0] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.roomType._errors[0]}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="totalRoom"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.totalRooms")}
                      </Label>
                      <Input
                        id="totalRoom"
                        type="number"
                        value={roomDetails.totalRoom || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            totalRoom: parseInt(e.target.value) || 0,
                          })
                        }
                        min={0}
                        placeholder={t("UpdateRooms.placeholder.totalRooms")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                      {errors?.totalRoom?._errors[0] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.totalRoom._errors[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="isAvailable"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.roomAvailability")}
                      </Label>
                      <div className="flex items-center space-x-3 mt-3">
                        <Switch
                          id="isAvailable"
                          checked={!!roomDetails.available} // Use !! to ensure it's a boolean
                          onCheckedChange={(checked) =>
                            updateRoom({
                              ...roomDetails, available: checked
                            })
                          }
                        />
                        <span className="text-sm text-gray-600 transition-colors">
                          {roomDetails.available
                            ? t("UpdateRooms.availability.available")
                            : t("UpdateRooms.availability.unavailable")}
                        </span>
                      </div>
                      {errors?.available?._errors[0] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.available._errors[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-gray-800 font-medium"
                    >
                      {t("UpdateRooms.form.roomDescription")}
                    </Label>
                    <Textarea
                      id="description"
                      value={roomDetails.description || ""}
                      onChange={(e) =>
                        updateRoom({ ...roomDetails, description: e.target.value })
                      }
                      placeholder={t("UpdateRooms.placeholder.description")}
                      className="mt-2 min-h-[100px] border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100 p-3"
                    />
                    {errors?.description ? (
                      <p className="text-sm text-red-600">
                        {errors.description._errors[0]}
                      </p>
                    ) : (
                      <div></div>
                    )}
                    <p
                      className={`text-xs ml-auto ${(roomDetails.description || "").length > 5000
                        ? "text-red-600"
                        : "text-gray-500"
                        }`}
                    >
                      {(roomDetails.description || "").length || 0}/5000
                       {t("UpdateRooms.characters")}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black">
                      {t("UpdateRooms.sections.specifications")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="priority"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.priority")}
                      </Label>
                      <Input
                        id="priority"
                        type="number"
                        value={roomDetails.priority || ""}
                        min={1}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.priority")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="roomView"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.roomView")}
                      </Label>
                      <Select value={roomDetails.RoomViews?.MasterRoomView?.id || ''} onValueChange={(value) =>
                        updateRoomDetails((prev) => ({
                          ...prev,
                          RoomViews: {
                            MasterRoomView: {
                              id: value,
                              viewName: roomViews.find(view => view.id === value)?.viewName || ''
                            }
                          }
                        }))}>
                        <SelectTrigger className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100">
                          <SelectValue placeholder={t("UpdateRooms.placeholder.selectView")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          {roomViews.length > 0 && roomViews.map((view) => (
                            <SelectItem key={view.id} value={view.id} className="hover:bg-gray-100">{view.viewName}</SelectItem>
                          ))}

                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="floor"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.floor")}
                      </Label>
                      <Input
                        id="floor"
                        type="number"
                        value={roomDetails.floor || ""}
                        min={0}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            floor: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.floor")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="smokingPolicy"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.smokingPolicy")}
                      </Label>
                      <Select
                        value={roomDetails.smokingPolicy || ""}
                        onValueChange={(value) =>
                          updateRoom({ ...roomDetails, smokingPolicy: value as smokingPolicy })
                        }
                      >
                        <SelectTrigger className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100">
                          <SelectValue placeholder={t("UpdateRooms.placeholder.selectPolicy")} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          <SelectItem
                            value="non_smoking"
                            className="hover:bg-gray-100"
                          >
                            {t("UpdateRooms.smokingOptions.nonSmoking")}
                          </SelectItem>
                          <SelectItem
                            value="smoking"
                            className="hover:bg-gray-100"
                          >
                            {t("UpdateRooms.smokingOptions.smokingAllowed")}
                          </SelectItem>
                          <SelectItem
                            value="designated_area"
                            className="hover:bg-gray-100"
                          >
                            {t("UpdateRooms.smokingOptions.designatedArea")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="roomSize"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.roomSize")}
                      </Label>
                      <Input
                        id="roomSize"
                        min={0}
                        type="number"
                        value={roomDetails.roomSize || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            roomSize: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.roomSize")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="roomUnit"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.sizeUnit")}
                      </Label>
                      <Select
                        value={roomDetails.roomUnit}
                        onValueChange={(value) =>
                          updateRoom({ ...roomDetails, roomUnit: value as roomUnit })
                        }
                      >
                        <SelectTrigger className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          <SelectItem
                            value="sqft"
                            className="hover:bg-gray-100"
                          >
                            {t("UpdateRooms.sizeUnitOptions.sqft")}
                          </SelectItem>
                          <SelectItem value="sqm" className="hover:bg-gray-100">
                            {t("UpdateRooms.sizeUnitOptions.sqm")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div>
                      <Label
                        htmlFor="numberOfBedrooms"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.numberOfBedrooms")}
                      </Label>
                      <Input
                        id="numberOfBedrooms"
                        min={0}
                        type="number"
                        value={roomDetails.numberOfBedrooms || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            numberOfBedrooms: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.bedrooms")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="numberOfBedrooms"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.numberOfLivingRooms")}
                      </Label>
                      <Input
                        id="numberOfLivingRoom"
                        min={0}
                        type="number"
                        value={roomDetails.numberOfLivingRoom || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            numberOfLivingRoom: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.livingRooms")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="extraBed"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.numberOfExtraBeds")}
                      </Label>
                      <Input
                        id="extraBed"
                        min={0}
                        type="number"
                        value={roomDetails.extraBed || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,
                            extraBed: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.extraBeds")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* --- Section 3: Occupancy Details --- */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black">
                      {t("UpdateRooms.sections.occupancy")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="maxOccupancy"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.maxOccupancy")}
                      </Label>
                      <Input
                        id="maxOccupancy"
                        type="number"
                        min={1}
                        value={roomDetails.maxOccupancy || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,

                            maxOccupancy: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.maxOccupancy")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                      {errors?.maxOccupancy?._errors[0] && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.maxOccupancy._errors[0]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="maxNumberOfAdults"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.maxAdults")}
                      </Label>
                      <Input
                        id="maxNumberOfAdults"
                        type="number"
                        min={0}
                        value={roomDetails.maxNumberOfAdults || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,

                            maxNumberOfAdults: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.maxAdults")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="maxNumberOfChildren"
                        className="text-gray-800 font-medium"
                      >
                        {t("UpdateRooms.form.maxChildren")}
                      </Label>
                      <Input
                        id="maxNumberOfChildren"
                        type="number"
                        min={0}
                        value={roomDetails.maxNumberOfChildren || ""}
                        onChange={(e) =>
                          updateRoom({
                            ...roomDetails,

                            maxNumberOfChildren: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder={t("UpdateRooms.placeholder.maxChildren")}
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* --- Section 4: Room Image Management --- */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                      <Camera className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {t("UpdateRooms.sections.images")}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {t("UpdateRooms.images.subtitle")}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    className="h-12 px-6"
                  >
                    <Upload className="w-5 h-5 mr-2" /> {t("UpdateRooms.images.addEditImages")}
                  </Button>
                  {roomDetails.image && roomDetails.image.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {roomDetails.image.map((src, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square"
                        >
                          <img
                            src={src}
                            alt={t("UpdateRooms.images.altText", { index: index + 1 })}
                            className="h-full w-full object-cover rounded-md"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors?.image?._errors[0] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.image._errors[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        // uploadImages={uploadImages}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}
