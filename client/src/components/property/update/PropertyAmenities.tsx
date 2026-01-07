import { useEffect, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import Loader from "@/components/Loader/Loader";


// API
import { getAmenities } from "../api/create/propertyAmenity";

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
  availableAmenities: string[];
  setSelectedAmenities: (val: AmenityState) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [_apiError, setApiError] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<string[]>([]); // all possible
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityState>({});

  // Slugify: "Free Wi-Fi" → "free_wifi"
  const toKey = (name: string): string => {
    return name
        
  };

  // --- FETCH ALL AVAILABLE AMENITIES (list of strings) ---
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const amenitiesRes = await getAmenities();
        // console.log("Amenities Response:", amenitiesRes);

        if (!amenitiesRes.success) throw new Error("Failed to fetch amenities");

        // Extract and clean all possible amenities
        const allAmenities = amenitiesRes.data || [];
        const cleanedAmenities = allAmenities
          .map((name: {amenityName: string}) => name.amenityName)
        setAvailableAmenities(cleanedAmenities);

        // Build initial state: all false
        const initialState = cleanedAmenities.reduce((acc: AmenityState, name: string) => {
          const key = toKey(name);
          acc[key] = false;
          return acc;
        }, {});

        // Mark selected ones as true
        propAvailableAmenities.forEach((selectedName: string) => {
          const cleanSelectedName = selectedName.trim()
          const key = toKey(cleanSelectedName);
          if (initialState.hasOwnProperty(key)) {
            initialState[key] = true;
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
  const handleToggle = (humanName: string) => {
    const key = toKey(humanName);
    const newValue = !selectedAmenities[key];

    const newState = { ...selectedAmenities, [key]: newValue };
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
        {availableAmenities.map((name) => {
          const key = toKey(name);
          const isSelected = selectedAmenities[key] || false;

          return (
            <button
              key={name}
              type="button"
              onClick={() => handleToggle(name)}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none",
                isSelected
                  ? "bg-black text-white border-black shadow-md"
                  : "bg-white border-gray-300 hover:border-black hover:shadow-md"
              )}
            >
              <span className="text-xs font-medium capitalize text-center">
                {name.replace(/_/g, " ")}
              </span>
              <div
                className={cn(
                  "absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all",
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