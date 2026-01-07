import { useEffect, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import {
  getAllCategory,
  getAllDestinationType,
  getAllPropertyType,
  createProperty,
  updatePropertyById,
  uploadImages
} from "../api/create/propertyinfo";
import { cn } from "@/lib/utils";
import { getPropertyDetails } from "../api/show/propertyDetails"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadModal from "../ImageUploadModal";
import {
  ArrowRight,
  FileText,
  Building2,
  Mail,
  Phone,
  Tag,
  House,
  // MapPin,
  Camera,
  Upload,
  ArrowLeft,
  X,
} from "lucide-react";

// Type Definitions
import type {
  IDestinationType,
  IPropertyCategory,
  IPropertyDetails,
  IPropertyType,
} from "./types/types";
import Loader from "@/components/Loader/Loader";
import { useSearchParams } from "react-router-dom";

// Zod Validation Schema
const propertyInfoSchema = z.object({
  propertyName: z.string().min(3, "Property name must be at least 3 characters long."),
  propertyEmail: z.string().email("Please enter a valid email address."),
  propertyContact: z.string().min(10, "Please enter a valid contact number.").max(15),
  description: z.string().min(1, "Description must be at least 20 characters long.").max(5000, "Description cannot exceed 500 characters."),
  propertyCategory: z.object({
    masterCategory: z.object({
      id: z.string().min(1, "Please select a property category."),
      categoryName: z.string(),
      categoryDescription: z.string()
    })
  }),
  propertyType: z.object({
    masterPropertyType: z.object({
      id: z.string().min(1, "Please select a property type."),
      propertyTypeName: z.string(),
      propertyTypeDescription: z.string()
    })
  }),
  destinationType: z.object({
    masterDestinationType: z.object({
      id: z.string().min(1, "Please select a destination type."),
      destinationTypeName: z.string(),
      destinationDescription: z.string()
    })
  }),
  image: z.array(z.string()).min(1, "Please upload at least one image."),
});

type FormErrors = z.inferFormattedError<typeof propertyInfoSchema>;

export default function PropertyInfo() {
  // Get required state and functions from the context
  const { propertyId, next, setPropertyIdAndUrl, markStepAsCompleted } = usePropertyForm();

  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    propertyName: "",
    description: "",
    propertyEmail: "",
    destinationType: { masterDestinationType: { id: "39b60d48-74a0-46a5-9cad-bb178de4cbc3", destinationTypeName: "Villa", destinationDescription: "A private luxury house, often with a garden, pool, and exclusive amenities, ideal for families or groups" } },
    propertyCategory: { masterCategory: { id: "", categoryName: "", categoryDescription: "" } },
    propertyContact: "",
    propertyType: { masterPropertyType: { id: "", propertyTypeName: "", propertyTypeDescription: "" } },
    image: [],
  });
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<IPropertyCategory[]>([]);
  const [destinationTypes, setDestinationTypes] = useState<IDestinationType[]>([]);

  // State for UI feedback
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // This component's own "update" mode tracker
  const [isExistingData, setIsExistingData] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [searchParams] = useSearchParams();
  const creationId = searchParams.get("creationId");
  // --- DATA FETCHING ---
  // Effect to fetch dropdown data once on mount
  useEffect(() => {
    const fetchManagementDetails = async () => {
      try {
        const [categoryRes, destRes, typeRes] = await Promise.all([
          getAllCategory(),
          getAllDestinationType(),
          getAllPropertyType(),
        ]);
        // console.log(categoryRes.data, destRes.data, typeRes.data);
        if (categoryRes.success) setPropertyCategories(categoryRes.data);
        if (destRes.success) setDestinationTypes(destRes.data);
        if (typeRes.success) setPropertyTypes(typeRes.data);
      } catch (error: any) {
        toast.error("Failed to load property options.");
      }
    };
    fetchManagementDetails();
  }, []);

  // Effect to fetch existing property details if propertyId exists
  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) {
        setIsExistingData(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getPropertyDetails(propertyId);
        if (response.success && response.data) {
          // console.log(response.data.propertyCategory);
          setPropertyDetails({
            ...response.data,
            // Ensure nested objects are not null
            propertyCategory: {
              masterCategory: {
                id: response.data.propertyCategory?.masterCategory?.id || response.data.propertyCategory?.masterCategoryId || "",
                categoryName: response.data.propertyCategory?.masterCategory?.categoryName || "",
                categoryDescription: response.data.propertyCategory?.masterCategory?.categoryDescription || "",
              }
            },
            propertyType: {
              masterPropertyType: {
                id: response.data.propertyType?.masterPropertyType?.id || response.data.propertyType?.masterPropertyTypeId || "",
                propertyTypeName: response.data.propertyType?.masterPropertyType?.propertyTypeName || "",
                propertyTypeDescription: response.data.propertyType?.masterPropertyType?.propertyTypeDescription || "",
              }
            },
            destinationType: {
              masterDestinationType: {
                id:  "39b60d48-74a0-46a5-9cad-bb178de4cbc3",
                destinationTypeName:  "Villa",
                destinationDescription:  "A private luxury house, often with a garden, pool, and exclusive amenities, ideal for families or groups.",
              }
            },
            image: response.data.image || [],
          });
          setIsExistingData(true);
          toast.success("Loaded existing property information.");
        } else {
          toast.error(response.message || "Could not find property details.");
          setIsExistingData(false);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch property details");
        setIsExistingData(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  const handleInputChange = (field: keyof IPropertyDetails, value: any) => {
    setPropertyDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (fieldName: "propertyCategory" | "propertyType" | "destinationType", selectedValue: string) => {
    if (fieldName === "propertyCategory") {
      const selectedObject = propertyCategories.find((cat) => cat.id === selectedValue);
      if (selectedObject) {
        setPropertyDetails((prev) => ({
          ...prev,
          propertyCategory: {
            masterCategory: {
              id: selectedObject.id,
              categoryName: selectedObject.categoryName,
              categoryDescription: selectedObject.categoryDescription
            }
          }
        }));
      }
    } else if (fieldName === "propertyType") {
      const selectedObject = propertyTypes.find((type) => type.id === selectedValue);
      if (selectedObject) {
        setPropertyDetails((prev) => ({
          ...prev,
          propertyType: {
            masterPropertyType: {
              id: selectedObject.id,
              propertyTypeName: selectedObject.propertyTypeName,
              propertyTypeDescription: selectedObject.propertyTypeDescription
            }
          }
        }));
      }
    } else {
      const selectedObject = destinationTypes.find((dest) => dest.id === selectedValue);
      if (selectedObject) {
        setPropertyDetails((prev) => ({
          ...prev,
          destinationType: {
            masterDestinationType: {
              id: selectedObject.id,
              destinationTypeName: selectedObject.destinationTypeName,
              destinationDescription: selectedObject.destinationDescription
            }
          }
        }));
      }
    }
  };

  const handleUploadSuccess = (uploadedImageUrls: string[]) => {
    setPropertyDetails((prev) => ({ ...prev, image: [...prev.image, ...uploadedImageUrls] }));
    setModalOpen(false);
  };

  const handleSave = async () => {
    setErrors(null);
    const result = propertyInfoSchema.safeParse(propertyDetails);

    if (!result.success) {
      // console.log(result)
      setErrors(result.error.format());
      toast.error("Please fix the errors before continuing.");
      return;
    }

    setIsSaving(true);
    try {
      let response;
      // KEY CHANGE: Use internal state to decide which API to call
      if (isExistingData) {
        // console.log(result.data)
        response = await updatePropertyById(propertyId!, result.data);
      } else {
        response = await createProperty(result.data, creationId!);
        // If creating, we get a new ID back that we must set in the context
        if (response.success && response.data.id) {
          // console.log("response", response.data)
          setPropertyIdAndUrl(response.data.id);
        }
      }

      if (response.success) {
        toast.success(`Property ${isExistingData ? 'updated' : 'created'} successfully!`);
        markStepAsCompleted(); // Mark this step as done
        next(); // Proceed to the next step
      } else {
        toast.error(response.message || "Failed to save property.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
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
  if (isSaving) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Saving Property Details" />
      </div>
    );
  }
  function handleImageRemove(index: number): void {
    propertyDetails.image.splice(index, 1);
    setPropertyDetails({ ...propertyDetails });
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 max-w-7xl mx-auto ">
        <div className="p-8 sm:p-12">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Property Information
              </h2>
            </div>
            {/* Basic Contact Information Section */}
            <div className="bg-gray-50 rounded-2xl py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <Building2 className="w-4 h-4" /> Property Name *
                  </Label>
                  <Input
                    id="name"
                    value={propertyDetails.propertyName}
                    onChange={(e) =>
                      handleInputChange("propertyName", e.target.value)
                    }
                    placeholder="Enter your property name"
                    className={cn(
                      "h-12 border-2 transition-all duration-300 border-gray-300 focus:border-black hover:border-gray-400 focus:outline-none focus:ring-0",
                      errors?.propertyName &&
                      "border-red-500 focus:border-red-600"
                    )}
                  />
                  {errors?.propertyName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.propertyName._errors[0]}
                    </p>
                  )}
                </div>

                <div className="group">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <Mail className="w-4 h-4" /> Property Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={propertyDetails.propertyEmail}
                    onChange={(e) =>
                      handleInputChange("propertyEmail", e.target.value)
                    }
                    placeholder="contact@yourproperty.com"
                    className={cn(
                      "h-12 border-2 transition-all duration-300 border-gray-300 focus:border-black hover:border-gray-400 focus:outline-none focus:ring-0",
                      errors?.propertyEmail &&
                      "border-red-500 focus:border-red-600"
                    )}
                  />
                  {errors?.propertyEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.propertyEmail._errors[0]}
                    </p>
                  )}
                </div>

                <div className="group">
                  <Label
                    htmlFor="contact"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <Phone className="w-4 h-4" /> Property Contact *
                  </Label>
                  <Input
                    id="contact"
                    type="tel"
                    value={propertyDetails.propertyContact}
                    onChange={(e) =>
                      handleInputChange("propertyContact", e.target.value)
                    }
                    placeholder="+91 9876543210"
                    className={cn(
                      "h-12 border-2 transition-all duration-300 border-gray-300 focus:border-black hover:border-gray-400 focus:outline-none focus:ring-0",
                      errors?.propertyContact &&
                      "border-red-500 focus:border-red-600"
                    )}
                  />
                  {errors?.propertyContact && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.propertyContact._errors[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Classification Section */}
            <div className="bg-gray-50 rounded-2xl py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Classification</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="group">
                  <Label
                    htmlFor="propertyCategory"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <Tag className="w-4 h-4" /> Property Category *
                  </Label>
                  <select
                    id="propertyCategory"
                    value={propertyDetails.propertyCategory?.masterCategory.id || ""}
                    onChange={(e) =>
                      handleSelectChange("propertyCategory", e.target.value)
                    }
                    className={cn(
                      "w-full h-12 border-2 rounded-lg px-4 text-gray-900 bg-white appearance-none cursor-pointer transition-all duration-300 border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none focus:ring-0",
                      errors?.propertyCategory &&
                      "border-red-500 focus:border-red-600"
                    )}
                  >
                    <option value="" disabled>
                      Choose a category
                    </option>
                    {propertyCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  {errors?.propertyCategory?.masterCategory?.id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.propertyCategory.masterCategory.id._errors[0]}
                    </p>
                  )}
                </div>

                <div className="group">
                  <Label
                    htmlFor="propertyType"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <House className="w-4 h-4" /> Property Type *
                  </Label>
                  <select
                    id="propertyType"
                    value={propertyDetails.propertyType?.masterPropertyType.id || ""}
                    onChange={(e) =>
                      handleSelectChange("propertyType", e.target.value)
                    }
                    className={cn(
                      "w-full h-12 border-2 rounded-lg px-4 text-gray-900 bg-white appearance-none cursor-pointer transition-all duration-300 border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none focus:ring-0",
                      errors?.propertyType &&
                      "border-red-500 focus:border-red-600"
                    )}
                  >
                    <option value="" disabled>
                      Select property type
                    </option>
                    {propertyTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.propertyTypeName}
                      </option>
                    ))}
                  </select>
                  {errors?.propertyType?.masterPropertyType?.id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.propertyType.masterPropertyType.id._errors[0]}
                    </p>
                  )}
                </div>

                {/* <div className="group">
                  <Label
                    htmlFor="destinationType"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <MapPin className="w-4 h-4" /> Destination Type *
                  </Label>
                  <select
                    id="destinationType"
                    value={propertyDetails.destinationType?.masterDestinationType?.id || ""}
                    onChange={(e) =>
                      handleSelectChange("destinationType", e.target.value)
                    }
                    className={cn(
                      "w-full h-12 border-2 rounded-lg px-4 text-gray-900 bg-white appearance-none cursor-pointer transition-all duration-300 border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none focus:ring-0",
                      errors?.destinationType &&
                      "border-red-500 focus:border-red-600"
                    )}
                  >
                    <option value="" disabled>
                      Choose destination type
                    </option>
                    {destinationTypes.map((dest) => (
                      <option key={dest.id} value={dest.id}>
                        {dest.destinationTypeName}
                      </option>
                    ))}
                  </select>
                  {errors?.destinationType?.masterDestinationType?.id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.destinationType.masterDestinationType.id._errors[0]}
                    </p>
                  )}
                </div> */}
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                <Camera className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Property Images *
                </h2>
                <p className="text-sm text-gray-600">
                  Showcase your property with photos
                </p>
              </div>
            </div>
            <div
              className={cn(
                "bg-gray-50 rounded-2xl p-4 sm:p-6",
                errors?.image && "border-2 border-red-500"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Images
                  </h3>
                  <p className="text-sm text-gray-600">
                    {propertyDetails.image.length > 0
                      ? `${propertyDetails.image.length} image(s) added`
                      : "No image added yet"}
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-black hover:bg-gray-800 text-white"
                  onClick={() => setModalOpen(true)}
                >
                  {propertyDetails.image.length > 0 ? (
                    <Camera className="w-5 h-5 mr-2" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {propertyDetails.image.length > 0
                    ? "Edit/Add Images"
                    : "Add Images"}
                </Button>
              </div>
              {propertyDetails.image.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                  {propertyDetails.image.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-200"
                    >
                      <Button
                        type="button"
                        className="absolute bg-white hover:bg-gray-200 h-8 w-8 rounded-full right-0 p-0 shadow"
                        onClick={() => handleImageRemove(index)}
                      >
                        <X className="h-4 w-4 m-0 text-red-500 " />
                      </Button>
                      <img
                        src={imgUrl}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors?.image && (
              <p className="text-sm text-red-600 mt-2">
                {errors.image._errors[0]}
              </p>
            )}
          </div>

          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Property Description *
                </h2>
                <p className="text-sm text-gray-600">
                  Tell guests what makes your property special
                </p>
              </div>
            </div>
            <Textarea
              id="description"
              value={propertyDetails.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your property's unique features..."
              rows={6}
              className={cn(
                "border-2 transition-all duration-300 resize-none border-gray-300 focus:border-black hover:border-gray-400 focus:outline-none focus:ring-0",
                errors?.description && "border-red-500 focus:border-red-600"
              )}
            />
            <div className="flex justify-between items-center mt-2">
              {errors?.description ? (
                <p className="text-sm text-red-600">
                  {errors.description._errors[0]}
                </p>
              ) : (
                <div></div>
              )}
              <p
                className={`text-xs ml-auto ${propertyDetails.description?.length > 5000
                  ? "text-red-600"
                  : "text-gray-500"
                  }`}
              >
                {propertyDetails.description?.length || 0}/5000 characters
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-gray-200">
            <div>
              <Button
                disabled
                className="px-8 py-3 w-full sm:w-auto bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Previous
              </Button>
            </div>
            <Button
              onClick={handleSave}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 w-full sm:w-auto"
            >
              Continue to Next Step <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        uploadImages={uploadImages}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
