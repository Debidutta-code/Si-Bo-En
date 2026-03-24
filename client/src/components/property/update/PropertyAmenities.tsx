import { useEffect, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import Loader from "@/components/Loader/Loader";


// API
import { getAmenities } from "../api/create/propertyAmenity";
import type { IAmenity } from "../types/amenity.types";

// Types
type AmenityKey = string;
type AmenityState = Record<AmenityKey, boolean>;



// --- VALIDATION ---
const propertyAmenitiesSchema = z.object({
  amenities: z.record(z.string(), z.boolean()).refine(
    (fields) => Object.values(fields).some(Boolean),
    { message: "Please select at least one amenity." }
  ),
});

type FormErrors = z.inferFormattedError<typeof propertyAmenitiesSchema>;

export default function UpdatePropertyAmenity({
  availableAmenities: propAvailableAmenities = [], // selected amenities from parent
  setSelectedAmenities: propSetSelectedAmenities,
}: {
  availableAmenities: IAmenity[];
  setSelectedAmenities: (val: AmenityState) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [_apiError, setApiError] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<IAmenity[]>([]); // all possible
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityState>({});

  // --- FETCH ALL AVAILABLE AMENITIES (list of strings) ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const amenitiesRes = await getAmenities();
        // console.log("Amenities Response:", amenitiesRes);

        if (!amenitiesRes.success) throw new Error("Failed to fetch amenities");

        // Extract and clean all possible amenities
        const allAmenities = (amenitiesRes.data || []) as Array<{
          id: string;
          amenityName: string;
        }>;
        const cleanedAmenities: IAmenity[] = allAmenities
          .map((a) => ({ id: a.id, name: a.amenityName }))
          .filter((a) => a.id && a.name);

        setAvailableAmenities(cleanedAmenities);

        // Build initial state: all false (keys are amenity UUIDs)
        const initialState = cleanedAmenities.reduce(
          (acc: AmenityState, amenity: IAmenity) => {
            acc[amenity.id] = false;
            return acc;
          },
          {},
        );

        // Mark selected ones as true (propAvailableAmenities are already selected amenities)
        propAvailableAmenities.forEach((amenity: IAmenity) => {
          if (amenity?.id && Object.prototype.hasOwnProperty.call(initialState, amenity.id)) {
            initialState[amenity.id] = true;
          }
        });

        // Set both local and parent state
        setSelectedAmenities(initialState);
        propSetSelectedAmenities(initialState);
      } catch (err: any) {
        setApiError(err.message || "Failed to load amenities");
        toast.error("Could not load amenities");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [propAvailableAmenities]); // Re-run if parent list changes

  // --- TOGGLE HANDLER ---
  const handleToggle = (amenityId: string) => {
    const newValue = !selectedAmenities[amenityId];
    const newState = { ...selectedAmenities, [amenityId]: newValue };
    setSelectedAmenities(newState);
    propSetSelectedAmenities(newState);

    if (errors) setErrors(null);
  };

  if (isLoading) {
    return <Loader text="Loading Amenities..." />;
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto px-2 py-1">
      {/* Amenity Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {availableAmenities.map((amenity) => {
          const isSelected = selectedAmenities[amenity.id] || false;

          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => handleToggle(amenity.id)}
              className={cn( 
                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none",
                isSelected
                  ? "bg-black text-white border-black shadow-md"
                  : "bg-white border-gray-300 hover:border-black hover:shadow-md"
              )}
            >
              <span className="text-xs  font-medium capitalize text-center">
                {amenity.name}
              </span>
              <div
                className={cn(
                  "absolute top-0 right-0 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
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

      {/* Validation Error */}
      {errors?.amenities?._errors[0] && (
        <p className="text-red-500 text-sm text-center mb-4">
          <X className="inline w-4 h-4 mr-1" />
          {errors.amenities._errors[0]}
        </p>
      )}
    </div>
  );
}