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
    <Card className="w-full">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Property Address
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Complete address and location details
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <PenTool className="h-4 w-4" />
                Edit Address
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
              <AlertDialogHeader>
                <div className="flex w-full justify-between items-start">
                  <div>
                    <AlertDialogTitle className="text-xl">
                      Update Property Address
                    </AlertDialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Modify the property location information
                    </p>
                  </div>
                  <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </AlertDialogCancel>
                </div>
                <UpdatePropertyAddress
                  address={propertyAddress}
                  setAddress={setPropertyAddress}
                  isLoading={loading}
                />
              </AlertDialogHeader>
              <AlertDialogFooter className="border-t pt-4">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e: any) => {
                    e.preventDefault();
                    updateAddress(propertyId, propertyAddress);
                  }}
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Address"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Address Line 1
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.addressLine1 || (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Address Line 2
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.addressLine2 || (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Location / Area
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.location || (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Landmark
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.landmark || (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                City
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.city || (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                State & Country
              </label>
              <p className="text-base text-gray-900">
                {propertyAddress.state && propertyAddress.country ? (
                  <>
                    {propertyAddress.state}, {propertyAddress.country}
                  </>
                ) : (
                  <span className="text-gray-400 italic">Not specified</span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                Zip Code
              </label>
              <p className="text-base text-gray-900 font-mono">
                {propertyAddress.zipCode || (
                  <span className="text-gray-400 italic font-sans">
                    Not specified
                  </span>
                )}
              </p>
            </div>

            <div className="group">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                GPS Coordinates
              </label>
              <div className="flex items-center gap-3 text-sm text-gray-900 font-mono">
                {propertyAddress.latitude && propertyAddress.longitude ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">Lat:</span>
                      <span>{propertyAddress.latitude}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">Lng:</span>
                      <span>{propertyAddress.longitude}</span>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-400 italic font-sans">
                    Not specified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
