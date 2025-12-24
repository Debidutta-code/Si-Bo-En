"use client";

import { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";
import { type IPropertyDetails } from "../types/types";
import { getPropertyDetails } from "../api/show/propertyDetails";
import { Button } from "../../ui/button";
import { PenTool, X, AlertCircle, CheckCircle, Mail, Phone, MapPin, Tag, House } from "lucide-react";
import ExpandableDescription from "@/components/ExplandableDescription";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PropertyInfo from "@/components/property/update/PropertyInfo";
import { updatePropertyById } from "../api/create/propertyinfo";
import { Card, CardContent } from "@/components/ui/card";

export default function PropertyDetails({
  propertyId,
}: {
  propertyId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    propertyName: "",
    description: "",
    propertyEmail: "",
    destinationType: {
      masterDestinationType: {
        id: "",
        destinationDescription: "",
        destinationTypeName: "",
      }
    },
    propertyCategory: {
      masterCategory: {
        id: "",
        categoryName: "",
        categoryDescription: "",
      }
    },
    propertyContact: "",
    propertyType: {
      masterPropertyType: {
        id: "",
        propertyTypeDescription: "",
        propertyTypeName: "",
      }
    },
    image: [],
  });

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchPropertyDetails(propertyId);
  }, [propertyId]);

  const fetchPropertyDetails = async (propertyId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPropertyDetails(propertyId);
      if (response.success) {
        const data = response.data;
        setPropertyDetails({
          propertyName: data.propertyName,
          description: data.description,
          destinationType: data.destinationType,
          propertyCategory: data.propertyCategory,
          propertyContact: data.propertyContact,
          propertyEmail: data.propertyEmail,
          propertyType: data.propertyType,
          image: data.image,
        });
      } else {
        throw new Error(response.message || "Failed to fetch property details");
      }
    } catch (error: any) {
      setError(error?.message || "Failed to fetch property details");
      toast.error(error?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };

  const updateDetails = async (
    propertyId: string,
    payload: IPropertyDetails
  ) => {
    setIsUpdating(true);
    try {
      const response = await updatePropertyById(propertyId, payload);
      if (response.success) {
        toast.success("Property Details Updated successfully");
        setPropertyDetails(payload);
      } else {
        throw new Error(response.message || "Failed to Update Property Details");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to Update Property please try again later");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Loader text="Loading Property Details" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Property Details</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => fetchPropertyDetails(propertyId)} size="sm">
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} size="sm">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {propertyDetails.propertyName}
              </h1>
              <span className="px-3 py-1 bg-success/10 text-success-700 text-xs font-semibold rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
              {propertyDetails.propertyCategory?.masterCategory?.categoryName && (
                <span className="px-3 py-1 bg-primary/10 text-primary-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {propertyDetails.propertyCategory.masterCategory.categoryName}
                </span>
              )}
            </div>
            <ExpandableDescription description={propertyDetails.description} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="ml-4 shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90">
                <PenTool className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <AlertDialogHeader>
                <div className="flex w-full justify-between items-center">
                  <AlertDialogTitle className="text-xl font-semibold">
                    Update Property Details
                  </AlertDialogTitle>
                  <AlertDialogCancel className="rounded-full h-10 w-10 p-0 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </AlertDialogCancel>
                </div>
                <PropertyInfo
                  property={propertyDetails}
                  modifyPropertyDetails={setPropertyDetails}
                  isLoading={isUpdating}
                />
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="mt-0" disabled={isUpdating}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    updateDetails(propertyId, propertyDetails);
                  }}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Property Details"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact & Details Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Contact & Details</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  Email
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyEmail || "Not provided"}
                </span>
              </div>
              
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  Contact
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyContact || "Not provided"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Information Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <House className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <House className="h-4 w-4 text-gray-400" />
                  Property Type
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyType?.masterPropertyType?.propertyTypeName || "Not specified"}
                </span>
              </div>
              
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  Category
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.propertyCategory?.masterCategory?.categoryName || "Not specified"}
                </span>
              </div>
              
              <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  Destination
                </span>
                <span className="text-sm text-gray-900 font-medium text-right">
                  {propertyDetails.destinationType?.masterDestinationType?.destinationTypeName || "Not specified"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}