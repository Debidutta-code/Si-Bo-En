import { useEffect, useState } from 'react';
import { CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { IPaymentIntegration } from '@/pages/management/types';
import { getPaymentIntegrationsService } from '@/pages/management/services/management.services';
import { useTranslation } from 'react-i18next';
interface PaymentMethodSelection {
  integrationId: string;
  propertyPaymentIntegrationId?: string;
  outletId: string;
  isActive: boolean;
}

export default function PaymentMethodsUi({
  paymentMethodId,
  setActivePaymentMethodId,
  propertyId,
  onSelectionChange
}: {
  paymentMethodId: string;
  setActivePaymentMethodId: React.Dispatch<React.SetStateAction<string>>;
  propertyId: string;
  onSelectionChange: (selection: PaymentMethodSelection | null) => void;
}) {
  const { t } = useTranslation();
  const [paymentIntegrations, setPaymentIntegrations] = useState<IPaymentIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(paymentMethodId);
  const [outletIds, setOutletIds] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPaymentIntegrations();
  }, []);
  // useEffect(() => {
  //   setSelectedIntegration(paymentMethodId || null);
  // }, [paymentMethodId]);
  const fetchPaymentIntegrations = async () => {
    setLoading(true);
    try {
      const response = await getPaymentIntegrationsService(propertyId);
      if (response.success) {
        setPaymentIntegrations(response.data);

        const initialOutletIds: Record<string, string> = {};
        response.data.forEach((integration: IPaymentIntegration) => {
          if (integration.propertyPaymentIntegrations?.[0]?.outletId) {
            initialOutletIds[integration.id] = integration.propertyPaymentIntegrations[0].outletId;
          }
          // ← Sync selectedIntegration by matching paymentMethodId to propertyIntegration.id
          if (integration.propertyPaymentIntegrations?.[0]?.id === paymentMethodId) {
            setSelectedIntegration(integration.id);
          }
        });
        setOutletIds(initialOutletIds);
      }
    } catch (error) {
      toast.error("Error loading payment integrations");
    } finally {
      setLoading(false);
    }
  };
  const handleIntegrationToggle = (integrationId: string) => {
    const integration = paymentIntegrations.find(pi => pi.id === integrationId);
    if (!integration) return;

    const propertyIntegration = integration.propertyPaymentIntegrations?.[0];
    const outletId = outletIds[integrationId] || propertyIntegration?.outletId || '';

    // If no outlet ID and no existing integration, show toast
    if (!outletId && !propertyIntegration) {
      toast.error("Please provide an outlet ID");
      return;
    }

    // Toggle selection
    if (selectedIntegration === integrationId) {
      setSelectedIntegration(null);
      setActivePaymentMethodId('');
      onSelectionChange(null);
    } else {
      setSelectedIntegration(integrationId);
      // Update the active payment method ID with the property integration ID
      if (propertyIntegration?.id) {
        setActivePaymentMethodId(propertyIntegration.id);
      }
      onSelectionChange({
        integrationId: integration.id,
        propertyPaymentIntegrationId: propertyIntegration?.id,
        outletId: outletId,
        isActive: true
      });
    }
  };

  const handleOutletIdChange = (integrationId: string, value: string) => {
    setOutletIds(prev => ({
      ...prev,
      [integrationId]: value
    }));
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
          <div className="px-6 py-8 bg-white">
            <div className="space-y-8">
              <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900">
                      {t('SelectPaymentIntegration.title')}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('SelectPaymentIntegration.description')}
                    </p>
                  </div>
                  {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentIntegrations.map((integration) => {
                      const propertyIntegration = integration.propertyPaymentIntegrations?.[0];
                      const hasExistingIntegration = !!propertyIntegration;
                      const isChecked = selectedIntegration === integration.id;
                      const currentOutletId = outletIds[integration.id] || propertyIntegration?.outletId || '';

                      return (
                        <div
                          key={integration.id}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all duration-200",
                            isChecked
                              ? "bg-white border-blue-500 shadow-md"
                              : "bg-white/50 border-gray-200"
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              <Checkbox
                                id={integration.id}
                                checked={isChecked}
                                onCheckedChange={() => handleIntegrationToggle(integration.id)}
                                className="h-5 w-5 mt-1"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={integration.id}
                                  className="cursor-pointer"
                                >
                                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    {formatPaymentIntegrationName(integration.name)}
                                    {isChecked && (
                                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                        {t("Common.active")}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {t('SelectPaymentIntegration.gatewayProvider')}
                                  </div>
                                </label>

                                {/* Outlet ID Section */}
                                <div className="mt-3">
                                  {hasExistingIntegration ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-600">{t('SelectPaymentIntegration.pgId')}</span>
                                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                        {propertyIntegration.outletId}
                                      </span>
                                      {propertyIntegration.isActive ? (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                          {t("Common.active")}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                          {t("Common.inactive")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <label className="text-xs text-gray-600">
                                        {t('SelectPaymentIntegration.pgId')}
                                      </label>
                                      <Input
                                        type="text"
                                        placeholder={t('SelectPaymentIntegration.pgIdPlaceholder')}
                                        value={currentOutletId}
                                        onChange={(e) => handleOutletIdChange(integration.id, e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {isChecked && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Validation Warning */}
                {!selectedIntegration && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700 font-medium">
                      {t('SelectPaymentIntegration.warnings')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}