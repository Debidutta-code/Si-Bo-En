import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Award, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/Loader/Loader";
import { getAllPropertyLoyalityWithLoyality } from "./api/property-loyality.api";
import BackButton from "@/components/shared/BackButton";
import type { IPropertyLoyaltyConfig, IPropertyLoyalityWithLoyality } from "./interfaces";

interface ILoader {
  isLoading: boolean;
  message: string;
}

export default function PropertyLoyalityManagement() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [loader, setLoader] = useState<ILoader>({
    isLoading: true,
    message: "Loading loyalty programs..."
  });
  const [loyalties, setLoyalties] = useState<Array<IPropertyLoyaltyConfig & IPropertyLoyalityWithLoyality>>([]);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyLoyalties();
    }
  }, [propertyId]);

  const fetchPropertyLoyalties = async () => {
    if (!propertyId) return;

    setLoader({ isLoading: true, message: "Loading loyalty programs..." });
    try {
      const response = await getAllPropertyLoyalityWithLoyality(propertyId);
      
      if (response.success && response.data) {
        setLoyalties(response.data);
      } else {
        toast.error(response.message || "Failed to fetch loyalty programs");
        setLoyalties([]);
      }
    } catch (error) {
      console.error("Error fetching loyalty programs:", error);
      toast.error("Failed to fetch loyalty programs");
      setLoyalties([]);
    } finally {
      setLoader({ isLoading: false, message: "" });
    }
  };

  const handleLoyaltyClick = (loyaltyConfigId: string) => {
    navigate(`/property/loyalty/${propertyId}/active/${loyaltyConfigId}`);
  };

  if (loader.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader text={loader.message} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <BackButton/>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Loyalty Programs</h1>
        <p className="text-muted-foreground mt-2">
          Manage loyalty programs for this property
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Property Loyalty Programs
          </CardTitle>
          <CardDescription>
            Click on a loyalty program to view details and manage guests
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loyalties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Award className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Loyalty Programs</h3>
              <p className="text-muted-foreground text-center max-w-md">
                This property has no loyalty programs assigned yet. Contact your administrator to configure loyalty programs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Name</TableHead>
                    <TableHead>Property Code</TableHead>
                    <TableHead>Discount Type</TableHead>
                    <TableHead>Discount Value</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loyalties.map((loyalty) => (
                    <TableRow 
                      key={loyalty.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleLoyaltyClick(loyalty.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          {loyalty.propertyName} Loyalty
                        </div>
                      </TableCell>
                      <TableCell>{loyalty.propertyCode}</TableCell>
                      <TableCell className="capitalize">
                        {loyalty.CreationLoyaltyConfig?.loyaltyDiscountType}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {loyalty.CreationLoyaltyConfig?.loyaltyDiscountType === "percentage"
                          ? `${loyalty.CreationLoyaltyConfig?.discountValue}%`
                          : loyalty.CreationLoyaltyConfig?.discountValue}
                      </TableCell>
                      <TableCell>{loyalty.CreationLoyaltyConfig?.currencyCode}</TableCell>
                      <TableCell>
                        <Badge variant={loyalty.isActive ? "default" : "secondary"}>
                          {loyalty.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoyaltyClick(loyalty.id);
                          }}
                        >
                          View Details
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}