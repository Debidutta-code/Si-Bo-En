import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethods } from "../types/types";
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import type { IPaymentIntegration } from '@/pages/management/types';
import { getPaymentIntegrationsService } from '@/pages/management/services/management.services';

export default function PaymentMethodsUi({
  paymentMethod,
  setPaymentMethods,
}: {
  paymentMethod: PaymentMethods;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethods>>;
}) {
  const [paymentIntegrations, setPaymentIntegrations] = useState<IPaymentIntegration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPaymentIntegrations();
  }, []);

  const fetchPaymentIntegrations = async () => {
    setLoading(true);
    try {
      const response = await getPaymentIntegrationsService();
      if (response.success) {
        setPaymentIntegrations(response.data);
      } else {
        toast.error("Failed to fetch payment integrations");
      }
    } catch (error) {
      toast.error("Error loading payment integrations");
    } finally {
      setLoading(false);
    }
  };

  // Toggle individual payment method
  const togglePaymentMethod = (method: keyof PaymentMethods) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
      // Clear selected integrations if turning off payment gateway
      selectedPaymentIntegrations: method === 'paymentGateway' && prev.paymentGateway 
        ? [] 
        : prev.selectedPaymentIntegrations,
    }));
  };

  // Toggle payment integration selection
  const handleIntegrationToggle = (integrationId: string, checked: boolean) => {
    const currentSelections = paymentMethod.selectedPaymentIntegrations || [];
    
    if (checked) {
      setPaymentMethods((prev) => ({
        ...prev,
        selectedPaymentIntegrations: [...currentSelections, integrationId],
      }));
    } else {
      setPaymentMethods((prev) => ({
        ...prev,
        selectedPaymentIntegrations: currentSelections.filter(id => id !== integrationId),
      }));
    }
  };
  const formatPaymentIntegrationName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

  return (
    <div className="bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden">
          {/* Content */}
          <div className="px-6 py-8 bg-white">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  {
                    key: "payAtHotel",
                    label: "Pay at Hotel",
                    desc: "Guests can pay directly at the property upon arrival or departure.",
                  },
                  {
                    key: "paymentGateway",
                    label: "Payment Gateway",
                    desc: "Accept credit/debit cards, net banking, and digital wallets.",
                  },
                ].map(({ key, label, desc }) => {
                  const isSelected = Boolean(paymentMethod[key as keyof PaymentMethods]);

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => togglePaymentMethod(key as keyof PaymentMethods)}
                      className={cn(
                        "p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md focus:outline-none",
                        isSelected
                          ? "bg-black text-white border-black shadow-md"
                          : "bg-white border-gray-300 text-gray-800 hover:border-black"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm sm:text-base">{label}</h4>
                        <div
                          className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full border-2",
                            isSelected
                              ? "bg-white border-white"
                              : "border-gray-400 bg-white"
                          )}
                        >
                          {isSelected && <CheckCircle className="w-4 h-4 text-black" />}
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        isSelected ? "text-gray-300" : "text-gray-500"
                      )}>
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Payment Integrations Section - Only show if Payment Gateway is selected */}
              {paymentMethod.paymentGateway && (
                <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        Select Payment Integrations
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Choose at least one payment provider to enable online payments
                      </p>
                    </div>
                    {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : paymentIntegrations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-red-600 font-medium">
                        No payment integrations available. Please contact administrator.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentIntegrations.map((integration) => {
                        const isChecked = paymentMethod.selectedPaymentIntegrations?.includes(integration.id) || false;
                        
                        return (
                          <div
                            key={integration.id}
                            onClick={() => handleIntegrationToggle(integration.id, !isChecked)}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                              isChecked
                                ? "bg-white border-blue-500 shadow-md"
                                : "bg-white/50 border-gray-200 hover:border-blue-300 hover:bg-white"
                            )}
                          >
                            <Checkbox
                              id={integration.id}
                              checked={isChecked}
                              onCheckedChange={(checked) => handleIntegrationToggle(integration.id, checked as boolean)}
                              className="h-5 w-5"
                            />
                            <label
                              htmlFor={integration.id}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-semibold text-gray-900">
                                {formatPaymentIntegrationName(integration.name)}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Payment Gateway Provider
                              </div>
                            </label>
                            {isChecked && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Validation Warning */}
                  {paymentMethod.paymentGateway && 
                   (!paymentMethod.selectedPaymentIntegrations || paymentMethod.selectedPaymentIntegrations.length === 0) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">
                         Please select at least one payment integration to continue
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}