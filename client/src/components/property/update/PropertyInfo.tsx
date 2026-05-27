"use client";

import { useEffect, useState, type SetStateAction, type Dispatch } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  getAllCategory,
  getAllPropertyType,
} from "../api/create/propertyinfo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploadModal from "../ImageUploadModal";
import {
  AlertCircle,
  FileText,
  Building2,
  Mail,
  Phone,
  Tag,
  House,
  Camera,
  Upload,
  X,
} from "lucide-react";

// Type Definitions
import type {
  IPropertyCategory,
  
  IPropertyType,
} from "./types/types";
import type {IPropertyDetails} from "../types/types"
import Loader from "@/components/Loader/Loader";
import { useTranslation } from "react-i18next";

// Zod Validation Schema
const propertyInfoSchema = z.object({
  id: z.string().min(1),
  propertyName: z
    .string()
    .min(3, "Property name must be at least 3 characters long."),
  propertyEmail: z.string().email("Please enter a valid email address."),
  propertyContact: z
    .string()
    .min(10, "Contact must be at least 10 digits.")
    .max(15),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(5000, "Description cannot exceed 5000 characters."),
  propertyCategory: z.object({
    id: z.string().min(1, "Please select a property category."),
    categoryName: z.string(),
    desription: z.string(),
  }),
  propertyType: z.object({
    id: z.string().min(1, "Please select a property type."),
    propertyTypeName: z.string(),
    description: z.string(),
  }),
  image: z.array(z.string()).min(1, "Please upload at least one image."),
});

type FormErrors = z.inferFormattedError<typeof propertyInfoSchema>;

