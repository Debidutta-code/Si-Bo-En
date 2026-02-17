import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Loader2, DollarSign, AlertCircle } from "lucide-react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { addBankDetails } from "../api/create/bankDetails";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader/Loader";
import { useAppSelector } from '@/redux/hooks';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getPaymentIntegrations } from "@/pages/management/api";

// Assuming you have an API to fetch master payment integrations

interface MasterPaymentIntegration {
  id: string;
  name: string;
  isActive: boolean;
}

// Zod Schema for Validation
const bankDetailsSchema = z.object({
  activatedPaymentMethod: z.object({
    payAtHotel: z.boolean(),
    paymentGateway: z.boolean(),
    selectedPaymentIntegrations: z.array(z.string()).optional(),
  }).refine(
    (methods) => methods.payAtHotel || methods.paymentGateway,
    { message: "Please activate at least one payment method." }
  ).refine(
    (methods) => {
      // If paymentGateway is true, selectedPaymentIntegrations must have at least one item
      if (methods.paymentGateway) {
        return methods.selectedPaymentIntegrations && methods.selectedPaymentIntegrations.length > 0;
      }
      return true;
    },
    { message: "Please select at least one payment integration when Payment Gateway is enabled." }
  ),
});

type FormErrors = z.inferFormattedError<typeof bankDetailsSchema>;

