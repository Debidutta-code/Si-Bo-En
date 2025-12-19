import { useEffect, useState } from "react";
import { type IPropertyAddress } from "../types/types";
import { getPropertyAddress } from "../api/show/propertyAddress";
import Loader from "../../Loader/Loader";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../../ui/button";
import { PenTool, X } from "lucide-react";
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
import UpdatePropertyAddress from "../update/PropertyAddress";
import { updatePropertyAddress } from "../api/create/propertyAddress";
import { getCountryISO, getStateISO } from "@/lib/geoUtils";
interface PropertyId {
  propertyId: string;
}

export default function PropertyAddress({ propertyId }: PropertyId) {
  const [loading, setLoading] = useState(true);
  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    landmark: "",
    latitude: "",
    longitude: "",
    location: "",
  });

  const fetchPropertyAddress = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await getPropertyAddress(propertyId);
      if (response.success) {
        const data = response.data;
        setPropertyAddress({
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          country: data.country,
          state: data.state,
          city: data.city,
          zipCode: data.zipCode,
          landmark: data.landmark,
          latitude: data.latitude,
          longitude: data.longitude,
          location: data.location,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch property Address");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchPropertyAddress(propertyId);
  }, [propertyId]);
  const updateAddress = async (
    propertyId: string,
    payload: IPropertyAddress
  ) => {
    setLoading(true);
    try {
      const countryISO = getCountryISO(payload.country);
      console.log(payload.country)
      console.log(countryISO)
      if (!countryISO) {
        toast.error("Invalid country");
        return;
      }

      // Normalize state
      const stateISO = getStateISO(payload.state, countryISO);
      console.log(stateISO);
      if (!stateISO) {
        toast.error("Invalid state for selected country");
        return;
      }

      payload = {
        ...payload,
        country: countryISO, // ← now "IN"
        state: stateISO, // ← now "OR"
        zipCode: payload.zipCode.toString() || "",
      };
      const response = await updatePropertyAddress(propertyId, payload);
      if (response.success) {
        toast.success("Property address Updated successfully");
      } else {
        toast.error(
          response?.message ||
            "Failed to Update property address,try again letter"
        );
      }
    } catch (error) {
      toast.error("Failed to update Property address");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <Loader text="Loading Property Address" />;
  }

  return (
    <div className="bg-white text-black mx-auto font-sans w-11/12 ">
      <Card className="border-none p-0">
        <CardHeader className="flex justify-between w-full flex-row">
          <CardTitle className="text-xl">Property Address</CardTitle>
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
                  <AlertDialogTitle>Update Property Address</AlertDialogTitle>
                  <AlertDialogCancel className="rounded-full h-10 w-10 p-0">
                    <X className="h-4 w-4 " />
                  </AlertDialogCancel>
                </div>
                <UpdatePropertyAddress
                  address={propertyAddress}
                  setAddress={setPropertyAddress}
                  isLoading={loading}
                />
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e: any) => {
                    e.preventDefault();
                    updateAddress(propertyId, propertyAddress);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm">
            <div className="space-y-4 ">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">
                  Address Line 1
                </h4>
                <p>{propertyAddress.addressLine1 || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">
                  Address Line 2
                </h4>
                <p>{propertyAddress.addressLine2 || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">
                  Location / Area
                </h4>
                <p>{propertyAddress.location || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Landmark</h4>
                <p>{propertyAddress.landmark || "-"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">City</h4>
                <p>{propertyAddress.city || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">
                  State & Country
                </h4>
                <p>
                  {propertyAddress.state || "-"},{" "}
                  {propertyAddress.country || "-"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Zip Code</h4>
                <p>{propertyAddress.zipCode || "-"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">
                  Coordinates
                </h4>
                <p>
                  Lat: {propertyAddress.latitude || "-"}, Lng:{" "}
                  {propertyAddress.longitude || "-"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
