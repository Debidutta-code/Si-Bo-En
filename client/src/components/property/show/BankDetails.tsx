import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '../../Loader/Loader';
import { getBankDetailsByPropertyId } from "../api/show/bankDetails";
import { type PaymentMethods } from "../types/types";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import PaymentMethodUi from "../update/PaymentMethods";
import { updatePaymentMethod } from "../api/update/bankDetails";
import { useAppSelector } from '@/redux/hooks';

interface PropertyId {
  propertyId: string;
}

interface PaymentIntegrationDetail {
  id: string;
  propertyId: string;
  paymentIntegrationId: string;
  isActive: boolean;
  paymentIntegration: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export default function BankDetails({ propertyId }: PropertyId) {
  const { user } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    paymentGateway: false,
    payAtHotel: false,
    selectedPaymentIntegrations: [],
  });
  const [paymentIntegrationDetails, setPaymentIntegrationDetails] = useState<PaymentIntegrationDetail[]>([]);

  const fetchBankDetails = async (propertyId: string) => {
    setLoading(true);
    try {
      const response = await getBankDetailsByPropertyId(propertyId);
      if (response.success) {
        const data = response.data;
        
        // Store full integration details for display
        const integrationDetails = data.selectedPaymentIntegrations || [];
        setPaymentIntegrationDetails(integrationDetails);
        
        // Extract only IDs for the payment methods state (for form submission)
        const integrationIds = integrationDetails.map((pi: PaymentIntegrationDetail) => pi.paymentIntegrationId);
        
        setPaymentMethods({
          payAtHotel: data.payAtHotel,
          paymentGateway: data.paymentGateway,
          selectedPaymentIntegrations: integrationIds,
        });
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to fetch property details");
    } finally {
      setLoading(false);
    }
  };
const formatPaymentIntegrationName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
  const updatePaymentMethodsQ = async (propertyId: string, payload: PaymentMethods) => {
    // Validation: If paymentGateway is true, must have at least one integration
    if (payload.paymentGateway && (!payload.selectedPaymentIntegrations || payload.selectedPaymentIntegrations.length === 0)) {
      toast.error("Please select at least one payment integration when enabling Payment Gateway");
      return;
    }

    try {
      setLoading(true);
      const res = await updatePaymentMethod(propertyId, payload);
      if (res.success) {
        toast.success("Payment methods updated successfully");
        fetchBankDetails(propertyId); // Refresh data
      } else {
        toast.error(res?.message || "Failed to update payment methods");
      }
    } catch (error) {
      toast.error("Failed to update payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId) {
      toast.error("Property id not found");
      return;
    }
    fetchBankDetails(propertyId);
  }, [propertyId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader text="Loading Bank Details" />
      </div>
    );
  }

  // Check if user can edit (only superadmin - userLevel 4)
  const canEdit = user?.userLevel === 4;

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Bank & Payment Details
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Manage your banking information and accepted payment methods
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="gap-8">
          {/* Payment Methods Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green/100 flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Methods
                </h3>
              </div>
              {canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary-600 hover:text-primary-700">
                      <PenTool className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                    <AlertDialogHeader>
                      <div className="flex w-full justify-between items-start">
                        <div>
                          <AlertDialogTitle className="text-xl">
                            Update Payment Methods
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Select which payment methods you accept
                          </p>
                        </div>
                        <AlertDialogCancel className="rounded-full h-8 w-8 p-0 border-0 hover:bg-gray-100">
                          <X className="h-4 w-4" />
                        </AlertDialogCancel>
                      </div>
                      <PaymentMethodUi
                        paymentMethod={paymentMethods}
                        setPaymentMethods={setPaymentMethods}
                      />
                    </AlertDialogHeader>
                    <AlertDialogFooter className="border-t pt-4">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e: any) => {
                          e.preventDefault();
                          updatePaymentMethodsQ(propertyId, paymentMethods);
                        }}
                        disabled={loading}
                      >
                        {loading ? "Updating..." : "Update Methods"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethods.paymentGateway
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      paymentMethods.paymentGateway ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {paymentMethods.paymentGateway ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Online Gateway</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    paymentMethods.paymentGateway
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {paymentMethods.paymentGateway ? "Active" : "Inactive"}
                </span>
              </div>

              <div
                className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                  paymentMethods.payAtHotel
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      paymentMethods.payAtHotel ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {paymentMethods.payAtHotel ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">Pay at Hotel</span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    paymentMethods.payAtHotel
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {paymentMethods.payAtHotel ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Show selected payment integrations if payment gateway is active */}
            {paymentMethods.paymentGateway && paymentIntegrationDetails.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  Selected Payment Integrations:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paymentIntegrationDetails.map((integration) => (
                    <div
                      key={integration.id}
                      className="px-3 py-2 bg-white border border-blue-200 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPaymentIntegrationName(integration.paymentIntegration.name)}
                        </span>
                      </div>
                     
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}