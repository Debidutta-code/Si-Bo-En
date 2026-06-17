import { useEffect, useState, type Dispatch } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Loader from "@/components/Loader/Loader";
import { getAmenities } from "../api/create/propertyAmenity"; // shared endpoint
import z from "zod";
import type { IURoomAmenity } from "./types/types";
import { useTranslation } from "react-i18next";

type AmenityKey = string;
type AmenityState = Record<AmenityKey, boolean>;
const propertyAmenitiesSchema = z.object({
  amenities: z.record(z.string(), z.boolean()).refine(
    (fields) => Object.values(fields).some(Boolean),
    { message: "Please select at least one amenity." }
  ),
});

type FormErrors = z.inferFormattedError<typeof propertyAmenitiesSchema>;
export default function RoomAmenities({
  availableAmenities: propAvailableAmenities = [],
  setSelectedAmenities: propSetSelectedAmenities,
}: {
  availableAmenities: string[];
  setSelectedAmenities: Dispatch<Record<AmenityKey, boolean>>
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [_apiError, setApiError] = useState<string | null>(null);
  const [availableAmenities, setAvailableAmenities] = useState<IURoomAmenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityState>({});
  const { t } = useTranslation();
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await getAmenities("room");
        if (res.success && Array.isArray(res.data)) {

          setAvailableAmenities(res.data);

          // Build initial selected state based on propAvailableAmenities (already selected names)
          const initialSelected: AmenityState = {};
          for (const name of res.data) {
            initialSelected[name.amenityName] = propAvailableAmenities.includes(name.amenityName);
          }

          setSelectedAmenities(initialSelected);
          propSetSelectedAmenities(initialSelected);
        } else {
          setAvailableAmenities([]);
        }
      } catch (err: any) {
        console.error("Failed to load room amenities", err);
        setApiError(err.message || "Failed to load amenities");

        setAvailableAmenities([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAmenities();
  }, []);


  // --- TOGGLE HANDLER ---
  const handleToggle = (amenity:IURoomAmenity) => {
    // console.log(name)
    const newValue = !selectedAmenities[amenity.amenityName];
    const newState = { ...selectedAmenities, [amenity.amenityName]: newValue };
    propSetSelectedAmenities(newState);
    setSelectedAmenities(newState);
    if (errors) setErrors(null);

  };

  if (isLoading) {
    return <Loader text={t("PropertyUpdate.roomAmenity.loading")} />;
  }

  return (
    <div className="max-h-[90vh] w-full overflow-y-auto px-2 py-1">
      {/* Amenity Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {availableAmenities.map((amenity) => {
          const { id, amenityName } = amenity;
          const isSelected = selectedAmenities[amenityName];
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleToggle(amenity)}
              className={cn(
                "relative flex flex-col items-center px-10 py-4 rounded-xl border-2 transition-all",
                isSelected
                  ? "bg-black text-white border-black shadow-md"
                  : "bg-white border-gray-300 hover:border-black hover:shadow-md"
              )}
            >
              <span className="text-xs font-medium capitalize text-center">
                {amenity._translations?amenity._translations.amenityName:amenity.amenityName}
              </span>
              <div
                className={cn(
                  "absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full border-2",
                  isSelected ? "bg-white border-white" : "bg-white border-gray-400"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-black" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}