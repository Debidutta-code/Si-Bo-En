import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import ImageSlider from "@/components/shared/ImageSlider";
import type { IPropertyAddress, IPropertyDetails } from "../types/types";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import PropertyAddress from "@/components/property/show/Address";
import PropertyDetails from "@/components/property/show/PropertyDetails";
import PropertyAmenities from "@/components/property/show/PropertyAmenities";
import Rooms from "@/components/property/show/Rooms";
// import RatePlans from "@/components/property/show/RatePlans";
import BankDetails from "@/components/property/show/BankDetails";
import Loader from "@/components/Loader/Loader";
import { useParams, useSearchParams } from "react-router-dom";
import { getPropertyDetails } from "@/components/property/api/show/propertyDetails";
import BackButton from "@/components/shared/BackButton";

export default function PropertyDetailsPage() {
  // const router = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyDetails, setPropertyDetails] = useState<IPropertyDetails>({
    propertyName: "",
    propertyEmail: "",
    description: "",
    destinationType: {
      masterDestinationType: {

        id: "",
        description: "",
        destinationTypeName: "",
      }
    },
    propertyCategory: {
      masterCategory: {

        id: "",
        categoryName: "",
        description: "",
      }
    },
    propertyContact: "",
    propertyRoom: [],
    propertyType: {
      masterPropertyType: {

        id: "",
        description: "",
        propertyTypeName: "",
      }
    },
    starRating: "",
    propertyCode: "",
  });

  const [propertyAddress, setPropertyAddress] = useState<IPropertyAddress>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    country: "",
    landmark: "",
    latitude: 0,
    location: "",
    longitude: 0,
    propertyId: "",
    state: "",
    zipCode: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || "property";
  });

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await getPropertyDetails(propertyId);
      // console.log(response)
      if (response.data) {
        const data = response.data;
        setPropertyDetails({
          propertyName: data.propertyName,
          propertyEmail: data.propertyEmail,
          propertyContact: data.propertyContact,
          starRating: data.starRating?.$numberDecimal || data.starRating,

          propertyCategory: data.propertyCategory,
          destinationType: data.destinationType,
          propertyType: data.propertyType,
          propertyRoom: data.propertyRoom,
          description: data.description,
          propertyCode: data.propertyCode,
        });
        // console.log("Property images", data.image)
        setPropertyImages(data.image || []);
        if (data.propertyAddress) {
          setPropertyAddress(data.propertyAddress);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to get Property details");
    } finally {
      setLoading(false);
    }
  };

  // Watch for changes in the search parameters and update active tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!propertyId) {
      toast.error("Go back and try again");
      return;
    }
    fetchPropertyDetails(propertyId);
  }, [propertyId]);
  const getFullAddress = () => {
    const parts = [
      propertyAddress.city,
      propertyAddress.state,
      propertyAddress.country,
      propertyAddress.zipCode?.toString(),
    ].filter(Boolean);

    return parts.join(", ");
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Loading Your Properties" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <BackButton/>
         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {propertyDetails.propertyName}
            </h1>
            <p className="text-sm text-gray-600 flex items-center mt-2">
              <MapPin className="h-5 w-5 mr-2" />
              {getFullAddress()}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            {propertyImages.length > 0 ? (
              <ImageSlider images={propertyImages} height="h-80" />
            ) : (
              <div className="h-80 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No images available</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            className="h-12 w-full "
            onClick={() => router(`/property/rate-plan/${propertyId}`)}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Create Rate Plan
          </Button>
          <Button className="h-12 w-full"
            onClick={() => router(`/property/rate-plan/map/${propertyId}`)}
          >
            <Package
              className="h-5 w-5 mr-2"
            />
            Rate Plan Allotment
          </Button>
          <Button className="h-12 w-full"
            onClick={() => router(`/property/inventory/${propertyId}`)}
          >
            <Building
              className="h-5 w-5 mr-2"
            />
            Create Inventory
          </Button>
        </div> */}
        {/* <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Button onClick={() => { router(`/property/policy/${propertyId}`) }} variant={"terciary"} className="text-black">Policy</Button>
            <Button onClick={() => { router(`/property/promo-code/${propertyId}`) }} variant={"terciary"} className="text-black">Promo Code</Button>
            <Button onClick={() => { router(`/property/add-on/${propertyId}`) }} variant={"terciary"} className="text-black">Add-On</Button>
            <Button onClick={() => { router(`/property/tax-system/${propertyId}`) }} variant={"terciary"} className="text-black">Tax System</Button>
        </div> */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('tab', value);
            return newParams;
          });
        }}>
          {/* <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 h-fit">
            <TabsTrigger value="property">Property Details</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="rate-plans">Rate Plans</TabsTrigger>

            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          </TabsList> */}
          <TabsContent value="property" className="space-y-6">
            <PropertyDetails propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="address">
            <PropertyAddress propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="amenities">
            <PropertyAmenities propertyId={propertyId!} />
          </TabsContent>
          <TabsContent value="rooms" className="space-y-6">
            <Rooms propertyId={propertyId!} />
          </TabsContent>
          {/* <TabsContent value="rate-plans">
            <RatePlans />
          </TabsContent> */}
          <TabsContent value="bank-details">
            <BankDetails propertyId={propertyId!} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}