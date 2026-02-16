import { useState, useEffect } from "react";
import Loader from "@/components/Loader/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Home, Sparkles, Users, 
  // Handshake,
   DollarSign, Cable } from "lucide-react";
import toast from "react-hot-toast";
import type { ICategory, IPropertyType, IAmenity, ILoyaltyGuestField, IPaymentIntegration, IMasterIntegrations } from "./types";
import {
  getCategoriesService,
  getPropertyTypesService,
  getPropertyAmenitiesService,
  getRoomAmenitiesService,
  getLoyaltyGuestFieldsService,
  getMasterPaymentIntegrationService,
} from "./services/management.services";
import { getAllMasterIntegrationsService } from "./services/integration.services";
import CategoriesTab from "./components/CategoriesTab";
import PropertyTypesTab from "./components/PropertyTypesTab";
import PropertyAmenitiesTab from "./components/PropertyAmenitiesTab";
import RoomAmenitiesTab from "./components/RoomAmenitiesTab";
import LoyaltyFieldsTab from "./components/LoyaltyFieldsTab";
import PaymentIntegrationsTab from "./components/PaymentIntegrationsTab";
// import PropertyIntegrationsTab from "./components/PropertyIntegrationsTab";
import MasterIntegrationsTab from "./components/MasterIntegrationsTab";

export default function ManagementPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [propertyAmenities, setPropertyAmenities] = useState<IAmenity[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<IAmenity[]>([]);
  const [loyaltyGuestFields, setLoyaltyGuestFields] = useState<ILoyaltyGuestField[]>([]);
  const [paymentIntegrations, setPaymentIntegrations] = useState<IPaymentIntegration[]>([]);
  const [masterIntegrations, setMasterIntegrations] = useState<IMasterIntegrations[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [catRes, propTypeRes, propAmenRes, roomAmenRes, loyaltyFieldsRes, masterIntegrationsRes,masterPaymentIntegrationRes] = await Promise.all([
        getCategoriesService(),
        getPropertyTypesService(),
        getPropertyAmenitiesService("property"),
        getRoomAmenitiesService(),
        getLoyaltyGuestFieldsService(),
        getAllMasterIntegrationsService(),
        getMasterPaymentIntegrationService()
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (propTypeRes.success) setPropertyTypes(propTypeRes.data);
      if (propAmenRes.success) setPropertyAmenities(propAmenRes.data);
      if (roomAmenRes.success) setRoomAmenities(roomAmenRes.data);

      if (loyaltyFieldsRes.success) setLoyaltyGuestFields(loyaltyFieldsRes.data);
      if (masterIntegrationsRes.success && masterIntegrationsRes.data) {
        setMasterIntegrations(masterIntegrationsRes.data);
      }
      if(masterPaymentIntegrationRes.success) setPaymentIntegrations(masterPaymentIntegrationRes?.data)
    } catch (error: any) {
      toast.error("Failed to fetch management data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text="Loading Management Data" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage categories, types, and amenities for your properties
        </p>
      </div>

      <Tabs defaultValue="categories" className="w-full h-fit">
        <TabsList className="grid w-full gap-2 lg:grid-cols-7">
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="property-types">
            <Home className="h-4 w-4 mr-2" />
            Property Types
          </TabsTrigger>
          <TabsTrigger value="property-amenities">
            <Sparkles className="h-4 w-4 mr-2" />
            Property Amenities
          </TabsTrigger>
          <TabsTrigger value="room-amenities">
            <Sparkles className="h-4 w-4 mr-2" />
            Room Amenities
          </TabsTrigger>
          <TabsTrigger value="loyalty-fields">
            <Users className="h-4 w-4 mr-2" />
            Loyalty Fields
          </TabsTrigger>
          <TabsTrigger value="payment-integrations">
            <DollarSign className="h-4 w-4 mr-2" />
            Payment Integrations
          </TabsTrigger>
          {/* <TabsTrigger value="property-integrations">
            <Handshake className="h-4 w-4 mr-2" />
            Property Integrations
          </TabsTrigger> */}
          <TabsTrigger value="master-integrations">
            <Cable className="h-4 w-4 mr-2" />
            Master Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoriesTab categories={categories} setCategories={setCategories} />
        </TabsContent>

        <TabsContent value="property-types">
          <PropertyTypesTab propertyTypes={propertyTypes} setPropertyTypes={setPropertyTypes} />
        </TabsContent>

        <TabsContent value="property-amenities">
          <PropertyAmenitiesTab 
            propertyAmenities={propertyAmenities} 
            setPropertyAmenities={setPropertyAmenities} 
          />
        </TabsContent>

        <TabsContent value="room-amenities">
          <RoomAmenitiesTab roomAmenities={roomAmenities} setRoomAmenities={setRoomAmenities} />
        </TabsContent>

        <TabsContent value="loyalty-fields">
          <LoyaltyFieldsTab 
            loyaltyGuestFields={loyaltyGuestFields} 
            setLoyaltyGuestFields={setLoyaltyGuestFields} 
          />
        </TabsContent>

        <TabsContent value="payment-integrations">
          <PaymentIntegrationsTab 
            paymentIntegrations={paymentIntegrations} 
            setPaymentIntegrations={setPaymentIntegrations} 
          />
        </TabsContent>

        {/* <TabsContent value="property-integrations">
          <PropertyIntegrationsTab 
            propertyIntegrations={propertyIntegrations} 
            setPropertyIntegrations={setPropertyIntegrations} 
          />
        </TabsContent> */}

        <TabsContent value="master-integrations">
          <MasterIntegrationsTab 
            masterIntegrations={masterIntegrations} 
            setMasterIntegrations={setMasterIntegrations} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
