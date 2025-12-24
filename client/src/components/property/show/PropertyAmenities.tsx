import { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";
import { getPropertyAmenity } from "../api/show/propertyAmenities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PenTool,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
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
import { updatePropertyAmenity } from "../api/create/propertyAmenity";
import UpdatePropertyAminity from "../update/PropertyAmenities";
interface PropertyId {
  propertyId: string;
}


export default function PropertyAmenities({ propertyId }: PropertyId) {
  const [loading, setLoading] = useState(true);
  const [propertyAmenities, setPropertyAmenities] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<Record<string, boolean>>({});
  const fetchPropertyAmenity = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await getPropertyAmenity(propertyId);
      if (response.success) {
        const data = response.data;
        setPropertyAmenities(data);
      } else {
        toast.error(response.message);
        setPropertyAmenities([]);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch property details");
      setPropertyAmenities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchPropertyAmenity(propertyId);
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader text="Loading Property Amenities" />
      </div>
    );
  }
  const updateAmenities = async (propertyId: string, selectedAmenities: any) => {
    try {
      const res = await updatePropertyAmenity(propertyId, selectedAmenities);
      if (res.success) {
        toast.success("Property Amenities Updated successfully")
      } else {
        toast.error(res.message || "Failed to update Amenities")
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update the proprty amenities")
    }

  }
  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Property Amenities
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {propertyAmenities.length} {propertyAmenities.length === 1 ? 'amenity' : 'amenities'} available
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <PenTool className="h-4 w-4" />
                Edit Amenities
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <AlertDialogHeader>
                <div className="flex w-full justify-between items-start">
                  <div>
                    <AlertDialogTitle className="text-xl">
                      Update Property Amenities
                    </AlertDialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Select or deselect amenities for this property
                    </p>
                  </div>
                  <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </AlertDialogCancel>
                </div>
                <UpdatePropertyAminity
                  availableAmenities={propertyAmenities}
                  setSelectedAmenities={setSelectedAmenities}
                />
              </AlertDialogHeader>
              <AlertDialogFooter className="border-t pt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e: any) => {
                    e.preventDefault();
                    updateAmenities(propertyId, selectedAmenities);
                  }}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Amenities"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {propertyAmenities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {propertyAmenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
              >
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500 group-hover:bg-primary-600 transition-colors" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {amenity.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-500 font-medium mb-1">No amenities added yet</p>
            <p className="text-sm text-gray-400">
              Click "Edit Amenities" to add amenities to this property
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
