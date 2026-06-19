import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Cable, AlertCircle } from 'lucide-react';
import type { IMasterPartnersWProperty } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface IntegrationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IMasterPartnersWProperty | null;
    propertyId: string;
    onIntegrationSuccess: () => void;
    onSubmit: (data: {
    propertyId: string;
    masterIntegrationId: string;
    fields: Array<{ requiredFieldId: string; value: string }>;
    amountBeforeTax: boolean;
    amountAfterTax: boolean;
}) => Promise<void>;
}

export default function IntegrationDialog({
    isOpen,
    onClose,
    partner,
    propertyId,
    onIntegrationSuccess,
    onSubmit
}: IntegrationDialogProps) {
    const { t } = useTranslation();
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    // Default ON = amount before tax
    const [useAmountAfterTax, setUseAmountAfterTax] = useState(false);

    // Reset state when dialog opens/closes
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setFieldValues({});
            setErrors({});
            setIsSubmitting(false);
            setUseAmountAfterTax(false);
            onClose();
        }
    };

    const validateField = (value: string, fieldName: string): string | null => {
        if (!value || value.trim() === '') {
            return t('PartnerIntegration.integrationDialog.validationRequired', { fieldName });
        }

        // Additional validation based on field name
        if (fieldName.toLowerCase().includes('email')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return t('PartnerIntegration.integrationDialog.validationEmail');
            }
        }

        if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('endpoint')) {
            try {
                new URL(value);
            } catch {
                return t('PartnerIntegration.integrationDialog.validationUrl');
            }
        }

        if (fieldName.toLowerCase().includes('api') && fieldName.toLowerCase().includes('key')) {
            if (value.length < 10) {
                return t('PartnerIntegration.integrationDialog.validationApiKey');
            }
        }

        return null;
    };

    const handleFieldChange = (fieldId: string, value: string) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
        // Clear error when user starts typing
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const handleSubmit = async () => {
        if (!partner || !propertyId) return;

        // Validate all fields
        const newErrors: Record<string, string> = {};
        let hasErrors = false;

        partner.requiredFieldsForMasterIntegration.forEach(field => {
            const value = fieldValues[field.id];
            const error = validateField(value, field.name);
            if (error) {
                newErrors[field.id] = error;
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(newErrors);
            toast.error(t('PartnerIntegration.integrationDialog.toastFixErrors'));
            return;
        }

        setIsSubmitting(true);

        try {
            const integrationData = {
                propertyId,
                masterIntegrationId: partner.id,
                fields: partner.requiredFieldsForMasterIntegration.map(field => ({
                    requiredFieldId: field.id,
                    value: fieldValues[field.id]
                })),
                amountBeforeTax: !useAmountAfterTax,
                amountAfterTax: useAmountAfterTax,
            };

            await onSubmit(integrationData);

            // Success - reset and close
            setFieldValues({});
            setErrors({});
            setUseAmountAfterTax(false);
            onIntegrationSuccess();
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!partner) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className='max-w-2xl max-h-[85vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Cable className='h-5 w-5 text-blue-600' />
                        {t('PartnerIntegration.integrationDialog.title', { name: partner.name })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('PartnerIntegration.integrationDialog.desc')}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Partner Information */}
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                        <div className='flex items-start gap-2'>
                            <AlertCircle className='h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0' />
                            <div className='flex-1'>
                                <h4 className='font-medium text-blue-900 mb-1'>{t('PartnerIntegration.integrationDialog.partnerType')}</h4>
                                <Badge variant='secondary' className='mb-2'>
                                    {partner.type === 'channel_manager' ? t('PartnerIntegration.section.channelManagerUpper') : t('PartnerIntegration.section.pmsUpper')}
                                </Badge>
                                <p className='text-sm text-blue-700'>
                                    {t('PartnerIntegration.integrationDialog.partnerTypeDesc', { name: partner.name })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Endpoints (Read-only information) */}
                    {partner.masterIntegrationURLFields.length > 0 && (
                        <div className='space-y-2'>
                            <Label className='text-base font-semibold'>{t('PartnerIntegration.integrationDialog.apiEndpoints')}</Label>
                            <p className='text-xs text-muted-foreground mb-2'>
                                {t('PartnerIntegration.integrationDialog.apiEndpointsDesc', { name: partner.name })}
                            </p>
                            <div className='space-y-2 bg-gray-50 p-3 rounded-lg border'>
                                {partner.masterIntegrationURLFields.map((urlField) => (
                                    <div key={urlField.id} className='flex items-center justify-between text-sm'>
                                        <span className='font-medium text-gray-700'>{urlField.name}:</span>
                                        <a
                                            href={urlField.url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-blue-600 hover:underline flex items-center gap-1'
                                        >
                                            {urlField.url}
                                            <ExternalLink className='h-3 w-3' />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pricing Mode Toggle */}
                    <div className='space-y-2'>
                        <Label className='text-base font-semibold'>Pricing Mode</Label>
                        <p className='text-xs text-muted-foreground mb-2'>
                            Choose whether rates pushed to {partner.name} should be sent as the amount
                            before tax or the amount after tax.
                        </p>
                        <div className='flex items-center justify-between rounded-lg border p-3 bg-gray-50'>
                            <div>
                                <p className='text-sm font-medium text-gray-800'>
                                    {useAmountAfterTax ? 'Amount After Tax' : 'Amount Before Tax'}
                                </p>
                                <p className='text-xs text-muted-foreground'>
                                    {useAmountAfterTax
                                        ? 'Rates sent will include tax'
                                        : 'Rates sent will exclude tax (default)'}
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className={`text-xs ${!useAmountAfterTax ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>
                                    Before Tax
                                </span>
                                <Switch
                                    checked={useAmountAfterTax}
                                    onCheckedChange={setUseAmountAfterTax}
                                    disabled={isSubmitting}
                                />
                                <span className={`text-xs ${useAmountAfterTax ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>
                                    After Tax
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Required Fields Form */}
                    <div className='space-y-4'>
                        <div>
                            <Label className='text-base font-semibold'>{t('PartnerIntegration.integrationDialog.requiredConfigFields')}</Label>
                            <p className='text-xs text-muted-foreground mt-1'>
                                {t('PartnerIntegration.integrationDialog.requiredConfigFieldsDesc')}
                            </p>
                        </div>

                        {partner.requiredFieldsForMasterIntegration.map((field, index) => (
                            <div key={field.id} className='space-y-2'>
                                <Label htmlFor={field.id} className='flex items-center gap-1'>
                                    {field.name}
                                    <span className='text-red-500'>*</span>
                                    <span className='text-xs text-gray-500 font-normal ml-1'>
                                        {t('PartnerIntegration.integrationDialog.fieldCount', { current: index + 1, total: partner.requiredFieldsForMasterIntegration.length })}
                                    </span>
                                </Label>
                                <Input
                                    id={field.id}
                                    placeholder={t('PartnerIntegration.integrationDialog.enterField', { name: field.name.toLowerCase() })}
                                    value={fieldValues[field.id] || ''}
                                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                                    className={errors[field.id] ? 'border-red-500' : ''}
                                    disabled={isSubmitting}
                                    type={field.name.toLowerCase().includes('password') ||
                                        field.name.toLowerCase().includes('secret') ||
                                        field.name.toLowerCase().includes('key') ? 'password' : 'text'}
                                />
                                {errors[field.id] && (
                                    <p className='text-xs text-red-500 flex items-center gap-1'>
                                        <AlertCircle className='h-3 w-3' />
                                        {errors[field.id]}
                                    </p>
                                )}
                                {!errors[field.id] && field.name.toLowerCase().includes('code') && (
                                    <p className='text-xs text-gray-500'>
                                        {t('PartnerIntegration.integrationDialog.propertyIdentifier', { name: partner.name })}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Security Notice */}
                    <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                        <div className='flex items-start gap-2'>
                            <AlertCircle className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                            <p className='text-xs text-yellow-800'>
                                <strong>{t('PartnerIntegration.integrationDialog.securityNotice')}</strong> {t('PartnerIntegration.integrationDialog.securityNoticeDesc', { name: partner.name })}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className='gap-2'>
                    <Button
                        variant='outline'
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        {t('PartnerIntegration.integrationDialog.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || partner.requiredFieldsForMasterIntegration.length === 0}
                    >
                        {isSubmitting ? t('PartnerIntegration.integrationDialog.integrating') : t('PartnerIntegration.integrationDialog.integrateNow')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}