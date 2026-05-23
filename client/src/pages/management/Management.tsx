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
  View,
  Bubbles,
} from "lucide-react";
import toast from "react-hot-toast";
import type {
  ICategory,
  IPropertyType,
  IAmenity,
  ILoyaltyGuestField,
  IPaymentIntegration,
  IMasterIntegrations,
  IMasterRoomView,
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
import Spa from "./components/Spa";
import { getAllRoomViews } from "./services/room-view.services";
import type { ILoader } from "../dashboard/interface";
import RoomViewTab from "./components/RoomView";
import { useTranslation } from "react-i18next";


export default function ManagementPage() {
  const { t } = useTranslation();
  const TABS = [
      { value: "categories", label: t('Management.categories'), icon: Tag },
      { value: "property-types", label: t('Management.propertyTypes'), icon: Home },
      { value: "property-amenities", label: t('Management.propertyAmenities'), icon: Sparkles },
      { value: "room-amenities", label: t('Management.roomAmenities'), icon: Sparkles },
      { value: "room-views", label: t('Management.roomViews'), icon: View },
      { value: "loyalty-fields", label: t('Management.loyaltyFields'), icon: Users },
      { value: "payment-integrations", label: t('Management.paymentIntegrations'), icon: DollarSign },
      { value: "master-integrations", label: t('Management.masterIntegrations'), icon: Cable },
    { value: "spa", label: t("Management.spa"), icon: Bubbles },
  ];

  const [loading, setLoading] = useState<ILoader> ({
    isLoading:true,
    message: t('Management.loadingData')
  });
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<IPropertyType[]>([]);
  const [propertyAmenities, setPropertyAmenities] = useState<IAmenity[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<IAmenity[]>([]);
  const [roomViews, setRoomViews] = useState<IMasterRoomView[]>([]);
  const [loyaltyGuestFields, setLoyaltyGuestFields] = useState<ILoyaltyGuestField[]>([]);
  const [paymentIntegrations, setPaymentIntegrations] = useState<IPaymentIntegration[]>([]);
  const [masterIntegrations, setMasterIntegrations] = useState<IMasterIntegrations[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading({
      isLoading: true,
      message: t('Management.loadingData')
    });
    try {
      const [
        catRes,
        propTypeRes,
        propAmenRes,
        roomAmenRes,
        loyaltyFieldsRes,
        masterIntegrationsRes,
        masterPaymentIntegrationRes,
        roomViewsRes,
      ] = await Promise.all([
        getCategoriesService(),
        getPropertyTypesService(),
        getPropertyAmenitiesService("property"),
        getRoomAmenitiesService(),
        getLoyaltyGuestFieldsService(),
        getAllMasterIntegrationsService(),
        getMasterPaymentIntegrationService(),
        getAllRoomViews(),
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
      if (roomViewsRes.success)
        setRoomViews(roomViewsRes?.data);
    } catch (error) {
      toast.error(t('Toast.failedToFetchManagementData'));
    } finally {
      setLoading({
        isLoading: false,
        message: ""
      });
    }
  };

  if (loading.isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Loader text={loading.message} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {t('Management.title')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {t('Management.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="w-full ">
        <TabsList
          className="
             w-full h-96 md:h-36 lg:h-24 overflow-x-auto gap-1 rounded-lg bg-muted p-1 grid-cols-1 md:grid-cols-3
            grid lg:grid-cols-5 overflow-visible
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
              {label}
            </TabsTrigger>
          ))}
        </TabsList>


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

        <TabsContent value="room-views" className="mt-4">
          <RoomViewTab roomViews={roomViews} setRoomViews={setRoomViews} />
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

        <TabsContent value="spa" className="mt-4">
          <Spa />
        </TabsContent>
      </Tabs>
    </div>
  );
}