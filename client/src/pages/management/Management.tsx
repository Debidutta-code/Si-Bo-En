import { useState, useEffect } from "react";
import Loader from "@/components/Loader/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tag,
  Home,
  Sparkles,
  Users,
  DollarSign,
  Cable,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
  ICategory,
  IPropertyType,
  IAmenity,
  ILoyaltyGuestField,
  IPaymentIntegration,
  IMasterIntegrations,
} from "./types";
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
import MasterIntegrationsTab from "./components/MasterIntegrationsTab";

const TABS = [
  { value: "categories", label: "Categories", icon: Tag },
  { value: "property-types", label: "Property Types", icon: Home },
  { value: "property-amenities", label: "Property Amenities", icon: Sparkles },
  { value: "room-amenities", label: "Room Amenities", icon: Sparkles },
  { value: "loyalty-fields", label: "Loyalty Fields", icon: Users },
  { value: "payment-integrations", label: "Payment Integrations", icon: DollarSign },
  { value: "master-integrations", label: "Master Integrations", icon: Cable },
];

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
      const [
        catRes,
        propTypeRes,
        propAmenRes,
        roomAmenRes,
        loyaltyFieldsRes,
        masterIntegrationsRes,
        masterPaymentIntegrationRes,
      ] = await Promise.all([
        getCategoriesService(),
        getPropertyTypesService(),
        getPropertyAmenitiesService("property"),
        getRoomAmenitiesService(),
        getLoyaltyGuestFieldsService(),
        getAllMasterIntegrationsService(),
        getMasterPaymentIntegrationService(),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (propTypeRes.success) setPropertyTypes(propTypeRes.data);
      if (propAmenRes.success) setPropertyAmenities(propAmenRes.data);
      if (roomAmenRes.success) setRoomAmenities(roomAmenRes.data);
      if (loyaltyFieldsRes.success) setLoyaltyGuestFields(loyaltyFieldsRes.data);
      if (masterIntegrationsRes.success && masterIntegrationsRes.data) {
        setMasterIntegrations(masterIntegrationsRes.data);
      }
      if (masterPaymentIntegrationRes.success)
        setPaymentIntegrations(masterPaymentIntegrationRes?.data);
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
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Property Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage categories, types, and amenities for your properties
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="w-full">
        {/*
          On mobile: horizontally scrollable single row of tabs.
          On large screens: wraps into a 7-column grid.
        */}
        <TabsList
          className="
            flex w-full overflow-x-auto gap-1 rounded-lg bg-muted p-1
            lg:grid lg:grid-cols-7 lg:overflow-visible
          "
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                flex-shrink-0 flex items-center gap-1.5
                whitespace-nowrap text-xs sm:text-sm
                px-3 py-2
              "
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              {/* On very small screens show only icon; tooltip via title */}
              <span className="sm:hidden sr-only">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab label shown below tab bar on xs screens */}
        <div className="sm:hidden mt-2 px-1">
          {TABS.map(({ value, label }) => (
            <TabsContent key={value} value={value}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {label}
              </p>
            </TabsContent>
          ))}
        </div>

        <TabsContent value="categories" className="mt-4">
          <CategoriesTab categories={categories} setCategories={setCategories} />
        </TabsContent>

        <TabsContent value="property-types" className="mt-4">
          <PropertyTypesTab
            propertyTypes={propertyTypes}
            setPropertyTypes={setPropertyTypes}
          />
        </TabsContent>

        <TabsContent value="property-amenities" className="mt-4">
          <PropertyAmenitiesTab
            propertyAmenities={propertyAmenities}
            setPropertyAmenities={setPropertyAmenities}
          />
        </TabsContent>

        <TabsContent value="room-amenities" className="mt-4">
          <RoomAmenitiesTab
            roomAmenities={roomAmenities}
            setRoomAmenities={setRoomAmenities}
          />
        </TabsContent>

        <TabsContent value="loyalty-fields" className="mt-4">
          <LoyaltyFieldsTab
            loyaltyGuestFields={loyaltyGuestFields}
            setLoyaltyGuestFields={setLoyaltyGuestFields}
          />
        </TabsContent>

        <TabsContent value="payment-integrations" className="mt-4">
          <PaymentIntegrationsTab
            paymentIntegrations={paymentIntegrations}
            setPaymentIntegrations={setPaymentIntegrations}
          />
        </TabsContent>

        <TabsContent value="master-integrations" className="mt-4">
          <MasterIntegrationsTab
            masterIntegrations={masterIntegrations}
            setMasterIntegrations={setMasterIntegrations}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}