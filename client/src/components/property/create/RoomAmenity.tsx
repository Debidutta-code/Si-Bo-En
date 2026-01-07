import { useEffect, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import { createRoomAmenity, updateRoomAmenity } from "../api/show/room"; // Adjust path as needed
import { cn } from "@/lib/utils";
import { getAmenities } from "../api/create/propertyAmenity";
import { getRoomAmenities } from "../api/create/roomAmenity";
// UI Components
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Wifi,
  Tv,
  Wind,
  Dumbbell,
  
} from "lucide-react";
import Loader from "@/components/Loader/Loader";
import type {IAmenityTypes} from "./types/types";


// Zod Validation
const roomAmenitiesSchema = z.object({
  amenities: z.record(z.string(), z.boolean()).refine(
    (fields) => Object.values(fields).some(Boolean),
    {
      message: "Please select at least one room amenity.",
    }
  ),
});

type FormErrors = z.inferFormattedError<typeof roomAmenitiesSchema>;

// Icon Mapper – Maps exact label strings to icons
const getAmenityIcon = (label: string) => {
  switch (label) {
    case "Free Wi-Fi":
      return <Wifi className="w-5 h-5 mb-2" />;
    case "Air Conditioning":
      return <Wind className="w-5 h-5 mb-2" />;
    case "Flat-Screen TV":
    case "Flat Screen TV":
      return <Tv className="w-5 h-5 mb-2" />;
    case "Complimentary Toiletries":
      return <Sparkles className="w-5 h-5 mb-2" />;
    case "Swimming Pool":
      return <Sun className="w-5 h-5 mb-2" />;
    case "Gym / Fitness Center":
      return <Dumbbell className="w-5 h-5 mb-2" />;
    default:
      return <Sparkles className="w-5 h-5 mb-2" />;
  }
};

// Lazy load Sun icon since it's not in your imports
const Sun = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

export default function RoomAmenities() {
  const { propertyId, roomId, next, previous, markStepAsCompleted } = usePropertyForm();

  const [availableAmenities, setAvailableAmenities] = useState<IAmenityTypes[]>([]); // labels
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmenities = async () => {
      if (!propertyId || !roomId) {
        toast.error("Missing property or room ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setApiError(null);

      try {
        // Fetch available room amenities
        const amenitiesRes = await getAmenities("room");
        if (!amenitiesRes.success || !Array.isArray(amenitiesRes.data) || amenitiesRes.data.length == 0) {
          throw new Error("Failed to load available amenities.");
        }

        const roomAmenityLabels = amenitiesRes.data;
        if (!Array.isArray(roomAmenityLabels) || roomAmenityLabels.length === 0) {
          throw new Error("No room amenities defined in system.");
        }

        setAvailableAmenities(roomAmenityLabels);

        // Initialize all to false
        const defaultState = roomAmenityLabels.reduce((acc, label) => {
          acc[label] = false;
          return acc;
        }, {} as Record<string, boolean>);

        // Fetch current room's selected amenities
        const selectedRes = await getRoomAmenities(propertyId, roomId);
        // console.log("🔧 Selected Amenities Response:", selectedRes);

        if (selectedRes.success && Array.isArray(selectedRes.data)) {
          const selectedMap = { ...defaultState };
          selectedRes.data.forEach((label: string) => {
            if (selectedMap.hasOwnProperty(label)) {
              selectedMap[label] = true;
            }
          });
          // console.log("Selected Amenities Map:", selectedMap);
          setSelectedAmenities(selectedMap);
          setIsExistingData(true);
        } else {
          setSelectedAmenities(defaultState);
          setIsExistingData(false);
        }
      } catch (error: any) {
        console.error("Error fetching room amenities:", error);
        setApiError(error.message || "Could not load room amenities.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAmenities();
  }, [propertyId, roomId]);

  const handleToggle = (label: string) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
    if (errors) setErrors(null);
  };

  const handleSave = async () => {
    const result = roomAmenitiesSchema.safeParse({ amenities: selectedAmenities });
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please select at least one amenity.");
      return;
    }

    if (!propertyId || !roomId) {
      toast.error("Invalid property or room. Please go back.");
      return;
    }

    // Extract selected labels

    setIsSaving(true);
    try {
      let response;
      if (isExistingData) {
        response = await updateRoomAmenity(propertyId, roomId, selectedAmenities);
      } else {
        response = await createRoomAmenity(propertyId, roomId, selectedAmenities);
      }

      if (response.success) {
        toast.success(`Room amenities ${isExistingData ? "updated" : "saved"}!`);
        setIsExistingData(true);
        markStepAsCompleted();
        next();
      } else {
        toast.error(response.message || "Failed to save room amenities.");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Loading Room Amenities" />
      </div>
    );
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-white">
      <div className="bg-white overflow-hidden">
        <div className="sm:p-12 p-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-white text-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-black">Room Amenities</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Select amenities available in this room.
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {apiError && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">
              <X className="w-6 h-6 text-red-800 mx-auto mb-4" />
              <p className="text-red-900 font-medium">Error Loading Amenities</p>
              <p className="text-red-700 mt-2">{apiError}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="mt-4 border-red-400 text-red-800 hover:bg-red-100"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Amenity Grid */}
          {!apiError && (
            <div className="bg-white">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                {availableAmenities.map((label:IAmenityTypes) => {
                  const isSelected = selectedAmenities[label.amenityName] || false;
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => handleToggle(label.amenityName)}
                      className={cn(
                        "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                        isSelected
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white border-gray-300 hover:border-black text-gray-800 hover:shadow-md"
                      )}
                    >
                      {getAmenityIcon(label.amenityName)}
                      <span className="font-semibold text-sm">{label.amenityName}</span>
                      <div
                        className={cn(
                          "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          isSelected
                            ? "bg-white border-white"
                            : "bg-white border-gray-400 group-hover:border-black"
                        )}
                      >
                        {isSelected && <Check className="w-3 h-3 text-black" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {errors?.amenities?._errors[0] && (
                <div className="text-center text-red-500 text-sm p-3 bg-red-50 rounded-lg border">
                  <X className="inline w-4 h-4 mr-1" />
                  {errors.amenities._errors[0]}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-8 mt-12">
            <Button
              onClick={previous}
              variant="outline"
              disabled={isSaving}
              className="border-2 border-black hover:bg-black hover:text-white w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Previous Step
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}