import { useState, useEffect } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import {
  createPropertyAddress,
  getPropertyAddress,
  updatePropertyAddress,
} from "../api/create/propertyAddress";
import { cn } from "@/lib/utils";
import { useGeolocated } from "react-geolocated";

import csc, {
  type ICountry,
  type IState,
  type ICity,
} from "countries-states-cities";

// UI Components
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
  ArrowRight,
  ArrowLeft,
  X,
  Map,
  Link,
  CheckCircle,
  AlertCircle,
  Crosshair,
} from "lucide-react";
import Loader from "@/components/Loader/Loader";
// Type Definitions
import type { IPropertyAddress } from "./types/types";

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
  zipCode: z
    .string()
  ,
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type FormErrors = z.inferFormattedError<typeof propertyAddressSchema>;

export default function PropertyAddress() {
  // Get required state and functions from the context
  const { propertyId, next, previous, markStepAsCompleted } = usePropertyForm();

  // Geolocation hook
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } =
    useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: 10000,
    });

  // --- INTERNAL STATE MANAGEMENT ---
  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "IN",
    landmark: "",
    latitude: "",
    location: "",
    longitude: "",
    state: "",
    zipCode: "",
  });

  const [errors, setErrors] = useState<FormErrors | null>(null);

  // UI and Logic state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_isSaving, setIsSaving] = useState<boolean>(false);
  const [isExistingData, setIsExistingData] = useState<boolean>(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  // Location dropdowns state
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  // Coordinate entry state
  const [coordinateMethod, setCoordinateMethod] = useState<"link" | "manual" | "auto">(
    "manual"
  );
  const [mapLink, setMapLink] = useState("");
  const [extractionStatus, setExtractionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [extractionMessage, setExtractionMessage] = useState("");

  useEffect(() => {
    setCountries(csc.getAllCountries());
  }, []);

  const resolveCountry = (value: string): ICountry | undefined => {
    const v = value.trim();
    if (!v) return undefined;
    const byCode = csc.getCountryByCode(v.toUpperCase());
    if (byCode) return byCode;
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
  const extractCoordinatesFromLink = (link: string): { lat: number; lng: number } | null => {
    try {
      const cleanLink = link.trim();

      // Google Maps patterns
      const googlePattern1 = /@(-?\d+\.?\d*),(-?\d+\.?\d*),/;
      const match1 = cleanLink.match(googlePattern1);
      if (match1) {
        return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
      }

      const googlePattern2 = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const match2 = cleanLink.match(googlePattern2);
      if (match2) {
        return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
      }

      const googlePattern3 = /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const match3 = cleanLink.match(googlePattern3);
      if (match3) {
        return { lat: parseFloat(match3[1]), lng: parseFloat(match3[2]) };
      }

      const googlePattern4 = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
      const match4 = cleanLink.match(googlePattern4);
      if (match4) {
        return { lat: parseFloat(match4[1]), lng: parseFloat(match4[2]) };
      }

      // Apple Maps pattern
      const applePattern = /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const appleMatch = cleanLink.match(applePattern);
      if (appleMatch) {
        return { lat: parseFloat(appleMatch[1]), lng: parseFloat(appleMatch[2]) };
      }

      // OpenStreetMap pattern
      const osmPattern = /#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/;
      const osmMatch = cleanLink.match(osmPattern);
      if (osmMatch) {
        return { lat: parseFloat(osmMatch[1]), lng: parseFloat(osmMatch[2]) };
      }

      // Generic coordinate pattern
      const genericPattern = /(-?\d+\.?\d*),(-?\d+\.?\d*)/;
      const genericMatch = cleanLink.match(genericPattern);
      if (genericMatch) {
        const lat = parseFloat(genericMatch[1]);
        const lng = parseFloat(genericMatch[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting coordinates:', error);
      return null;
    }
  };

  // Auto-extract coordinates when map link changes
  useEffect(() => {
    if (coordinateMethod === 'link' && mapLink.trim()) {
      const coordinates = extractCoordinatesFromLink(mapLink);

      if (coordinates) {
        setPropertyAddress(prev => ({
          ...prev,
          latitude: coordinates.lat.toString(),
          longitude: coordinates.lng.toString()
        }));

        setExtractionStatus('success');
        setExtractionMessage(`Coordinates extracted: (${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`);
      } else {
        setExtractionStatus('error');
        setExtractionMessage('Could not extract coordinates from this link');
        // Clear coordinates if extraction fails
        setPropertyAddress(prev => ({
          ...prev,
          latitude: "",
          longitude: ""
        }));
      }
    } else if (coordinateMethod === 'link' && !mapLink.trim()) {
      setExtractionStatus('idle');
      setExtractionMessage('');
      setPropertyAddress(prev => ({
        ...prev,
        latitude: "",
        longitude: ""
      }));
    }
  }, [mapLink, coordinateMethod]);


  const handleMethodChange = (method: "link" | "manual" | "auto") => {
    setCoordinateMethod(method);
    setMapLink("");
    setExtractionStatus("idle");
    setExtractionMessage("");
    if (method === "link") {
      setPropertyAddress((prev) => ({ ...prev, latitude: "", longitude: "" }));
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
      setPropertyAddress(prev => ({
        ...prev,
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString()
      }));

      setExtractionStatus("success");
      setExtractionMessage(`Location fetched: (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`);
      setIsFetchingLocation(false);
    }
  }, [coords, coordinateMethod, isFetchingLocation]);
  useEffect(() => {
    const fetchAddressData = async () => {
      if (!propertyId) {
        toast.error("Please complete Property Information first.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getPropertyAddress(propertyId);
        if (response.success && response.data) {
        
          setPropertyAddress(response.data);
          setPropertyAddress({
            ...propertyAddress,
            zipCode: response.data.zipCode.toString(),
            addressLine1: response.data.addressLine1,
            addressLine2: response.data.addressLine2,
            city: response.data.city,
            country: response.data.country || "",
            state: response.data.state || "",
            landmark: response.data.landmark,
            location: response.data.location,
            latitude: response.data.latitude.toString(),
            longitude: response.data.longitude.toString()
          });
          setIsExistingData(true);
          // toast.success("Loaded existing address.");
        } else {
          setIsExistingData(false); // No address found, so we are in "create" mode.
        }
      } catch (error) {
        toast.error("Could not fetch address details.");
        setIsExistingData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddressData();
  }, [propertyId]);

  useEffect(() => {
    if (propertyAddress.country) {
      const country = resolveCountry(propertyAddress.country);
      setStates(country ? csc.getStatesOfCountry(country.id) : []);
      setCities([]);
    }
  }, [propertyAddress.country]);

  useEffect(() => {
    if (propertyAddress.country && propertyAddress.state) {
      const country = resolveCountry(propertyAddress.country);
      const state = country
        ? resolveState(country.id, propertyAddress.state)
        : undefined;
      setCities(state ? csc.getCitiesOfState(state.id) : []);
    }
  }, [propertyAddress.country, propertyAddress.state]);

  const handleFieldChange = (field: keyof IPropertyAddress, value: string) => {
    if (field === "country") {
      setPropertyAddress((prev) => ({
        ...prev,
        country: value,
        state: "",
        city: "",
      }));
    } else if (field === "state") {
      setPropertyAddress((prev) => ({ ...prev, state: value, city: "" }));
    } else {
      setPropertyAddress((prev) => ({ ...prev, [field]: value }));
    }

    if (errors && (errors as any)[field]) {
      setErrors((prevErrors) => {
        if (!prevErrors) return null;
        const newErrors = { ...prevErrors };
        delete (newErrors as any)[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setErrors(null);

    const result = propertyAddressSchema.safeParse(propertyAddress);
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please fix the errors before continuing.");
      return;
    }

    setIsSaving(true);
    const finalDataToSubmit = {
      ...propertyAddress,
      country: propertyAddress.country,
      state: propertyAddress.state,
      zipCode: propertyAddress.zipCode,
      latitude: propertyAddress.latitude,
      longitude: propertyAddress.longitude
    };

    try {
      let response;
      if (isExistingData) {
        response = await updatePropertyAddress(propertyId!, finalDataToSubmit);
      } else {
        response = await createPropertyAddress(propertyId!, finalDataToSubmit);
      }

      if (response.success) {
        toast.success(
          `Address ${isExistingData ? "updated" : "saved"} successfully!`
        );
        setIsExistingData(true);
        markStepAsCompleted(); // Mark this step as done
        next(); // Proceed to the next step
      } else {
        toast.error(response.message || "Failed to save address.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while saving the address.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Loading Your Properties" />
      </div>
    );
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-white">
      <div className="bg-white overflow-hidden">
        <div className="sm:p-12 p-4">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 text-black bg-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Property Address
                </h2>
                <p className="text-sm text-gray-600">
                  Help guests find your exact location
                </p>
              </div>
            </div>
          </div>

          {/* Street Address */}
          <div className="mb-12">
            <div className="space-y-6">
              <div className="group">
                <Label
                  htmlFor="addressLine1"
                  className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                >
                  <Home className="w-4 h-4" /> Address Line 1 *
                </Label>
                <Input
                  id="addressLine1"
                  value={propertyAddress.addressLine1}
                  onChange={(e) =>
                    handleFieldChange("addressLine1", e.target.value)
                  }
                  placeholder="Street number and name"
                  className={cn(
                    "h-12 border-2",
                    errors?.addressLine1
                      ? "border-red-500"
                      : "border-gray-400 focus:border-black"
                  )}
                />
                {errors?.addressLine1?._errors[0] && (
                  <p className="text-red-500 text-sm mt-2">
                    <X className="inline w-4 h-4 mr-1" />
                    {errors.addressLine1._errors[0]}
                  </p>
                )}
              </div>
              <div className="group">
                <Label
                  htmlFor="addressLine2"
                  className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                >
                  <Home className="w-4 h-4" /> Address Line 2
                </Label>
                <Input
                  id="addressLine2"
                  value={propertyAddress.addressLine2}
                  onChange={(e) =>
                    handleFieldChange("addressLine2", e.target.value)
                  }
                  placeholder="Additional address info (e.g., Near Hawa Mahal)"
                  className="h-12 border-2 border-gray-400 focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="mb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="group">
                  <Label
                    htmlFor="country"
                    className="flex items-center gap-2 text-sm font-semibold text-black mb-2 rounded-lg"
                  >
                    <Globe className="w-4 h-4" /> Country *
                  </Label>
                  <Input
                    id="country"
                    list="country-list"
                    value={propertyAddress.country}
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
                    <p className="text-red-500 text-sm mt-2">
                      <X className="inline w-4 h-4 mr-1" />
                      {errors.country._errors[0]}
                    </p>
                  )}
                </div>
                <div className="group">
                  <Label
                    htmlFor="state"
                    className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                  >
                    <MapPin className="w-4 h-4" /> State/Province *
                  </Label>
                  <Input
                    id="state"
                    list="state-list"
                    value={propertyAddress.state}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
                    disabled={!propertyAddress.country}
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
                    <p className="text-red-500 text-sm mt-2">
                      <X className="inline w-4 h-4 mr-1" />
                      {errors.state._errors[0]}
                    </p>
                  )}
                </div>
                <div className="group">
                  <Label
                    htmlFor="city"
                    className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                  >
                    <Home className="w-4 h-4" /> City *
                  </Label>
                  <Input
                    id="city"
                    list="city-list"
                    value={propertyAddress.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                    disabled={!propertyAddress.state}
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
                    <p className="text-red-500 text-sm mt-2">
                      <X className="inline w-4 h-4 mr-1" />
                      {errors.city._errors[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="group">
                  <Label
                    htmlFor="location"
                    className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                  >
                    <Navigation className="w-4 h-4" /> Area/Location *
                  </Label>
                  <Input
                    id="location"
                    value={propertyAddress.location}
                    onChange={(e) =>
                      handleFieldChange("location", e.target.value)
                    }
                    placeholder="e.g., Badi Chopar, Pink City"
                    className={cn(
                      "h-12 border-2",
                      errors?.location
                        ? "border-red-500"
                        : "border-gray-400 focus:border-black"
                    )}
                  />
                  {errors?.location?._errors[0] && (
                    <p className="text-red-500 text-sm mt-2">
                      <X className="inline w-4 h-4 mr-1" />
                      {errors.location._errors[0]}
                    </p>
                  )}
                </div>
                <div className="group">
                  <Label
                    htmlFor="landmark"
                    className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                  >
                    <Landmark className="w-4 h-4" /> Landmark *
                  </Label>
                  <Input
                    id="landmark"
                    value={propertyAddress.landmark}
                    onChange={(e) =>
                      handleFieldChange("landmark", e.target.value)
                    }
                    placeholder="e.g., Opposite City Palace Gate"
                    className="h-12 border-2 border-gray-400 focus:border-black"
                  />
                </div>
                <div className="group">
                  <Label
                    htmlFor="zipCode"
                    className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                  >
                    <Hash className="w-4 h-4" /> PIN Code *
                  </Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={propertyAddress.zipCode}
                    onChange={(e) =>
                      handleFieldChange(
                        "zipCode",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    maxLength={6}
                    placeholder="e.g., 302002"
                    className={cn(
                      "h-12 border-2",
                      errors?.zipCode
                        ? "border-red-500"
                        : "border-gray-400 focus:border-black"
                    )}
                  />
                  {errors?.zipCode?._errors[0] && (
                    <p className="text-red-500 text-sm mt-2">
                      <X className="inline w-4 h-4 mr-1" />
                      {errors.zipCode._errors[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 text-black bg-white">
                <Map className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">
                  Location Coordinates
                </h3>
                <p className="text-sm text-gray-600">
                  Set your exact location for better visibility
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                  isFetchingLocation && "opacity-50 cursor-not-allowed"
                )}
              >
                <Navigation className="w-5 h-5" />
                <span className="font-medium">
                  {isFetchingLocation ? "Fetching..." : "Auto Fetch Location"}
                </span>
              </Button>
              <Button
                onClick={() => handleMethodChange("manual")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all",
                  coordinateMethod === "manual"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black hover:bg-white"
                )}
              >
                <Crosshair className="w-5 h-5" />
                <span className="font-medium">Manual Entry</span>
              </Button>
              <Button
                onClick={() => handleMethodChange("link")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-3 px-6 py-4 border-2 transition-all",
                  coordinateMethod === "link"
                    ? "bg-black text-white border-black"
                    : "bg-white text-black hover:bg-white"
                )}
              >
                <Link className="w-5 h-5" />
                <span className="font-medium">Use Map Link</span>
              </Button>

            </div>

            {coordinateMethod === "link" && (
              <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg space-y-4">
                <Label
                  htmlFor="mapLink"
                  className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                >
                  <Link className="w-4 h-4" /> Map Link
                </Label>
                <Input
                  id="mapLink"
                  value={mapLink}
                  onChange={(e) => setMapLink(e.target.value)}
                  placeholder="Paste your Google Maps link here..."
                  className="h-12 border-2 border-blue-300 focus:border-blue-500"
                />
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
              </div>
            )}

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
                {propertyAddress.latitude && propertyAddress.longitude && (
                  <div className="bg-white border border-green-300 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Latitude:</strong> {propertyAddress.latitude}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Longitude:</strong> {propertyAddress.longitude}
                    </p>
                  </div>
                )}
              </div>
            )}

            {coordinateMethod === "manual" && (
              <div className="bg-gray-50 border-2 border-gray-200 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="latitude"
                      className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                    >
                      <Navigation className="w-4 h-4" /> Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={propertyAddress.latitude}
                      onChange={(e) =>
                        handleFieldChange("latitude", e.target.value)
                      }
                      placeholder="e.g., 26.9124"
                      className={cn(
                        "h-12 border-2",
                        errors?.latitude
                          ? "border-red-500"
                          : "border-gray-400 focus:border-black"
                      )}
                    />
                    {errors?.latitude?._errors[0] && (
                      <p className="text-red-500 text-sm mt-2">
                        <X className="inline w-4 h-4 mr-1" />
                        {errors.latitude._errors[0]}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="longitude"
                      className="flex items-center gap-2 text-sm font-semibold text-black mb-2"
                    >
                      <Navigation className="w-4 h-4" /> Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={propertyAddress.longitude}
                      onChange={(e) =>
                        handleFieldChange("longitude", e.target.value)
                      }
                      placeholder="e.g., 75.7873"
                      className={cn(
                        "h-12 border-2",
                        errors?.longitude
                          ? "border-red-500"
                          : "border-gray-400 focus:border-black"
                      )}
                    />
                    {errors?.longitude?._errors[0] && (
                      <p className="text-red-500 text-sm mt-2">
                        <X className="inline w-4 h-4 mr-1" />
                        {errors.longitude._errors[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8">
            <Button
              onClick={previous}
              variant="outline"
              className="border-2 border-black hover:bg-black hover:text-white w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Previous Step
            </Button>
            <Button
              onClick={handleSave}
              className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
            >
              Continue to Next Step <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
