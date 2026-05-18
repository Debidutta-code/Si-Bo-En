"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import {
  getAmenities,
  getPropertyAmenity,
  setPropertyAmenity,
  updatePropertyAmenity,
} from "../api/create/propertyAmenity";
import { cn } from "@/lib/utils";

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
  UtensilsCrossed,
  Car,
  Dumbbell,
  PawPrint,
  Sun,
} from "lucide-react";
import Loader from "@/components/Loader/Loader";
import type {IAmenityTypes} from "./types/types"
// --- ZOD VALIDATION: At least one amenity must be true ---
const propertyAmenitiesSchema = z.object({
  amenities: z.record(z.string(), z.boolean()).refine(
    (fields) => Object.values(fields).some(Boolean),
    {
      message: "Please select at least one amenity.",
      // Optional: path helps with error targeting
      path: ["amenities"],
    }
  ),
});

type FormErrors = z.inferFormattedError<typeof propertyAmenitiesSchema>;

// --- ICON MAPPER ---
const getAmenityIcon = (amenityId: string) => {
  switch (amenityId) {
    case "wifi":
      return <Wifi className="w-5 h-5 mb-2" />;
    case "tv":
      return <Tv className="w-5 h-5 mb-2" />;
    case "air_conditioning":
      return <Wind className="w-5 h-5 mb-2" />;
    case "kitchen":
      return <UtensilsCrossed className="w-5 h-5 mb-2" />;
    case "free_parking":
      return <Car className="w-5 h-5 mb-2" />;
    case "gym":
      return <Dumbbell className="w-5 h-5 mb-2" />;
    case "pet_friendly":
      return <PawPrint className="w-5 h-5 mb-2" />;
    case "swimming_pool":
      return <Sun className="w-5 h-5 mb-2" />;
    default:
      return <Sparkles className="w-5 h-5 mb-2" />;
  }
};

export default function PropertyAmenities() {
  const { propertyId, next, previous, markStepAsCompleted } = usePropertyForm();

  // --- STATE ---
  const [availableAmenities, setAvailableAmenities] = useState<IAmenityTypes[]>([]); // e.g., ['wifi', 'tv', 'gym']
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExistingData, setIsExistingData] = useState(false);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // --- FETCH AMENITIES & INITIAL STATE ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!propertyId) {
        toast.error("Please complete the previous steps first.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setApiError(null);
      try {
        // Fetch list of all available amenity keys
        const amenitiesResponse = await getAmenities();
        // console.log("amenitiesResponse",amenitiesResponse);
        if (!amenitiesResponse.success) throw new Error("Failed to load amenities.");

        const amenityKeys = amenitiesResponse.data || [];
        setAvailableAmenities(amenityKeys);

        // Initialize selectedAmenities with all false
        const defaultState = amenityKeys.reduce((acc:any, amenity:IAmenityTypes) => {
          acc[amenity.id] = false;
          return acc;
        }, {} as Record<string, boolean>);

        // Fetch existing selections
        const selectedResponse = await getPropertyAmenity(propertyId);
        if (selectedResponse.success && Array.isArray(selectedResponse.data) && selectedResponse.data.length > 0) {
          // Convert array like ['wifi', 'tv'] → { wifi: true, tv: true, gym: false }
          const selectedMap = { ...defaultState };
          selectedResponse.data.forEach((amenity:any) => {
            if (selectedMap.hasOwnProperty(amenity.id)) {
              selectedMap[amenity.id] = true;
            }
          });
          setSelectedAmenities(selectedMap);
          setIsExistingData(true);
        } else {
          setSelectedAmenities(defaultState);
          setIsExistingData(false);
        }
      } catch (error) {
        setApiError("Could not load amenities. Please try again.");
        // Fallback: empty state
        setSelectedAmenities({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [propertyId]);

  // --- HANDLE TOGGLE ---
  const handleAmenityToggle = (amenityKey: string) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [amenityKey]: !prev[amenityKey],
    }));
    if (errors) setErrors(null);
  };

  // --- HANDLE SAVE ---
  const handleSave = async () => {
    const result = propertyAmenitiesSchema.safeParse({ amenities: selectedAmenities });
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please select at least one amenity.");
      return;
    }

    setErrors(null);
    setIsSaving(true);

    try {

      let response;
      if (isExistingData) {
        response = await updatePropertyAmenity(propertyId!, result.data.amenities);
      } else {
        response = await setPropertyAmenity(propertyId!, result.data.amenities);
      }

      if (response.success) {
        toast.success(`Amenities ${isExistingData ? "updated" : "saved"} successfully!`);
        setIsExistingData(true);
        markStepAsCompleted();
        next();
      } else {
        toast.error(response.message || "Failed to save amenities.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while saving amenities.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Loading Your Amenities" />
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
                <h1 className="text-2xl sm:text-3xl font-bold text-black">Property Amenities</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Choose amenities that make your property stand out.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white">
            {apiError && (
              <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-200 rounded-full mx-auto mb-4">
                  <X className="w-6 h-6 text-red-800" />
                </div>
                <p className="text-red-900 font-medium text-lg mb-2">Oops! Something went wrong</p>
                <p className="text-red-700 text-base mb-4">{apiError}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-400 text-red-800 hover:bg-red-100"
                >
                  Try Again
                </Button>
              </div>
            )}

            {!apiError && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                  {availableAmenities.map((amenity:IAmenityTypes) => {
                    const isSelected = selectedAmenities[amenity.id] || false;
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
                          isSelected
                            ? "bg-black text-white border-black shadow-md"
                            : "bg-white border-gray-300 hover:border-black text-gray-800 hover:shadow-md"
                        )}
                      >
                        {getAmenityIcon(amenity.amenityName)}
                        <span className="font-semibold text-sm capitalize">
                          {amenity._translations?amenity._translations.amenityName:amenity.amenityName.replace(/_/g, " ")}
                        </span>
                        <div
                          className={cn(
                            "absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
                            isSelected
                              ? "bg-white border-white"
                              : "border-gray-400 bg-white group-hover:border-black"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 text-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors?.amenities?._errors[0] && (
                  <div className="text-center text-red-500 text-sm mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <X className="inline w-4 h-4 mr-1" />
                    {errors.amenities._errors[0]}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 mt-12">
            <Button
              onClick={previous}
              variant="outline"
              className="border-2 border-black hover:bg-black hover:text-white w-full sm:w-auto"
              disabled={isSaving}
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Previous Step
            </Button>
            <Button
              onClick={handleSave}
              className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  Continue to Next Step <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}