import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ILoader } from "../dashboard/interface";
import {
  createLoyaltyProgramService,
  updateLoyaltyProgramService,
  // createAdvanceLoyaltyProgramService,
  // updateAdvanceLoyaltyProgramService,
  createCreationLoyalityService,
  getLoyalityByCreationService,
  updateCreationLoyalityService
} from "./services";
import type {
  ICloyaltyProgram,
  // IAdvanceLoyaltyprogram,
  ICreationLoyality
} from "./interfaces";
import Loader from "@/components/Loader/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ImageUploadModal from "@/components/property/ImageUploadModal";
import CreateLoyaltyForm from "./components/CreateLoyaltyForm";
import DiscountsTab from "./components/DiscountsTab";
import BasicConfigTab from "./components/BasicConfigTab";
// import AdvancedConfigTab from "./components/AdvancedConfigTab";
import AddPropertyToLoyalty from "./components/AddPropertyToLoyalty";
import { fetchPropertiesByCreationIdService } from "../dashboard/services/dash.service";

interface Property {
  id: string;
  propertyCode: string;
  propertyName: string;
}

export default function Loyalty() {
  const { creationId } = useParams();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading Loyalty Configuration..."
  });

  const [creationLoyalty, setCreationLoyalty] = useState<ICreationLoyality | null>(null);
  const [hasCreationLoyalty, setHasCreationLoyalty] = useState(false);

  const [basicProgram, setBasicProgram] = useState<ICloyaltyProgram | null>(null);
  // const [advanceProgram, setAdvanceProgram] = useState<IAdvanceLoyaltyprogram | null>(null);

  const [activeTab, setActiveTab] = useState<"discounts" | "basic" | "properties">("basic");
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);

  // Creation Loyalty Form State
  const [discountType, setDiscountType] = useState<string>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");

  // Basic Configuration State
  const [logos, setLogos] = useState<string[]>([]);
  const [isBasicActive, setIsBasicActive] = useState<boolean>(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Advanced Configuration State
  // const [advanceConfig, setAdvanceConfig] = useState({
  //   activeInCorporateWeb: false,
  //   defaultLoginMode: false,
  //   allowEmailRecovery: true,
  //   allowNewRequest: true,
  //   allowNewRequestInCorporate: false,
  //   roomLimitByBooking: 1,
  //   externalRegistrationUrl: "",
  //   blockUserFieldFromForm: false
  // });

  useEffect(() => {
    if (creationId) {
      fetchLoyaltyData();
      fetchPropertiesByCreation(creationId);
    }
  }, [creationId]);

  const fetchPropertiesByCreation = async (creationId: string) => {
    try {
      const response = await fetchPropertiesByCreationIdService(creationId);
      if (response.success && response.data) {
        // Map the response to match the Property interface
        const properties: Property[] = response.data.map((prop: any) => ({
          id: prop.id,
          propertyCode: prop.code,
          propertyName: prop.name
        }));
        setAvailableProperties(properties);
      } else {
        toast.error(response.message || "Failed to fetch properties");
        setAvailableProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Failed to fetch properties");
      setAvailableProperties([]);
    }
  };

  const fetchLoyaltyData = async () => {
    if (!creationId) return;

    setLoader({ isLoading: true, message: "Loading Loyalty Configuration..." });
    try {
      const creationResponse = await getLoyalityByCreationService(creationId);

      if (creationResponse.success && creationResponse.data) {
        const data = creationResponse.data;

        // Set creation loyalty
        setCreationLoyalty(data);
        setHasCreationLoyalty(true);
        setDiscountType(data.loyaltyDiscountType);
        setDiscountValue(data.discountValue);
        setCurrencyCode(data.currencyCode || "USD");

        // Set basic program if exists
        if (data.BasicLoyaltyProgram) {
          setBasicProgram(data.BasicLoyaltyProgram as any);
          setLogos(data.BasicLoyaltyProgram.logo || []);
          setIsBasicActive(data.BasicLoyaltyProgram.isActive);
        } else {
          setBasicProgram(null);
          setLogos([]);
        }

        // Set advance program if exists
        // if (data.AdvanceLoyaltyProgram) {
        //   setAdvanceProgram(data.AdvanceLoyaltyProgram as any);
        //   setAdvanceConfig({
        //     activeInCorporateWeb: data.AdvanceLoyaltyProgram.activeInCorporateWeb,
        //     defaultLoginMode: data.AdvanceLoyaltyProgram.defaultLoginMode,
        //     allowEmailRecovery: data.AdvanceLoyaltyProgram.allowEmailRecovery,
        //     allowNewRequest: data.AdvanceLoyaltyProgram.allowNewRequest,
        //     allowNewRequestInCorporate: data.AdvanceLoyaltyProgram.allowNewRequestInCorporate,
        //     roomLimitByBooking: data.AdvanceLoyaltyProgram.roomLimitByBooking || 1,
        //     externalRegistrationUrl: data.AdvanceLoyaltyProgram.externalRegistrationUrl || "",
        //     blockUserFieldFromForm: data.AdvanceLoyaltyProgram.blockUserFieldFromForm || false
        //   });
        // } else {
        //   setAdvanceProgram(null);
        // }
      } else {
        setHasCreationLoyalty(false);
      }
    } catch (error) {
      console.error("Error fetching loyalty data:", error);
      setHasCreationLoyalty(false);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleCreateCreationLoyalty = async (data: { discountType: string; discountValue: number; currencyCode: string }) => {
    if (!creationId) return;

    if (data.discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    if (data.discountType === "percentage" && data.discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setLoader({ isLoading: true, message: "Creating Loyalty Configuration..." });
    try {
      const response = await createCreationLoyalityService({
        creationId,
        loyaltyDiscountType: data.discountType as any,
        discountValue: data.discountValue,
        currencyCode: data.currencyCode as any
      });

      if (response.success) {
        toast.success("Loyalty configuration created successfully");
        await fetchLoyaltyData();
      } else {
        toast.error(response.message || "Failed to create loyalty configuration");
      }
    } catch (error) {
      toast.error("An error occurred while creating loyalty configuration");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateDiscounts = async () => {
    if (!creationId || !creationLoyalty) return;

    if (discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    if (discountType === "percentage" && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setLoader({ isLoading: true, message: "Updating Discounts..." });
    try {
      const response = await updateCreationLoyalityService(creationLoyalty.id!, {
        loyaltyDiscountType: discountType as any,
        discountValue,
        currencyCode: currencyCode as any
      });

      if (response.success) {
        toast.success("Discounts updated successfully");
        await fetchLoyaltyData();
      } else {
        toast.error(response.message || "Failed to update discounts");
      }
    } catch (error) {
      toast.error("An error occurred while updating discounts");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleCreateBasicProgram = async () => {
    if (!creationId || !creationLoyalty) return;

    if (logos.length === 0) {
      toast.error("Please upload at least one logo");
      return;
    }

    setLoader({ isLoading: true, message: "Creating Basic Configuration..." });
    try {
      const response = await createLoyaltyProgramService({
        loyaltyProgramId: creationLoyalty.id!,
        logo: logos,
        isActive: isBasicActive
      });

      if (response.success) {
        toast.success("Basic configuration created successfully");
        await fetchLoyaltyData();
      } else {
        toast.error(response.message || "Failed to create basic configuration");
      }
    } catch (error) {
      toast.error("An error occurred while creating basic configuration");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleUpdateBasicConfig = async () => {
    if (!creationId || !creationLoyalty) return;

    if (logos.length === 0) {
      toast.error("Please upload at least one logo");
      return;
    }

    setLoader({ isLoading: true, message: "Updating Basic Configuration..." });
    try {
      const response = await updateLoyaltyProgramService(creationLoyalty.id!, {
        logo: logos,
        isActive: isBasicActive
      });

      if (response.success) {
        toast.success("Basic configuration updated successfully");
        await fetchLoyaltyData();
      } else {
        toast.error(response.message || "Failed to update configuration");
      }
    } catch (error) {
      toast.error("An error occurred while updating configuration");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  // const handleUpdateAdvanceConfig = async () => {
  //   if (!creationId || !creationLoyalty) return;

  //   setLoader({ isLoading: true, message: "Updating Advanced Configuration..." });
  //   try {
  //     let response;

  //     if (advanceProgram?.id) {
  //       // Update existing
  //       response = await updateAdvanceLoyaltyProgramService(advanceProgram.id, advanceConfig);
  //     } else {
  //       // Create new
  //       response = await createAdvanceLoyaltyProgramService({
  //         loyaltyProgramId: creationLoyalty.id!,
  //         ...advanceConfig
  //       });
  //     }

  //     if (response.success) {
  //       toast.success("Advanced configuration updated successfully");
  //       await fetchLoyaltyData();
  //     } else {
  //       toast.error(response.message || "Failed to update advanced configuration");
  //     }
  //   } catch (error) {
  //     toast.error("An error occurred while updating advanced configuration");
  //   } finally {
  //     setLoader({ isLoading: false, message: "" });
  //   }
  // };

  const handleImageUploadSuccess = (uploadedUrls: string[]) => {
    setLogos([...logos, ...uploadedUrls]);
    toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
  };

  const handleRemoveLogo = (index: number) => {
    setLogos(logos.filter((_, i) => i !== index));
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  if (!hasCreationLoyalty) {
    return (
      <CreateLoyaltyForm onSubmit={handleCreateCreationLoyalty} />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Loyalty Program Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Manage your loyalty program settings and benefits
        </p>
      </div>



      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "discounts" | "basic" | "properties")} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic">Basic Config</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>

        {/* Discounts Tab */}
        <TabsContent value="discounts" className="space-y-6">
          <DiscountsTab
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
            currencyCode={currencyCode}
            setCurrencyCode={setCurrencyCode}
            onUpdate={handleUpdateDiscounts}
          />
        </TabsContent>

        {/* Basic Configuration Tab */}
        <TabsContent value="basic" className="space-y-6">
          <BasicConfigTab
            basicProgram={basicProgram}
            creationId={creationId}
            logos={logos}
            isBasicActive={isBasicActive}
            setIsBasicActive={setIsBasicActive}
            onUploadClick={() => setIsImageModalOpen(true)}
            onRemoveLogo={handleRemoveLogo}
            onCreate={handleCreateBasicProgram}
            onUpdate={handleUpdateBasicConfig}
          />
        </TabsContent>

      
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          // uploadImages={uploadImages}
          onUploadSuccess={handleImageUploadSuccess}
        />
        {/* Add Property to Loyalty Program Section */}
        <TabsContent value="properties" className="space-y-6">
          {creationLoyalty?.id && (
            <AddPropertyToLoyalty
              loyaltyProgramId={creationLoyalty.id}
              availableProperties={availableProperties}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Image Upload Modal */}

    </div>
  );
}
