import { useState, type Dispatch, type SetStateAction } from "react";
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

const roomSchema = z.object({
  roomName: z
    .string()
    .min(3, "Room name is required and must be at least 3 characters."),
  roomType: z.string().min(1, "Please select a room type."),
  totalRoom: z.coerce.number().min(1, "Total rooms must be at least 1."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(5000, "Description cannot exceed 500 characters."),
  maxOccupancy: z.coerce.number().min(1, "Max occupancy must be at least 1."),
  image: z.array(z.string()).min(1, "Please upload at least one room image."),
  roomView: z.string().optional(),
  floor: z.coerce.number().optional(),
  roomSize: z.coerce.number().optional(),
  roomUnit: z.string().optional(),
  smokingPolicy: z.string().optional(),
  maxNumberOfAdults: z.coerce.number().optional(),
  maxNumberOfChildren: z.coerce.number().optional(),
  numberOfBedrooms: z.coerce.number()
  .min(1, "Number of bedrooms must be at least 1.")
  .optional(),
  numberOfLivingRoom: z.coerce.number().optional(),
  extraBed: z.coerce.number().optional(),
  available: z.boolean().optional(),
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
  const [errors, _setErrors] = useState<FormErrors | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateRoom = (updates: Partial<IRoomDetails>) => {
    
    updateRoomDetails((prev) => ({ ...prev, ...updates }));
    // if (errors) {
    //   const updatedFields = Object.keys(updates);
    //   const newErrors = { ...errors };
    //   updatedFields.forEach((field) => delete (newErrors as any)[field]);
    //   setErrors(newErrors);
    // }
  };

  const handleUploadSuccess = (newImageUrls: string[]) => {
    updateRoom({
      image: [...(roomDetails.image || []), ...newImageUrls],
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = (roomDetails.image || []).filter(
      (_, index) => index !== indexToRemove
    );
    updateRoom({ image: updatedImages });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Loading Room Details" />
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
                      Basic Information
                    </h3>
                  </div>

                  <div>
                    <Label
                      htmlFor="roomName"
                      className="text-gray-800 font-medium"
                    >
                      Room Name *
                    </Label>
                    <Input
                      id="roomName"
                      value={roomDetails.roomName || ""}
                      onChange={(e) =>
                        updateRoom({ roomName: e.target.value })
                      }
                      placeholder="e.g., Deluxe King Suite"
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
                        Room Type *
                      </Label>
                      <Input
                        id="roomType"
                        value={roomDetails.roomType || ""}
                        onChange={(e) =>
                          updateRoom({ roomType: e.target.value })
                        }
                        placeholder="e.g., Deluxe King Suite"
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
                        Total Rooms of This Type *
                      </Label>
                      <Input
                        id="totalRoom"
                        type="number"
                        value={roomDetails.totalRoom || ""}
                        onChange={(e) =>
                          updateRoom({
                            totalRoom: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 10"
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
                        Room Availability
                      </Label>
                      <div className="flex items-center space-x-3 mt-3">
                        <Switch
                          id="isAvailable"
                          checked={!!roomDetails.available} // Use !! to ensure it's a boolean
                          onCheckedChange={(checked) =>
                            updateRoom({ available: checked })
                          }
                        />
                        <span className="text-sm text-gray-600 transition-colors">
                          {roomDetails.available
                            ? "This room type is available for booking."
                            : "This room type is currently unavailable."}
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
                      Room Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={roomDetails.description || ""}
                      onChange={(e) =>
                        updateRoom({ description: e.target.value })
                      }
                      placeholder="Describe the room's features, view, and what makes it special."
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
                      className={`text-xs ml-auto ${
                        (roomDetails.description || "").length > 5000
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {(roomDetails.description || "").length || 0}/5000
                      characters
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-black">
                      Room Specifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="roomView"
                        className="text-gray-800 font-medium"
                      >
                        Room View
                      </Label>
                      <Select
                        value={roomDetails.roomView || ""}
                        onValueChange={(value) =>
                          updateRoom({ roomView: value })
                        }
                      >
                        <SelectTrigger className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100">
                          <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          <SelectItem
                            value="city"
                            className="hover:bg-gray-100"
                          >
                            City View
                          </SelectItem>
                          <SelectItem
                            value="sea"
                            className="hover:bg-gray-100"
                          >
                            Sea View
                          </SelectItem>
                          <SelectItem
                            value="mountain"
                            className="hover:bg-gray-100"
                          >
                            Mountain View
                          </SelectItem>
                          <SelectItem
                            value="garden"
                            className="hover:bg-gray-100"
                          >
                            Garden View
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="floor"
                        className="text-gray-800 font-medium"
                      >
                        Floor
                      </Label>
                      <Input
                        id="floor"
                        type="number"
                        value={roomDetails.floor || ""}
                        min={0}
                        onChange={(e) =>
                          updateRoom({
                            floor: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 8"
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="smokingPolicy"
                        className="text-gray-800 font-medium"
                      >
                        Smoking Policy
                      </Label>
                      <Select
                        value={roomDetails.smokingPolicy || ""}
                        onValueChange={(value) =>
                          updateRoom({ smokingPolicy: value })
                        }
                      >
                        <SelectTrigger className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100">
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-300">
                          <SelectItem
                            value="non_smoking"
                            className="hover:bg-gray-100"
                          >
                            Non-Smoking
                          </SelectItem>
                          <SelectItem
                            value="smoking"
                            className="hover:bg-gray-100"
                          >
                            Smoking Allowed
                          </SelectItem>
                          <SelectItem
                            value="designated_area"
                            className="hover:bg-gray-100"
                          >
                            Designated Area
                          </SelectItem>                          
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="roomSize"
                        className="text-gray-800 font-medium"
                      >
                        Room Size
                      </Label>
                      <Input
                        id="roomSize"
                        min={0}
                        type="number"
                        value={roomDetails.roomSize || ""}
                        onChange={(e) =>
                          updateRoom({
                            roomSize: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 350"
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="roomUnit"
                        className="text-gray-800 font-medium"
                      >
                        Size Unit
                      </Label>
                      <Select
                        value={roomDetails.roomUnit}
                        onValueChange={(value) =>
                          updateRoom({ roomUnit: value })
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
                            Square Feet (sqft)
                          </SelectItem>
                          <SelectItem value="sqm" className="hover:bg-gray-100">
                            Square Meters (sqm)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                     <div>
                      <Label
                        htmlFor="numberOfBedrooms"
                        className="text-gray-800 font-medium"
                      >
                        No.of Bedrooms
                      </Label>
                      <Input
                        id="numberOfBedrooms"
                        min={0}
                        type="number"
                        value={roomDetails.numberOfBedrooms || ""}
                        onChange={(e) =>
                          updateRoom({
                            numberOfBedrooms: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 350"
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
                      Occupancy Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label
                        htmlFor="maxOccupancy"
                        className="text-gray-800 font-medium"
                      >
                        Max Occupancy *
                      </Label>
                      <Input
                        id="maxOccupancy"
                        type="number"
                        min={1}
                        value={roomDetails.maxOccupancy || ""}
                        onChange={(e) =>
                          updateRoom({
                            maxOccupancy: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 3"
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
                        Max Adults
                      </Label>
                      <Input
                        id="maxNumberOfAdults"
                        type="number"
                        min={0}
                        value={roomDetails.maxNumberOfAdults || ""}
                        onChange={(e) =>
                          updateRoom({
                            maxNumberOfAdults: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 2"
                        className="mt-2 h-12 border-2 border-gray-300 hover:border-gray-400 focus:border-black transition-all duration-300 focus:ring-4 focus:ring-gray-100"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="maxNumberOfChildren"
                        className="text-gray-800 font-medium"
                      >
                        Max Children
                      </Label>
                      <Input
                        id="maxNumberOfChildren"
                        type="number"
                        min={0}
                        value={roomDetails.maxNumberOfChildren || ""}
                        onChange={(e) =>
                          updateRoom({
                            maxNumberOfChildren: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="e.g., 1"
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
                        Room Images *
                      </h2>
                      <p className="text-sm text-gray-600">
                        Showcase your room with stunning photos
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                    className="h-12 px-6"
                  >
                    <Upload className="w-5 h-5 mr-2" /> Add or Edit Images
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
                            alt={`Room image ${index + 1}`}
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
