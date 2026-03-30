import { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { getPaymentIntegrationsService } from '@/pages/management/services/management.services';

interface PaymentMethodSelection {
  integrationId: string;
  propertyPaymentIntegrationId?: string;
  outletId: string;
  isActive: boolean;
  secrets?: { requiredFieldId: string; value: string }[];
}

export default function PaymentMethodsUi({
  paymentMethodId,
  propertyId,
  onSelectionChange
}: {
  paymentMethodId: string;
  setActivePaymentMethodId: React.Dispatch<React.SetStateAction<string>>;
  propertyId: string;
  onSelectionChange: (selection: PaymentMethodSelection | null) => void;
}) {
  const [paymentIntegrations, setPaymentIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [outletIds, setOutletIds] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    fetchPaymentIntegrations();
  }, []);

  const fetchPaymentIntegrations = async () => {
    setLoading(true);
    try {
      const response = await getPaymentIntegrationsService(propertyId);
      if (response.success) {
        setPaymentIntegrations(response.data);
        
        const initialOutletIds: Record<string, string> = {};
        const initialSecrets: Record<string, Record<string, string>> = {};

        response.data.forEach((integration: any) => {
          const propertyIntegration = integration.propertyPaymentIntegrations?.[0];
          if (propertyIntegration) {
            initialOutletIds[integration.id] = propertyIntegration.outletId;

            if (propertyIntegration.id === paymentMethodId) {
              setSelectedIntegration(integration.id);
            }

            const integrationSecrets: Record<string, string> = {};
            propertyIntegration.propertyPaymentIntegrationSecrets?.forEach((s: any) => {
              integrationSecrets[s.requiredFieldId] = s.value;
            });
            initialSecrets[integration.id] = integrationSecrets;
          }
        });

        setOutletIds(initialOutletIds);
        setSecrets(initialSecrets);
      } else {
        toast.error("Failed to fetch payment integrations");
      }
    } catch (error) {
      toast.error("Error loading payment integrations");
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationToggle = (integrationId: string) => {
    if (selectedIntegration === integrationId) {
      setSelectedIntegration(null);
      onSelectionChange(null);
      return;
    }

    const integration = paymentIntegrations.find(pi => pi.id === integrationId);
    if (!integration) return;

    setSelectedIntegration(integrationId);
    updateParent(integrationId);
  };

  const handleOutletIdChange = (integrationId: string, value: string) => {
    setOutletIds(prev => {
        const next = { ...prev, [integrationId]: value };
        if (selectedIntegration === integrationId) {
            updateParent(integrationId, next, secrets);
        }
        return next;
    });
  };

  const handleSecretChange = (integrationId: string, fieldId: string, value: string) => {
    setSecrets(prev => {
        const next = {
            ...prev,
            [integrationId]: {
                ...(prev[integrationId] || {}),
                [fieldId]: value
            }
        };
        if (selectedIntegration === integrationId) {
            updateParent(integrationId, outletIds, next);
        }
        return next;
    });
  };

  const updateParent = (integrationId: string, currentOutlets = outletIds, currentSecrets = secrets) => {
    const integration = paymentIntegrations.find(pi => pi.id === integrationId);
    if (!integration) return;

    const propertyIntegration = integration.propertyPaymentIntegrations?.[0];
    const outletId = currentOutlets[integrationId] || '';

    const secretValues = Object.entries(currentSecrets[integrationId] || {}).map(([requiredFieldId, value]) => ({
      requiredFieldId,
      value
    }));

    onSelectionChange({
      integrationId: integration.id,
      propertyPaymentIntegrationId: propertyIntegration?.id,
      outletId: outletId,
      isActive: true,
      secrets: secretValues
    });
  };
  
  const formatPaymentIntegrationName = (name: string): string => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h4 className="font-semibold text-lg text-gray-900">
                Select Payment Integration
            </h4>
            <p className="text-sm text-gray-600 mt-1">
                Choose one payment provider to enable online payments
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
                const isChecked = selectedIntegration === integration.id;
                const currentOutletId = outletIds[integration.id] || '';

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
                                Selected
                                </span>
                            )}
                            </div>
                        </label>

                        {/* Config Fields */}
                        {isChecked && (
                            <div className="mt-4 space-y-4 border-t pt-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 uppercase">
                                    Outlet Id / PG Id *
                                    </label>
                                    <Input
                                    type="text"
                                    placeholder="Enter Outlet ID"
                                    value={currentOutletId}
                                    onChange={(e) => handleOutletIdChange(integration.id, e.target.value)}
                                    className="h-9 text-sm"
                                    />
                                </div>

                                {integration.requiredFieldsForMasterPaymentIntegration?.map((field: any) => (
                                    <div key={field.id} className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-600 uppercase">
                                            {field.name} *
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder={`Enter ${field.name}`}
                                            value={secrets[integration.id]?.[field.id] || ''}
                                            onChange={(e) => handleSecretChange(integration.id, field.id, e.target.value)}
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                ))}

                                {integration.masterPaymentIntegrationURLFields?.length > 0 && (
                                    <div className="pt-2">
                                        <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Reference URLs</p>
                                        <div className="space-y-1">
                                            {integration.masterPaymentIntegrationURLFields.map((urlField: any) => (
                                                <div key={urlField.id} className="text-xs flex justify-between">
                                                    <span className="text-gray-600">{urlField.name}:</span>
                                                    <a href={urlField.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate ml-2">
                                                        {urlField.url}
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
        )}
    </div>
  );
}
