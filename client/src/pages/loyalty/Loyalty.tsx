import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import type { ILoader } from "../dashboard/interface";
import {
  createLoyaltyProgramService,
  getLoyaltyProgramService,
  updateLoyaltyProgramService,
  createAdvanceLoyaltyProgramService,
  getAdvanceLoyaltyProgramService,
  updateAdvanceLoyaltyProgramService,
  createCreationLoyalityService,
  getLoyalityByCreationService,
  updateCreationLoyalityService
} from "./services";
import type { 
  ICloyaltyProgram,
  IAdvanceLoyaltyprogram,
  // ICCreationLoyality,
  ICreationLoyality
} from "./interfaces";
import Loader from "@/components/Loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, X, CheckCircle, AlertCircle, Percent, DollarSign as DollarSignIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Loyalty() {
  const { creationId } = useParams();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading Loyalty Configuration..."
  });

  // Main Property Loyalty (Required)
  const [creationLoyalty, setCreationLoyalty] = useState<ICreationLoyality | null>(null);
  const [hasCreationLoyalty, setHasCreationLoyalty] = useState(false);

  // Optional Configurations
  const [basicProgram, setBasicProgram] = useState<ICloyaltyProgram | null>(null);
  const [advanceProgram, setAdvanceProgram] = useState<IAdvanceLoyaltyprogram | null>(null);
  
  const [activeTab, setActiveTab] = useState("discounts");

  // Creation Loyalty Form State
  const [discountType, setDiscountType] = useState<string>("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>("USD");

  // Basic Configuration State
  const [logos, setLogos] = useState<string[]>([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Advanced Configuration State
  const [advanceConfig, setAdvanceConfig] = useState({
    activeInCorporateWeb: false,
    defaultLoginMode: false,
    allowEmailRecovery: true,
    allowNewRequest: true,
    allowNewRequestInCorporate: false,
    roomLimitByBooking: 1,
    externalRegistrationUrl: "",
    blockUserFieldFromForm: false
  });

  useEffect(() => {
    if (creationId) {
      fetchLoyaltyData();
    }
  }, [creationId]);

  const fetchLoyaltyData = async () => {
    if (!creationId) return;

    setLoader({ isLoading: true, message: "Loading Loyalty Configuration..." });
    try {
      // Fetch main creation loyalty (REQUIRED)
      const creationResponse = await getLoyalityByCreationService(creationId);
      
      if (creationResponse.success && creationResponse.data) {
        setCreationLoyalty(creationResponse.data);
        setHasCreationLoyalty(true);
        setDiscountType(creationResponse.data.loyaltyDiscountType);
        setDiscountValue(creationResponse.data.discountValue);
        setCurrencyCode(creationResponse.data.currencyCode || "USD");

        // Fetch optional basic program
        const basicResponse = await getLoyaltyProgramService(creationId);
        if (basicResponse.success && basicResponse.data) {
          setBasicProgram(basicResponse.data);
          setLogos(basicResponse.data.logo || []);
        }

        // Fetch optional advance program
        const advResponse = await getAdvanceLoyaltyProgramService(creationId);
        if (advResponse.success && advResponse.data) {
          setAdvanceProgram(advResponse.data);
          setAdvanceConfig({
            activeInCorporateWeb: advResponse.data.activeInCorporateWeb,
            defaultLoginMode: advResponse.data.defaultLoginMode,
            allowEmailRecovery: advResponse.data.allowEmailRecovery,
            allowNewRequest: advResponse.data.allowNewRequest,
            allowNewRequestInCorporate: advResponse.data.allowNewRequestInCorporate,
            roomLimitByBooking: advResponse.data.roomLimitByBooking || 1,
            externalRegistrationUrl: advResponse.data.externalRegistrationUrl || "",
            blockUserFieldFromForm: advResponse.data.blockUserFieldFromForm || false
          });
        }
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

  const handleCreateCreationLoyalty = async () => {
    if (!creationId) return;

    if (discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

    if (discountType === "percentage" && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    setLoader({ isLoading: true, message: "Creating Loyalty Configuration..." });
    try {
      const response = await createCreationLoyalityService({
        creationId,
        loyaltyDiscountType: discountType as any,
        discountValue,
        currencyCode: currencyCode as any
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
    if (!creationId) return;

    setLoader({ isLoading: true, message: "Creating Basic Configuration..." });
    try {
      const response = await createLoyaltyProgramService({
        loyaltyProgramId: creationId,
        logo: logos.length > 0 ? logos : ["/default-logo.png"],
        isActive: true
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
    if (!creationId) return;

    setLoader({ isLoading: true, message: "Updating Basic Configuration..." });
    try {
      const response = await updateLoyaltyProgramService(creationId, { 
        logo: logos,
        isActive: true 
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

  const handleUpdateAdvanceConfig = async () => {
    if (!creationId) return;

    setLoader({ isLoading: true, message: "Updating Advanced Configuration..." });
    try {
      let response;
      
      if (advanceProgram?.id) {
        // Update existing
        response = await updateAdvanceLoyaltyProgramService(advanceProgram.id, advanceConfig);
      } else {
        // Create new
        response = await createAdvanceLoyaltyProgramService({
          loyaltyProgramId: creationId,
          ...advanceConfig
        });
      }

      if (response.success) {
        toast.success("Advanced configuration updated successfully");
        await fetchLoyaltyData();
      } else {
        toast.error(response.message || "Failed to update advanced configuration");
      }
    } catch (error) {
      toast.error("An error occurred while updating advanced configuration");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingLogo(true);
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogos([...logos, base64String]);
      setUploadingLogo(false);
    };

    reader.readAsDataURL(file);
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
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">Loyalty Configuration</CardTitle>
            <CardDescription>
              No loyalty configuration found for this creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Create a loyalty configuration to start offering discounts and benefits to your customers
              </AlertDescription>
            </Alert>

            {/* Discount Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={discountType} onValueChange={(value) => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      <span>Percentage Discount</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed">
                    <div className="flex items-center gap-2">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>Fixed Amount</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                Discount Value {discountType === "percentage" ? "(%)" : "(Amount)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                max={discountType === "percentage" ? 100 : undefined}
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 50"}
              />
              <p className="text-sm text-muted-foreground">
                {discountType === "percentage" 
                  ? "Enter percentage between 0-100" 
                  : "Enter fixed discount amount"}
              </p>
            </div>

            {/* Currency Code (for fixed amount) */}
            {discountType === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="currencyCode">Currency Code</Label>
                <Input
                  id="currencyCode"
                  type="text"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                  placeholder="e.g., USD, EUR, GBP"
                  maxLength={3}
                />
                <p className="text-sm text-muted-foreground">
                  Enter 3-letter currency code (ISO 4217)
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button onClick={handleCreateCreationLoyalty} size="lg" className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create Loyalty Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="basic">Basic Config</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Config</TabsTrigger>
        </TabsList>

        {/* Discounts Tab - Main Configuration */}
        <TabsContent value="discounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loyalty Discounts</CardTitle>
              <CardDescription>
                Manage discount settings for your loyalty program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Configuration Display */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Loyalty configuration is active for this creation
                </AlertDescription>
              </Alert>

              {/* Discount Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        <span>Percentage Discount</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSignIcon className="h-4 w-4" />
                        <span>Fixed Amount</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value {discountType === "percentage" ? "(%)" : "(Amount)"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? 100 : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder={discountType === "percentage" ? "e.g., 10" : "e.g., 50"}
                />
                <p className="text-sm text-muted-foreground">
                  {discountType === "percentage" 
                    ? "Enter percentage between 0-100" 
                    : "Enter fixed discount amount"}
                </p>
              </div>

              {/* Currency Code (for fixed amount) */}
              {discountType === "fixed" && (
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Input
                    id="currencyCode"
                    type="text"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    placeholder="e.g., USD, EUR, GBP"
                    maxLength={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter 3-letter currency code (ISO 4217)
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdateDiscounts}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Update Discounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Basic Configuration Tab - Optional */}
        <TabsContent value="basic" className="space-y-6">
          {!basicProgram ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Basic Configuration</CardTitle>
                <CardDescription>
                  No basic configuration created yet
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Basic configuration is optional. Add it to customize logos and service status.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleCreateBasicProgram} size="lg" className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Basic Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Basic Configuration</CardTitle>
                <CardDescription>
                  Configure basic settings for your loyalty program
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* Program ID */}
              <div className="space-y-2">
                <Label>Program ID</Label>
                <Input value={creationId} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">
                  This is your unique loyalty program identifier
                </p>
              </div>

              {/* Program Logo */}
              <div className="space-y-2">
                <Label>Program Logo</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload logos for your loyalty program (JPG, PNG, GIF - max 25 KB)
                </p>

                {/* Logo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {logos.map((logo, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square border-2 border-dashed rounded-lg overflow-hidden">
                        <img
                          src={logo}
                          alt={`Logo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveLogo(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Recommended size: 740x525 px. Compress images using{" "}
                  <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    TinyPNG
                  </a>
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdateBasicConfig}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Basic Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Advanced Configuration Tab - Optional */}
        <TabsContent value="advanced" className="space-y-6">
          {!advanceProgram ? (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  No advanced configuration created yet
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced configuration is optional. Add it to enable corporate web features, booking limits, and registration settings.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => handleUpdateAdvanceConfig()} size="lg" className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Advanced Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Advanced Configuration</CardTitle>
                <CardDescription>
                  Configure advanced settings and options for your loyalty program
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-6">
              {/* Service Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Settings</h3>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="activeInCorporateWeb">Active in Corporate Web</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable loyalty program on corporate website
                    </p>
                  </div>
                  <Switch
                    id="activeInCorporateWeb"
                    checked={advanceConfig.activeInCorporateWeb}
                    onCheckedChange={(checked) =>
                      setAdvanceConfig({ ...advanceConfig, activeInCorporateWeb: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="defaultLoginMode">Default Login Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Set loyalty login as default authentication method
                    </p>
                  </div>
                  <Switch
                    id="defaultLoginMode"
                    checked={advanceConfig.defaultLoginMode}
                    onCheckedChange={(checked) =>
                      setAdvanceConfig({ ...advanceConfig, defaultLoginMode: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowEmailRecovery">Allow Email Recovery</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow password recovery via email
                    </p>
                  </div>
                  <Switch
                    id="allowEmailRecovery"
                    checked={advanceConfig.allowEmailRecovery}
                    onCheckedChange={(checked) =>
                      setAdvanceConfig({ ...advanceConfig, allowEmailRecovery: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowNewRequest">Allow New Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register for loyalty program
                    </p>
                  </div>
                  <Switch
                    id="allowNewRequest"
                    checked={advanceConfig.allowNewRequest}
                    onCheckedChange={(checked) =>
                      setAdvanceConfig({ ...advanceConfig, allowNewRequest: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="allowNewRequestInCorporate">Allow Corporate Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new registrations on corporate website
                    </p>
                  </div>
                  <Switch
                    id="allowNewRequestInCorporate"
                    checked={advanceConfig.allowNewRequestInCorporate}
                    onCheckedChange={(checked) =>
                      setAdvanceConfig({ ...advanceConfig, allowNewRequestInCorporate: checked })
                    }
                  />
                </div>
              </div>

              {/* Booking Limits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Booking Limits</h3>

                <div className="space-y-2">
                  <Label htmlFor="roomLimit">Room Limit per Booking</Label>
                  <Input
                    id="roomLimit"
                    type="number"
                    min="1"
                    value={advanceConfig.roomLimitByBooking}
                    onChange={(e) =>
                      setAdvanceConfig({
                        ...advanceConfig,
                        roomLimitByBooking: parseInt(e.target.value) || 1
                      })
                    }
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum number of rooms per booking for loyalty members
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdateAdvanceConfig}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Advanced Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