export default function BankDetails() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.user);
  const { propertyId, previous, markStepAsCompleted } = usePropertyForm();

  const [formData, setFormData] = useState({
    activatedPaymentMethod: {
      payAtHotel: true,
      paymentGateway: false,
      selectedPaymentIntegrations: [] as string[],
    },
  });

  const [errors, setErrors] = useState<FormErrors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterIntegrations, setMasterIntegrations] = useState<MasterPaymentIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // Check if user is super admin (userLevel 4)
  const isSuperAdmin = user?.userLevel === 4;

  // Fetch master payment integrations
  useEffect(() => {
    const fetchIntegrations = async () => {
      if(!propertyId){
        return
      }
      if (isSuperAdmin) {
        setLoadingIntegrations(true);
        try {
          const response = await getPaymentIntegrations(propertyId);
          if (response.success) {
            setMasterIntegrations(response.data);
          } else {
            toast.error("Failed to load payment integrations");
          }
        } catch (error: any) {
          toast.error(error?.message || "Failed to load payment integrations");
        } finally {
          setLoadingIntegrations(false);
        }
      }
    };

    fetchIntegrations();
  }, [isSuperAdmin]);

  // Update payment method toggle
  const togglePaymentMethod = (method: 'payAtHotel' | 'paymentGateway') => {
    // Prevent non-super admins from enabling payment gateway
    if (method === 'paymentGateway' && !isSuperAdmin) {
      toast.error("Only super admin can enable Payment Gateway");
      return;
    }

    setFormData((prev) => {
      const newValue = !prev.activatedPaymentMethod[method];
      
      // If disabling payment gateway, clear selected integrations
      if (method === 'paymentGateway' && !newValue) {
        return {
          ...prev,
          activatedPaymentMethod: {
            ...prev.activatedPaymentMethod,
            paymentGateway: false,
            selectedPaymentIntegrations: [],
          },
        };
      }

      return {
        ...prev,
        activatedPaymentMethod: {
          ...prev.activatedPaymentMethod,
          [method]: newValue,
        },
      };
    });

    if (errors?.activatedPaymentMethod) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors.activatedPaymentMethod;
        return newErrors;
      });
    }
  };

  // Toggle payment integration selection
  const togglePaymentIntegration = (integrationId: string) => {
    setFormData((prev) => {
      const currentSelections = prev.activatedPaymentMethod.selectedPaymentIntegrations;
      const isSelected = currentSelections.includes(integrationId);

      return {
        ...prev,
        activatedPaymentMethod: {
          ...prev.activatedPaymentMethod,
          selectedPaymentIntegrations: isSelected
            ? currentSelections.filter(id => id !== integrationId)
            : [...currentSelections, integrationId],
        },
      };
    });

    if (errors?.activatedPaymentMethod) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors.activatedPaymentMethod;
        return newErrors;
      });
    }
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!propertyId) {
      toast.error("Property Id not found, go back and try again");
      return;
    }

    const result = bankDetailsSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.format());
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setErrors(null);
    setIsSubmitting(true);

    try {
      const res = await addBankDetails(propertyId, result.data);
      if (res.success) {
        toast.success("Bank details saved successfully!");
        markStepAsCompleted();
        navigate("/app");
      } else {
        toast.error(res.message || "Failed to save bank details");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save bank details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader text="Saving Bank information and payment details." />
      </div>
    );
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto bg-white">
      <div className="mx-auto">
        <div className="bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-4 text-black">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Bank Details & Payment Methods</h1>
                <p className="text-gray-800">Secure your payment information for seamless transactions</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="sm:p-8 bg-white">
            <div className="space-y-8">
              {/* Payment Methods */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-white text-black rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-bold text-black">Activated Payment Methods</h3>
                </div>

                {/* Super Admin Warning */}
                {!isSuperAdmin && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Only super admin users can enable Payment Gateway. Please contact your administrator if you need this feature.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: "payAtHotel",
                      label: "Pay at Hotel",
                      desc: "Guests can pay directly at the property",
                      disabled: false,
                    },
                    {
                      key: "paymentGateway",
                      label: "Payment Gateway",
                      desc: "Online card payments & wallets",
                      disabled: !isSuperAdmin,
                    },
                  ].map(({ key, label, desc, disabled }) => {
                    const isSelected =
                      formData.activatedPaymentMethod[key as keyof typeof formData.activatedPaymentMethod];
                    return (
                      <button
                        type="button"
                        key={key}
                        onClick={() => togglePaymentMethod(key as 'payAtHotel' | 'paymentGateway')}
                        disabled={disabled}
                        className={cn(
                          "p-5 rounded-xl border-2 text-left transition-all duration-200",
                          disabled
                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                            : "hover:shadow-md cursor-pointer",
                          isSelected && !disabled
                            ? "bg-white border-black text-black shadow-md"
                            : !disabled && "bg-white border-gray-300 text-gray-800 hover:border-black"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{label}</h4>
                          <div
                            className={cn(
                              "flex items-center justify-center w-5 h-5 rounded-full border-2",
                              isSelected && !disabled
                                ? "bg-black border-black"
                                : "border-gray-400 bg-white"
                            )}
                          >
                            {isSelected && !disabled && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{desc}</p>
                        {disabled && (
                          <p className="text-xs text-amber-600 mt-2 font-medium">
                            Super Admin access required
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Payment Integration Selection */}
                {formData.activatedPaymentMethod.paymentGateway && isSuperAdmin && (
                  <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">
                      Select Payment Integrations
                    </h4>
                    
                    {loadingIntegrations ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600">Loading integrations...</span>
                      </div>
                    ) : masterIntegrations.length > 0 ? (
                      <div className="space-y-3">
                        {masterIntegrations.map((integration) => (
                          <div
                            key={integration.id}
                            className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                          >
                            <Checkbox
                              id={integration.id}
                              checked={formData.activatedPaymentMethod.selectedPaymentIntegrations.includes(integration.id)}
                              onCheckedChange={() => togglePaymentIntegration(integration.id)}
                              className="border-2"
                            />
                            <Label
                              htmlFor={integration.id}
                              className="flex-1 cursor-pointer text-sm font-medium text-gray-900"
                            >
                              {capitalizeFirstLetter(integration.name.replaceAll("_", " ")  )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          No payment integrations available. Please contact support to add payment integrations.
                        </AlertDescription>
                      </Alert>
                    )}

                    {formData.activatedPaymentMethod.selectedPaymentIntegrations.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">
                          {formData.activatedPaymentMethod.selectedPaymentIntegrations.length} integration(s) selected
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {errors?.activatedPaymentMethod?._errors && errors.activatedPaymentMethod._errors.length > 0 && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {errors.activatedPaymentMethod._errors[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-10 border-t border-gray-200">
              <Button
                onClick={previous}
                variant="outline"
                className="border-2 border-black hover:bg-black hover:text-white h-12 px-6"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-black hover:bg-gray-800 text-white h-12 px-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit & Complete"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}