// --- MAIN COMPONENT: Optimized for AlertDialog ---
export default function PropertyInfo({
  property,
  modifyPropertyDetails,
  isLoading,
}: {
  property: IPropertyDetails;
  modifyPropertyDetails: Dispatch<SetStateAction<IPropertyDetails>>;
  isLoading:boolean
}) {
  const { t } = useTranslation();

  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [propertyCategories, setPropertyCategories] = useState<
    IPropertyCategory[]
  >([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [errors, _setErrors] = useState<FormErrors | null>(null);

  // Initialize form with property data
  useEffect(() => {
    if (property) {
      modifyPropertyDetails(property);
    }
  }, [property]);

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchManagementDetails = async () => {
      try {
        const [categoryRes,  typeRes] = await Promise.all([
          getAllCategory(),
          getAllPropertyType(),
        ]);
        if (categoryRes.success) setPropertyCategories(categoryRes.data);
        if (typeRes.success) setPropertyTypes(typeRes.data);
      } catch (error: any) {
        toast.error(t('PropertyUpdate.toast.loadOptions'));
      }
    };
    fetchManagementDetails();
  }, []);

  const handleInputChange = (field: keyof IPropertyDetails, value: any) => {
    modifyPropertyDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (
    fieldName: "propertyCategory" | "propertyType" | "destinationType",
    selectedValue: string
  ) => {
    if (fieldName === "propertyCategory") {
      const selected = propertyCategories.find((cat) => cat.id === selectedValue);
      if (!selected) return;

      modifyPropertyDetails((prev) => ({
        ...prev,
        propertyCategory: {
          masterCategory: {
            id: selected.id,
            categoryName: selected.categoryName,
            categoryDescription: (selected as any).categoryDescription ?? (selected as any).description ?? "",
          },
        },
      }));
      return;
    }

    if (fieldName === "propertyType") {
      const selected = propertyTypes.find((type) => type.id === selectedValue);
      if (!selected) return;

      modifyPropertyDetails((prev) => ({
        ...prev,
        propertyType: {
          masterPropertyType: {
            id: selected.id,
            propertyTypeName: selected.propertyTypeName,
            propertyTypeDescription:
              (selected as any).propertyTypeDescription ?? (selected as any).description ?? "",
          },
        },
      }));
      return;
    }
  };

  const handleUploadSuccess = (uploadedImageUrls: string[]) => {
    modifyPropertyDetails((prev) => ({
      ...prev,
      image: [...prev.image, ...uploadedImageUrls],
    }));
    setModalOpen(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    modifyPropertyDetails((prev) => ({
      ...prev,
      image: prev.image.filter((_, index) => index !== indexToRemove),
    }));
  };
  
  if (isLoading) {
    return <Loader text={t('PropertyUpdate.toast.loadingDetails')} />;
  }
  

  return (
    <div className="max-h-[70vh] overflow-y-auto px-1 py-2">
      {/* Section: Basic Info */}
      <div className="space-y-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            {t('PropertyUpdate.propertyInfo.title')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Name */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Building2 className="w-4 h-4" /> {t('PropertyUpdate.propertyInfo.propertyName')} *
            </Label>
            <Input
              value={property.propertyName}
              onChange={(e) =>
                handleInputChange("propertyName", e.target.value)
              }
              placeholder={t('PropertyUpdate.propertyInfo.propertyNamePlaceholder')}
              className={cn(
                "h-10 border-gray-300 focus:border-black focus:ring-0",
                errors?.propertyName && "border-red-500 focus:border-red-600"
              )}
            />
            {errors?.propertyName && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.propertyName._errors[0]}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-4 h-4" /> {t('PropertyUpdate.propertyInfo.email')} *
            </Label>
            <Input
              type="email"
              value={property.propertyEmail}
              onChange={(e) =>
                handleInputChange("propertyEmail", e.target.value)
              }
              placeholder={t('PropertyUpdate.propertyInfo.emailPlaceholder')}
              className={cn(
                "h-10 border-gray-300 focus:border-black focus:ring-0",
                errors?.propertyEmail && "border-red-500 focus:border-red-600"
              )}
            />
            {errors?.propertyEmail && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.propertyEmail._errors[0]}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Phone className="w-4 h-4" /> {t('PropertyUpdate.propertyInfo.contact')} *
            </Label>
            <Input
              type="tel"
              value={property.propertyContact}
              onChange={(e) =>
                handleInputChange("propertyContact", e.target.value)
              }
              placeholder={t('PropertyUpdate.propertyInfo.contactPlaceholder')}
              className={cn(
                "h-10 border-gray-300 focus:border-black focus:ring-0",
                errors?.propertyContact && "border-red-500 focus:border-red-600"
              )}
            />
            {errors?.propertyContact && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.propertyContact._errors[0]}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Tag className="w-4 h-4" /> {t('PropertyUpdate.propertyInfo.category')} *
            </Label>
            <select
              value={property.propertyCategory?.masterCategory?.id || ""}
              onChange={(e) =>
                handleSelectChange("propertyCategory", e.target.value)
              }
              className={cn(
                "w-full h-10 border border-gray-300 rounded-md px-3 text-gray-900 bg-white focus:border-black focus:outline-none focus:ring-0",
                errors?.propertyCategory &&
                  "border-red-500 focus:border-red-600"
              )}
            >
              <option value="" disabled>
                {t('PropertyUpdate.propertyInfo.chooseCategory')}
              </option>
              {propertyCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            {errors?.propertyCategory?.id && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.propertyCategory.id._errors[0]}
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <House className="w-4 h-4" /> {t('PropertyUpdate.propertyInfo.type')} *
            </Label>
            <select
              value={property.propertyType?.masterPropertyType?.id || ""}
              onChange={(e) =>
                handleSelectChange("propertyType", e.target.value)
              }
              className={cn(
                "w-full h-10 border border-gray-300 rounded-md px-3 text-gray-900 bg-white focus:border-black focus:outline-none focus:ring-0",
                errors?.propertyType && "border-red-500 focus:border-red-600"
              )}
            >
              <option value="" disabled>
                {t('PropertyUpdate.propertyInfo.selectType')}
              </option>
              {propertyTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.propertyTypeName}
                </option>
              ))}
            </select>
            {errors?.propertyType?.id && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.propertyType.id._errors[0]}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Section: Images */}
      <div className="mt-6 space-y-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('PropertyUpdate.propertyInfo.images')} *
            </h3>
            <p className="text-sm text-gray-600">{t('PropertyUpdate.propertyInfo.addOrEditPhotos')}</p>
          </div>
        </div>

        <div
          className={cn(
            "bg-gray-50 p-4 rounded-xl",
            errors?.image && "border border-red-500"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-sm font-medium text-gray-900">
                {t('PropertyUpdate.propertyInfo.imagesCount', { count: property.image.length })}
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalOpen(true)}
              className="bg-black text-white hover:bg-gray-800"
            >
              {property.image.length > 0 ? (
                <>
                  <Camera className="w-4 h-4 mr-1.5" /> {t('PropertyUpdate.propertyInfo.edit')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1.5" /> {t('PropertyUpdate.propertyInfo.add')}
                </>
              )}
            </Button>
          </div>

          {property.image.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {property.image.map((url, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-200 border border-gray-300 relative group hover:shadow-md transition-shadow"
                >
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Delete Button (appears on hover) */}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 
             opacity-0 group-hover:opacity-100 
             transition-all duration-200 ease-in-out
             hover:scale-110 z-10
             focus:ring-2 focus:ring-red-300"
                    onClick={() => handleRemoveImage(idx)}
                    aria-label={`Remove image ${idx + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        {errors?.image && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors.image._errors[0]}
          </p>
        )}
      </div>

      {/* Section: Description */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('PropertyUpdate.propertyInfo.description')} *
            </h3>
            <p className="text-sm text-gray-600">
              {t('PropertyUpdate.propertyInfo.describeProperty')}
            </p>
          </div>
        </div>

        <Textarea
          value={property.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder={t('PropertyUpdate.propertyInfo.placeholder')}
          rows={4}
          className={cn(
            "resize-none border-gray-300 focus:border-black focus:ring-0",
            errors?.description && "border-red-500 focus:border-red-600"
          )}
        />

        <div className="flex justify-between">
          {errors?.description ? (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.description._errors[0]}
            </p>
          ) : (
            <div />
          )}
          <p
            className={`text-xs ${
              property.description?.length > 5000
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {t('PropertyUpdate.propertyInfo.characters', { count: property.description?.length || 0 })}
          </p>
        </div>
      </div>

      {/* Modal */}
      <ImageUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        // uploadImages={uploadImages}
        onUploadSuccess={handleUploadSuccess}
      />

    </div>
  );
}
