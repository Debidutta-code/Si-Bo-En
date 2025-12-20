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
  const updateAmenities=async(propertyId:string, selectedAmenities:any)=>{
    try {
      const res=await updatePropertyAmenity(propertyId, selectedAmenities);
      if(res.success){
        toast.success("Property Amenities Updated successfully")
      }else{
        toast.error(res.message||"Failed to update Amenities")
      }
    } catch (error:any) {
      toast.error(error?.message||"Failed to update the proprty amenities")
    }

  }
  return (
    <div className="bg-white text-black font-sans p-4 mx-auto">
      <Card className="shadow-none border-none md:rounded-lg">
        <CardHeader className="flex justify-between w-full flex-row">
          <CardTitle className="text-xl">Property Amenities</CardTitle>
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
                  <AlertDialogTitle>Update Property Amenities</AlertDialogTitle>
                  <AlertDialogCancel className="rounded-full h-10 w-10 p-0">
                    <X className="h-4 w-4 " />
                  </AlertDialogCancel>
                </div>
                <UpdatePropertyAminity
                  availableAmenities={propertyAmenities}
                  setSelectedAmenities={setSelectedAmenities}
                />
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e: any) => {
                    e.preventDefault();
                    updateAmenities(propertyId, selectedAmenities);
                  }}
                >
                  {loading
                    ? "Updating Property Details..."
                    : "Update Property Details"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-5gap-4 text-sm">
            {propertyAmenities.map((key) => (
              <div
                key={key}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="capitalize text-gray-800">
                  {key.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
