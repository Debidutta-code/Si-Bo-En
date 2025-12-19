import { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";
import { type IPropertyDetails } from "../types/types";
import { getPropertyDetails } from "../api/show/propertyDetails";
import { Button } from "../../ui/button";
import { PenTool, X } from "lucide-react";
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
export default function PropertyDetails({
  propertyId,
}: {
  propertyId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    // id: "",
    propertyName: "",
    description: "",
    propertyEmail: "",
    destinationType: {
      masterDestinationType:{

        id: "",
        destinationDescription: "",
        destinationTypeName: "",
      }
    },
    propertyCategory: {
      masterCategory:{

        id: "",
        categoryName: "",
        categoryDescription: "",
      }
    },
    propertyContact: "",
    propertyType: {
      masterPropertyType:{

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
    try {
      const response = await getPropertyDetails(propertyId);
      if (response.success) {
        const data = response.data;
        console.log(data);
        setPropertyDetails({
          // id: data.id,
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
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };
  const updateDetails = async (
    propertyId: string,
    payload: IPropertyDetails
  ) => {
    setLoading(true)
    try {
      
      const response = await updatePropertyById(propertyId, payload);
      if (response.success) {
        toast.success("Property Details Updated successfully");
      } else {
        toast.error(response.message || "Failed to Update Property Details");
      }
    } catch (error) {
      toast.error("Failed to Update Property please try again letter")
    }finally{
      setLoading(false)
    }
  };
  if (loading) {
    return <Loader text="Loading Property Details" />;
  }

  return (
    <div className="bg-white text-black mx-auto font-sans w-11/12 my-6">
      <div className="border-b border-gray-300 pb-4 mb-6">
        <div className="flex w-full justify-between">
          <h1 className="text-xl font-bold">{propertyDetails.propertyName}</h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="h-8 w-20 sm:w-24">
                <PenTool className="h-4 mx-1" />
                <span className="text-xs">Edit</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <AlertDialogHeader>
                <div className="flex w-full justify-between">
                <AlertDialogTitle>Update Property Details</AlertDialogTitle>
                <AlertDialogCancel className="rounded-full h-10 w-10 p-0"><X className="h-4 w-4 " /></AlertDialogCancel>
                </div>
                <PropertyInfo
                  property={propertyDetails}
                  modifyPropertyDetails={setPropertyDetails}
                  isLoading={loading}
                />
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    updateDetails(propertyId, propertyDetails);
                  }}
                >
                  {loading
                    ? "Updating Property Details..."
                    : "Update Property Details"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <ExpandableDescription description={propertyDetails.description} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Contact and Rating Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Contact & Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-700">Email:</span>
              <span>{propertyDetails.propertyEmail}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-700">Contact:</span>
              <span>{propertyDetails.propertyContact}</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Property Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-700">Property Type:</span>
              <span>{propertyDetails.propertyType?.masterPropertyType?.propertyTypeName}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-700">Category:</span>
              <span>{propertyDetails.propertyCategory?.masterCategory?.categoryName}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-medium text-gray-700">Destination:</span>
              <span>
                {propertyDetails.destinationType?.masterDestinationType?.destinationTypeName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
