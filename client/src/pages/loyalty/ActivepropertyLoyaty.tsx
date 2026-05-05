import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Users, ChevronLeft, Award, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/Loader/Loader";
import { getLoyalityForProperty } from "./api/property-loyality.api";
import type { ICreationLoyality } from "./interfaces";

interface ILoader {
  isLoading: boolean;
  message: string;
}

interface IPropertyLoyalty {
  id: string;
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  creationLoyaltyConfigId: string;
  isActive: boolean;
  CreationLoyaltyConfig: ICreationLoyality;
}

export default function ActivePropertyLoyalty() {
  const { propertyId, loyaltyConfigId } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty details..."
  });
  const [loyalty, setLoyalty] = useState<IPropertyLoyalty | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchLoyaltyDetails();
    }
  }, [propertyId, loyaltyConfigId]);

  const fetchLoyaltyDetails = async () => {
    if (!propertyId) return;

    setLoader({ isLoading: true, message: "Loading loyalty details..." });
    try {
      const response = await getLoyalityForProperty(propertyId);
      
      if (response.success && response.data) {
        setLoyalty(response.data);
      } else {
        toast.error(response.message || "Failed to fetch loyalty details");
      }
    } catch (error) {
      console.error("Error fetching loyalty details:", error);
      toast.error("Failed to fetch loyalty details");
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleViewGuests = () => {
    if (loyalty?.creationLoyaltyConfigId) {
      navigate(`/property/loyalty/${propertyId}/guests/${loyalty.creationLoyaltyConfigId}`);
    }
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  if (!loyalty) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Loyalty Configuration Found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              This property doesn't have an active loyalty configuration.
            </p>
            <Button onClick={() => navigate(`/property/loyalty/${propertyId}`)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Loyalty Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { CreationLoyaltyConfig } = loyalty;

  if (!CreationLoyaltyConfig) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Incomplete Loyalty Configuration</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              This loyalty configuration is missing required data.
            </p>
            <Button onClick={() => navigate(`/property/loyalty/${propertyId}`)}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Loyalty Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/property/loyalty/${propertyId}`)}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Loyalty Programs
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Award className="w-8 h-8" />
              {loyalty.propertyName} Loyalty Program
            </h1>
            <p className="text-muted-foreground mt-2">
              Property Code: {loyalty.propertyCode}
            </p>
          </div>
          <Badge variant={loyalty.isActive ? "default" : "secondary"} className="text-sm">
            {loyalty.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleViewGuests}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Loyalty Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">View</p>
            <p className="text-sm text-muted-foreground">Manage guests enrolled in this program</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Details Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="basic">Basic Config</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Config</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discount Information</CardTitle>
              <CardDescription>Current loyalty discount configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Discount Type</p>
                  <p className="text-lg font-semibold capitalize">{CreationLoyaltyConfig.loyaltyDiscountType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discount Value</p>
                  <p className="text-lg font-semibold">
                    {CreationLoyaltyConfig.loyaltyDiscountType === "percentage"
                      ? `${CreationLoyaltyConfig.discountValue}%`
                      : `${CreationLoyaltyConfig.currencyCode} ${CreationLoyaltyConfig.discountValue}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currency</p>
                  <p className="text-lg font-semibold">{CreationLoyaltyConfig.currencyCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Basic Config Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>Loyalty program branding and basic settings</CardDescription>
            </CardHeader>
            <CardContent>
              {CreationLoyaltyConfig.BasicLoyaltyProgram ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Badge variant={CreationLoyaltyConfig.BasicLoyaltyProgram.isActive ? "default" : "secondary"}>
                      {CreationLoyaltyConfig.BasicLoyaltyProgram.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {CreationLoyaltyConfig.BasicLoyaltyProgram.logo && CreationLoyaltyConfig.BasicLoyaltyProgram.logo.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Logos</p>
                      <div className="flex gap-4 flex-wrap">
                        {CreationLoyaltyConfig.BasicLoyaltyProgram.logo.map((logoUrl, index) => (
                          <img
                            key={index}
                            src={logoUrl}
                            alt={`Logo ${index + 1}`}
                            className="h-16 w-auto object-contain border rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No basic configuration set up yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Config Tab */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Advanced loyalty program settings and features</CardDescription>
            </CardHeader>
            <CardContent>
              {CreationLoyaltyConfig.AdvanceLoyaltyProgram ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Active in Corporate Web</span>
                    <Badge variant={CreationLoyaltyConfig.AdvanceLoyaltyProgram.activeInCorporateWeb ? "default" : "secondary"}>
                      {CreationLoyaltyConfig.AdvanceLoyaltyProgram.activeInCorporateWeb ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Default Login Mode</span>
                    <Badge variant={CreationLoyaltyConfig.AdvanceLoyaltyProgram.defaultLoginMode ? "default" : "secondary"}>
                      {CreationLoyaltyConfig.AdvanceLoyaltyProgram.defaultLoginMode ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Block User Field</span>
                    <Badge variant={CreationLoyaltyConfig.AdvanceLoyaltyProgram.blockUserFieldFromForm ? "default" : "secondary"}>
                      {CreationLoyaltyConfig.AdvanceLoyaltyProgram.blockUserFieldFromForm ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="col-span-full p-3 border rounded">
                    <p className="text-sm text-muted-foreground mb-1">Room Limit Per Booking</p>
                    <p className="text-lg font-semibold">{CreationLoyaltyConfig.AdvanceLoyaltyProgram.roomLimitByBooking}</p>
                  </div>
                  {CreationLoyaltyConfig.AdvanceLoyaltyProgram.externalRegistrationUrl && (
                    <div className="col-span-full p-3 border rounded">
                      <p className="text-sm text-muted-foreground mb-1">External Registration URL</p>
                      <a
                        href={CreationLoyaltyConfig.AdvanceLoyaltyProgram.externalRegistrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {CreationLoyaltyConfig.AdvanceLoyaltyProgram.externalRegistrationUrl}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No advanced configuration set up yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
