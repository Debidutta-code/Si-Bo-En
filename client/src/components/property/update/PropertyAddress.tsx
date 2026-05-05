import { useState, useEffect } from "react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import csc, {
  type ICountry,
  type IState,
  type ICity,
} from "countries-states-cities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Home,
  Globe,
  Navigation,
  Landmark,
  Hash,
  X,
  Map,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Crosshair,
} from "lucide-react";
import type { IPropertyAddress } from "./types/types";
import Loader from "@/components/Loader/Loader";
import { useGeolocated } from "react-geolocated";
import toast from "react-hot-toast";

// Zod Validation Schema
const propertyAddressSchema = z.object({
  addressLine1: z
    .string()
    .min(3, "Address Line 1 must be at least 3 characters."),
  addressLine2: z.string().optional(),
  country: z.string().min(1, "Country is required."),
  state: z.string().min(1, "State is required."),
  city: z.string().min(1, "City is required."),
  location: z.string().min(1, "Location/Area is required."),
  landmark: z.string().optional(),
  zipCode: z.string(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormErrors = z.inferFormattedError<typeof propertyAddressSchema>;

export default function UpdatePropertyAddress({
  address,
  setAddress,
  isLoading,
}: {
  address: IPropertyAddress;
  setAddress: React.Dispatch<React.SetStateAction<IPropertyAddress>>;
  isLoading: boolean;
}) {
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  // Coordinate input method
  const [coordinateMethod, setCoordinateMethod] = useState<
    "link" | "manual" | "auto"
  >("manual");
  const [mapLink, setMapLink] = useState("");
  const [extractionStatus, setExtractionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [extractionMessage, setExtractionMessage] = useState("");
  // Geolocation hook
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 10000,
    });

  // Fetch all countries on mount
  useEffect(() => {
    setCountries(csc.getAllCountries());
  }, []);

  const resolveCountry = (value: string): ICountry | undefined => {
    const v = value.trim();
    if (!v) return undefined;

    // Prefer code lookup first.
    const byCode = csc.getCountryByCode(v.toUpperCase());
    if (byCode) return byCode;

    // Fallback: sometimes `address.country` can be the country name.
    return csc
      .getAllCountries()
      .find((c) => c.name.toLowerCase() === v.toLowerCase());
  };

  const resolveState = (countryId: number, stateCodeOrName: string): IState | undefined => {
    const needle = stateCodeOrName.trim();
    if (!needle) return undefined;
    return csc.getStatesOfCountry(countryId).find(
      (s) =>
        s.state_code.toLowerCase() === needle.toLowerCase() ||
        s.name.toLowerCase() === needle.toLowerCase(),
    );
  };

  const resolvedCountry = resolveCountry(address.country);
  const resolvedState =
    resolvedCountry && address.state
      ? resolveState(resolvedCountry.id, address.state)
      : undefined;
  useEffect(() => {
    if (address.country) {
      const country = resolveCountry(address.country);
      const countryStates: IState[] = country
        ? csc.getStatesOfCountry(country.id)
        : [];
      setStates(countryStates);
      if (address.state && country) {
        const resolved = resolveState(country.id, address.state);
        if (!resolved) {
          setAddress((prev) => ({ ...prev, state: "", city: "" }));
        }
      }
    } else {
      setStates([]);
    }
    // Keep city reset scoped to the state's effect; here we just clear cities list.
    setCities([]);
  }, [address.country, setAddress]);

  // Sync cities when state changes
  useEffect(() => {
    if (address.country && address.state) {
      const country = resolveCountry(address.country);
      const state = country ? resolveState(country.id, address.state) : undefined;

      const countryCities: ICity[] = state ? csc.getCitiesOfState(state.id) : [];
      setCities(countryCities);

      // If current city is not in this state, reset
      if (address.city && !countryCities.some((c) => c.name === address.city)) {
        setAddress((prev) => ({ ...prev, city: "" }));
      }
    } else {
      setCities([]);
    }
  }, [address.country, address.state, setAddress]);

  // Initialize coordinate method based on existing data
  useEffect(() => {
    if (address.latitude && address.longitude && !mapLink) {
      setCoordinateMethod("manual");
    }
  }, [address.latitude, address.longitude, mapLink]);

  // Extract coordinates from map link
  const extractCoordinatesFromLink = (
    link: string,
  ): { lat: number; lng: number } | null => {
    try {
      const cleanLink = link.trim();

      const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*),/, // Google @lat,lng
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // ll=lat,lng
        /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // q=lat,lng
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/, // !3dlat!4dlng
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // Apple Maps
        /#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/, // OSM
        /(-?\d+\.?\d*),(-?\d+\.?\d*)/, // Generic
      ];

      for (const pattern of patterns) {
        const match = cleanLink.match(pattern);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { lat, lng };
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return null;
    }
  };

  // Auto-extract when map link changes
  useEffect(() => {
    if (coordinateMethod === "link" && mapLink.trim()) {
      const coords = extractCoordinatesFromLink(mapLink);
      if (coords) {
        setAddress((prev) => ({
          ...prev,
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString(),
        }));
        setExtractionStatus("success");
        setExtractionMessage(
          `Coordinates extracted: (${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)})`,
        );
      } else {
        setExtractionStatus("error");
        setExtractionMessage("Could not extract coordinates from this link");
        setAddress((prev) => ({ ...prev, latitude: "", longitude: "" }));
      }
    } else if (coordinateMethod === "link" && !mapLink.trim()) {
      setExtractionStatus("idle");
      setExtractionMessage("");
      setAddress((prev) => ({ ...prev, latitude: "", longitude: "" }));
    }
  }, [mapLink, coordinateMethod, setAddress]);

  const handleMethodChange = (method: "link" | "manual" | "auto") => {
    setCoordinateMethod(method);
    setMapLink("");
    setExtractionStatus("idle");
    setExtractionMessage("");
    if (method === "link") {
      setAddress((prev) => ({ ...prev, latitude: "", longitude: "" }));
    }
  };
  const handleAutoFetchLocation = () => {
    if (!isGeolocationAvailable) {
      toast.error("Geolocation is not supported by your browser");
      setExtractionStatus("error");
      setExtractionMessage("Geolocation not supported");
      return;
    }

    if (!isGeolocationEnabled) {
      toast.error("Please enable location permissions in your browser");
      setExtractionStatus("error");
      setExtractionMessage("Location permission denied");
      return;
    }

    setIsFetchingLocation(true);
    setExtractionStatus("idle");
    setExtractionMessage("Fetching your location...");

    // Trigger geolocation
    getPosition();
  };

  // Effect to handle when coords are available
  useEffect(() => {
    if (coordinateMethod === "auto" && coords && isFetchingLocation) {
      setAddress((prev) => ({
        ...prev,
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
      }));

      setExtractionStatus("success");
      setExtractionMessage(
        `Location fetched: (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`,
      );
      setIsFetchingLocation(false);
    }
  }, [coords, coordinateMethod, isFetchingLocation]);
  const handleFieldChange = (field: keyof IPropertyAddress, value: string) => {
    if (field === "country") {
      console.log("Country changed:", value);
      setAddress((prev) => ({
        ...prev,
        country: value,
        state: "",
        city: "",
      }));
    } else if (field === "state") {
      setAddress((prev) => ({ ...prev, state: value, city: "" }));
    } else {
      setAddress((prev) => ({ ...prev, [field]: value }));
    }

    // Clear error for this field
    if (errors && (errors as any)[field]) {
      setErrors((prev) => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete (newErrors as any)[field];
        return newErrors;
      });
    }
  };
  if (isLoading) {
    return <Loader text="Updating the property details" />;
  }
  return (
    <div className="max-h-[80vh] overflow-y-auto px-2 py-1">
      {/* Street Address */}
      <div className="mb-6">
        <div className="space-y-6">
          <div>
            <Label
              htmlFor="addressLine1"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Home className="w-4 h-4" /> Address Line 1 *
            </Label>
            <Input
              id="addressLine1"
              value={address.addressLine1}
              onChange={(e) =>
                handleFieldChange("addressLine1", e.target.value)
              }
              placeholder="Street number and name"
              className={cn(
                "h-10 border-gray-300 focus:border-black",
                errors?.addressLine1 && "border-red-500 focus:border-red-600",
              )}
            />
            {errors?.addressLine1?._errors[0] && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.addressLine1._errors[0]}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="addressLine2"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Home className="w-4 h-4" /> Address Line 2
            </Label>
            <Input
              id="addressLine2"
              value={address.addressLine2}
              onChange={(e) =>
                handleFieldChange("addressLine2", e.target.value)
              }
              placeholder="Apartment, building, etc."
              className="h-10 border-gray-300 focus:border-black"
            />
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country */}
          <div>
            <Label
              htmlFor="country"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Globe className="w-4 h-4" /> Country *
            </Label>
            <Input
              id="country"
              list="country-list"
              value={address.country}
              onChange={(e) => handleFieldChange("country", e.target.value)}
              placeholder="Search or type country..."
              className={cn(
                "h-10 border-gray-300 focus:border-black",
                errors?.country && "border-red-500 focus:border-red-600",
              )}
            />
            <datalist id="country-list">
              {countries.map((country) => (
                <option key={country.iso2} value={country.name} />
              ))}
            </datalist>
            {errors?.country?._errors[0] && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.country._errors[0]}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <Label
              htmlFor="state"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <MapPin className="w-4 h-4" /> State *
            </Label>
            <Input
              id="state"
              list="state-list"
              value={address.state}
              onChange={(e) => handleFieldChange("state", e.target.value)}
              disabled={!resolvedCountry || states.length === 0}
              placeholder="Search or type state..."
              className={cn(
                "h-10 border-gray-300 focus:border-black",
                errors?.state && "border-red-500 focus:border-red-600",
              )}
            />
            <datalist id="state-list">
              {states.map((state) => (
                <option key={state.state_code} value={state.name} />
              ))}
            </datalist>
            {errors?.state?._errors[0] && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.state._errors[0]}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <Label
              htmlFor="city"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Home className="w-4 h-4" /> City *
            </Label>
            <Input
              id="city"
              list="city-list"
              value={address.city}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              disabled={!resolvedState || cities.length === 0}
              placeholder="Search or type city..."
              className={cn(
                "h-10 border-gray-300 focus:border-black",
                errors?.city && "border-red-500 focus:border-red-600",
              )}
            />
            <datalist id="city-list">
              {cities.map((city) => (
                <option key={city.name} value={city.name} />
              ))}
            </datalist>
            {errors?.city?._errors[0] && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.city._errors[0]}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <Label
              htmlFor="location"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Navigation className="w-4 h-4" /> Area/Location *
            </Label>
            <Input
              id="location"
              value={address.location}
              onChange={(e) => handleFieldChange("location", e.target.value)}
              placeholder="e.g., Badi Chopar"
              className={cn(
                "h-10 border-gray-300 focus:border-black",
                errors?.location && "border-red-500 focus:border-red-600",
              )}
            />
            {errors?.location?._errors[0] && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.location._errors[0]}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <Label
              htmlFor="landmark"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Landmark className="w-4 h-4" /> Landmark
            </Label>
            <Input
              id="landmark"
              value={address.landmark}
              onChange={(e) => handleFieldChange("landmark", e.target.value)}
              placeholder="Near City Palace"
              className="h-10 border-gray-300 focus:border-black"
            />
          </div>

          {/* ZIP Code */}
          <div>
            <Label
              htmlFor="zipCode"
              className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
            >
              <Hash className="w-4 h-4" /> PIN Code *
            </Label>
            <Input
              id="zipCode"
              type="text"
              inputMode="numeric"
              value={address.zipCode}
              onChange={(e) =>
                handleFieldChange("zipCode", e.target.value.replace(/\D/g, ""))
              }
              maxLength={6}
              placeholder="302002"
              className={cn(
                "h-10 border-gray-300 focus:border-black",
                errors?.zipCode && "border-red-500 focus:border-red-600",
              )}
            />
            {errors?.zipCode?._errors[0] && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {errors.zipCode._errors[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Coordinates */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-black" />
          <h3 className="text-lg font-semibold text-black">
            Location Coordinates
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            onClick={() => {
              handleMethodChange("auto");
              handleAutoFetchLocation();
            }}
            disabled={isFetchingLocation}
            className={cn(
              "flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all",
              coordinateMethod === "auto"
                ? "bg-black text-white border-black"
                : "bg-white text-black hover:bg-white",
              isFetchingLocation && "opacity-50 cursor-not-allowed",
            )}
          >
            <Navigation className="w-5 h-5" />
            <span className="font-medium">
              {isFetchingLocation ? "Fetching..." : "Auto Fetch Location"}
            </span>
          </Button>
          <Button
            type="button"
            variant={coordinateMethod === "link" ? "default" : "outline"}
            className={cn(
              "flex-1 gap-2",
              coordinateMethod === "link"
                ? "bg-black text-white"
                : "text-black",
            )}
            onClick={() => handleMethodChange("link")}
          >
            <LinkIcon className="w-4 h-4" />
            Use Map Link
          </Button>
          <Button
            type="button"
            variant={coordinateMethod === "manual" ? "default" : "outline"}
            className={cn(
              "flex-1 gap-2",
              coordinateMethod === "manual"
                ? "bg-black text-white"
                : "text-black",
            )}
            onClick={() => handleMethodChange("manual")}
          >
            <Crosshair className="w-4 h-4" />
            Manual Entry
          </Button>
        </div>
        {coordinateMethod === "auto" && (
          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
              <Navigation className="w-4 h-4" /> Auto Location
            </div>
            {extractionStatus !== "idle" && (
              <div
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg text-sm font-medium",
                  extractionStatus === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                )}
              >
                {extractionStatus === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {extractionMessage}
              </div>
            )}
            {address.latitude && address.longitude && (
              <div className="bg-white border border-green-300 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Latitude:</strong> {address.latitude}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>Longitude:</strong> {address.longitude}
                </p>
              </div>
            )}
          </div>
        )}
        {coordinateMethod === "link" && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3">
            <Label
              htmlFor="mapLink"
              className="flex items-center gap-2 text-sm font-semibold text-black"
            >
              <LinkIcon className="w-4 h-4" /> Google Maps Link
            </Label>
            <Input
              id="mapLink"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.google.com/?q=26.9124,75.7873"
              className="h-10 border-blue-300 focus:border-blue-500"
            />
            {extractionStatus !== "idle" && (
              <div
                className={cn(
                  "flex items-center gap-2 p-2 text-sm rounded",
                  extractionStatus === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800",
                )}
              >
                {extractionStatus === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {extractionMessage}
              </div>
            )}
          </div>
        )}

        {coordinateMethod === "manual" && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="latitude"
                  className="flex items-center gap-2 text-sm font-semibold text-black mb-1"
                >
                  <Navigation className="w-4 h-4" /> Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={address.latitude || ""}
                  onChange={(e) =>
                    handleFieldChange("latitude", e.target.value)
                  }
                  placeholder="26.9124"
                  className={cn(
                    "h-10 border-gray-300 focus:border-black",
                    errors?.latitude && "border-red-500 focus:border-red-600",
                  )}
                />
                {errors?.latitude?._errors[0] && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.latitude._errors[0]}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="longitude"
                  className="flex items-center gap-2 text-sm font-semibold text-black mb-1"
                >
                  <Navigation className="w-4 h-4" /> Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={address.longitude || ""}
                  onChange={(e) =>
                    handleFieldChange("longitude", e.target.value)
                  }
                  placeholder="75.7873"
                  className={cn(
                    "h-10 border-gray-300 focus:border-black",
                    errors?.longitude && "border-red-500 focus:border-red-600",
                  )}
                />
                {errors?.longitude?._errors[0] && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errors.longitude._errors[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
