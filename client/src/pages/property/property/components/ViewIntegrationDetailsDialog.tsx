import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, Lock, Calendar, CheckCircle2, XCircle, Info, AlertCircle, Percent } from 'lucide-react';
import type { IMasterPartnersWProperty } from '../types';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { updatePropertyIntegrationTaxModeService } from '../services/property-config.services';

interface ViewIntegrationDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    partner: IMasterPartnersWProperty | null;
    onUpdate?: () => void;
}

export default function ViewIntegrationDetailsDialog({
    isOpen,
    onClose,
    partner,
    onUpdate
}: ViewIntegrationDetailsDialogProps) {
    const { t } = useTranslation();
    const integration = partner?.propertyIntegrations?.[0];
    const hasIntegration = !!integration;

    // local toggle state: true = after tax, false = before tax (default)
    const [useAmountAfterTax, setUseAmountAfterTax] = useState(false);
    const [isUpdatingTaxMode, setIsUpdatingTaxMode] = useState(false);

    // sync local state whenever the integration data changes / dialog opens
    useEffect(() => {
        if (integration) {
            setUseAmountAfterTax(!!integration.amountAfterTax);
        }
    }, [integration?.id, integration?.amountAfterTax, integration?.amountBeforeTax, isOpen]);

    if (!partner) return null;

    const handleTaxModeToggle = async (checked: boolean) => {
        if (!integration) return;

        const previous = useAmountAfterTax;
        setUseAmountAfterTax(checked); // optimistic update
        setIsUpdatingTaxMode(true);

        try {
            const result = await updatePropertyIntegrationTaxModeService(
                integration.id,
                !checked, // amountBeforeTax
                checked   // amountAfterTax
            );

            if (result?.success) {
                toast.success('Tax mode updated successfully');
                onUpdate?.();
            } else {
                setUseAmountAfterTax(previous); // revert on failure
                toast.error(result?.message || 'Failed to update tax mode');
            }
        } catch (error: any) {
            setUseAmountAfterTax(previous); // revert on error
            toast.error(error?.message || 'Failed to update tax mode');
        } finally {
            setIsUpdatingTaxMode(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
                <DialogHeader className='pb-4 border-b'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <DialogTitle className='flex items-center gap-3 text-2xl'>
                                {partner.name}
                            </DialogTitle>
                            <DialogDescription className='mt-2 text-base'>
                                {t('PartnerIntegration.viewDialog.subtitle')}
                            </DialogDescription>
                        </div>
                        {hasIntegration && integration?.isActive ? (
                            <Badge className='bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm'>
                                <CheckCircle2 className='h-4 w-4 mr-1' /> {t('PartnerIntegration.section.active')}
                            </Badge>
                        ) : hasIntegration ? (
                            <Badge variant='secondary' className='px-4 py-2 text-sm'>
                                <XCircle className='h-4 w-4 mr-1' /> {t('PartnerIntegration.viewDialog.inactive')}
                            </Badge>
                        ) : null}
                    </div>
                </DialogHeader>

                <div className='flex-1 overflow-y-auto space-y-6 py-6 px-1'>
                    {/* Partner Info Card */}
                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm'>
                        <div className='flex items-center gap-2 mb-4'>
                            <Info className='h-5 w-5 text-blue-600' />
                            <h4 className='font-bold text-blue-900 text-lg'>{t('PartnerIntegration.viewDialog.partnerInformation')}</h4>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='bg-white/70 rounded-lg p-3'>
                                <p className='text-xs text-gray-600 mb-1'>{t('PartnerIntegration.viewDialog.integrationType')}</p>
                                <p className='font-semibold text-gray-900'>
                                    {partner.type === 'channel_manager' ? `📊 ${t('PartnerIntegration.section.channelManagerUpper')}` : `🏨 ${t('PartnerIntegration.section.pmsUpper')}`}
                                </p>
                            </div>
                            <div className='bg-white/70 rounded-lg p-3'>
                                <p className='text-xs text-gray-600 mb-1'>{t('PartnerIntegration.viewDialog.availability')}</p>
                                <p className='font-semibold text-gray-900'>
                                    {partner.isActive ? `✅ ${t('PartnerIntegration.viewDialog.available')}` : `⏸️ ${t('PartnerIntegration.viewDialog.unavailable')}`}
                                </p>
                            </div>
                            {integration && integration.createdAt && (
                                <>
                                    <div className='bg-white/70 rounded-lg p-3'>
                                        <p className='text-xs text-gray-600 mb-1'>{t('PartnerIntegration.viewDialog.integratedOn')}</p>
                                        <p className='flex items-center gap-2 font-semibold text-gray-900'>
                                            <Calendar className='h-4 w-4 text-indigo-600' />
                                            {new Date(integration.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    <div className='bg-white/70 rounded-lg p-3'>
                                        <p className='text-xs text-gray-600 mb-1'>{t('PartnerIntegration.viewDialog.configuredFields')}</p>
                                        <p className='font-semibold text-gray-900'>
                                            {t('PartnerIntegration.viewDialog.fieldsCount', { count: integration.propertyIntegrationSecrets?.length || 0 })}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tax Mode Toggle */}
                    {hasIntegration && (
                        <div>
                            <Label className='text-lg font-bold mb-4 flex items-center gap-2'>
                                <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center'>
                                    <Percent className='h-4 w-4 text-white' />
                                </div>
                                Pricing Mode
                            </Label>
                            <div className='flex items-center justify-between rounded-xl border-2 border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-slate-50'>
                                <div>
                                    <p className='text-sm font-semibold text-gray-800'>
                                        {useAmountAfterTax ? 'Amount After Tax' : 'Amount Before Tax'}
                                    </p>
                                    <p className='text-xs text-muted-foreground mt-1'>
                                        Rates pushed to {partner.name} will be sent {useAmountAfterTax ? 'inclusive' : 'exclusive'} of tax
                                        {!useAmountAfterTax && ' (default)'}
                                    </p>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <span className={`text-xs ${!useAmountAfterTax ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>
                                        Before Tax
                                    </span>
                                    <Switch
                                        checked={useAmountAfterTax}
                                        onCheckedChange={handleTaxModeToggle}
                                        disabled={isUpdatingTaxMode}
                                    />
                                    <span className={`text-xs ${useAmountAfterTax ? 'font-semibold text-blue-700' : 'text-gray-500'}`}>
                                        After Tax
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* API Endpoints */}
                    {partner.masterIntegrationURLFields.length > 0 && (
                        <div>
                            <Label className='text-lg font-bold mb-4 flex items-center gap-2'>
                                <div className='h-8 w-8 rounded-lg bg-primary flex items-center justify-center'>
                                    <ExternalLink className='h-4 w-4 text-white' />
                                </div>
                                {t('PartnerIntegration.viewDialog.apiEndpoints')}
                            </Label>
                            <div className='space-y-3'>
                                {partner.masterIntegrationURLFields.map((urlField) => (
                                    <div 
                                        key={urlField.id} 
                                        className='group p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200  transition-all duration-200 shadow-sm hover:shadow-md'
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div className='flex-1'>
                                                <p className='font-semibold text-gray-800 mb-1'>{urlField.name}</p>
                                                <div className='flex items-center gap-2'>
                                                    <code className='text-sm text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200 font-mono'>
                                                        {urlField.url}
                                                    </code>
                                                </div>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => window.open(urlField.url, '_blank')}
                                                className='ml-4 text-purple-600 hover:text-purple-700 hover:bg-purple-100'
                                            >
                                                <ExternalLink className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Configured Fields */}
                    {hasIntegration && (
                        <div>
                            <Label className='text-lg font-bold mb-4 flex items-center gap-2'>
                                <div className='h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center'>
                                    <Lock className='h-4 w-4 text-white' />
                                </div>
                                {t('PartnerIntegration.viewDialog.configuredCredentials')}
                                <Badge variant='outline' className='ml-2'>
                                    {t('PartnerIntegration.viewDialog.fieldsCount', { count: integration?.propertyIntegrationSecrets?.length || 0 })}
                                </Badge>
                            </Label>
                            
                            {integration?.propertyIntegrationSecrets && integration.propertyIntegrationSecrets.length > 0 ? (
                                <div className='grid gap-3'>
                                    {integration.propertyIntegrationSecrets.map((secret) => (
                                        <div 
                                            key={secret.id} 
                                            className='group p-4 bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-xl transition-all duration-200'
                                        >
                                            <div className='flex items-start justify-between gap-4'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-2 mb-2'>
                                                        <Lock className='h-4 w-4 text-green-600' />
                                                        <Label className='text-sm font-bold text-gray-800'>
                                                            {secret.RequiredField?.name || t('PartnerIntegration.viewDialog.unknownField')}
                                                        </Label>
                                                    </div>
                                                    <div className='bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 font-mono text-sm'>
                                                        <span className='text-gray-600'>{secret.value}</span>
                                                        
                                                    </div>
                                                </div>
                                                {secret.createdAt && (
                                                    <div className='text-right'>
                                                        <p className='text-xs text-gray-500'>{t('PartnerIntegration.viewDialog.added')}</p>
                                                        <p className='text-xs font-medium text-gray-700'>
                                                            {new Date(secret.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className='text-center py-8 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl'>
                                    <Lock className='h-12 w-12 text-amber-400 mx-auto mb-3' />
                                    <p className='text-amber-800 font-medium'>{t('PartnerIntegration.viewDialog.noFieldsConfigured')}</p>
                                    <p className='text-sm text-amber-700 mt-1'>
                                        {t('PartnerIntegration.viewDialog.addCredentialFields')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Not Integrated State */}
                    {!hasIntegration && (
                        <div className='text-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-dashed border-yellow-300 rounded-xl'>
                            <div className='h-16 w-16 rounded-full bg-yellow-200 flex items-center justify-center mx-auto mb-4'>
                                <AlertCircle className='h-8 w-8 text-yellow-700' />
                            </div>
                            <p className='text-yellow-900 font-bold text-lg'>{t('PartnerIntegration.viewDialog.notIntegratedYet')}</p>
                            <p className='text-sm text-yellow-700 mt-2 max-w-md mx-auto'>
                                {t('PartnerIntegration.viewDialog.notIntegratedDesc')}
                            </p>
                        </div>
                    )}
                </div>

                <div className='flex justify-end gap-3 pt-4 border-t'>
                    <Button onClick={onClose} variant='outline' className='px-6'>
                        {t('PartnerIntegration.viewDialog.close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}