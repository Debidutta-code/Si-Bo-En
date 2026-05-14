import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Power, Settings2, Plug, CheckCircle, Shield } from 'lucide-react';
import type { IMasterPartnersWProperty } from '../types';
import { capitalizeFirstLetter } from '@/lib/utils';

interface PartnerIntegrationSectionProps {
    title: string;
    partners: IMasterPartnersWProperty[];
    type: 'channel_manager' | 'pms';
    onIntegrate: (partner: IMasterPartnersWProperty) => void;
    onToggleStatus?: (integrationId: string, currentStatus: boolean) => void;
    onViewDetails?: (partner: IMasterPartnersWProperty) => void;
    onManageFields?: (partner: IMasterPartnersWProperty) => void;
    isLoading: { [key: string]: boolean; }
}

export default function PartnerIntegrationSection({
    title,
    partners,
    type,
    onIntegrate,
    onToggleStatus,
    onViewDetails,
    onManageFields,
    isLoading
}: PartnerIntegrationSectionProps) {
    // console.log(isLoading)
    const filteredPartners = partners.filter(partner => partner.type === type);

    if (filteredPartners.length === 0) {
        return (
            <div className='mt-6 pt-6 border-t'>
                <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
                    <Plug className='h-5 w-5' />
                    {title}
                </h3>
                <div className='text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-300'>
                    <div className='h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4'>
                        <Plug className='h-8 w-8 text-gray-400' />
                    </div>
                    <p className='text-gray-600 font-medium'>
                        No {type === 'channel_manager' ? 'channel manager' : 'PMS'} partners available
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                        Partners will appear here once they are added to the system
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='mt-6 pt-6 border-t'>
            <div className='flex items-center justify-between mb-5'>
                <h3 className='text-lg font-bold flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-lg bg-primary flex items-center justify-center'>
                        <Plug className='h-4 w-4 text-white' />
                    </div>
                    {title}
                </h3>
                <Badge variant='outline' className='text-xs'>
                    {filteredPartners.length} Partner{filteredPartners.length !== 1 ? 's' : ''}
                </Badge>
            </div>
            <div className='grid gap-4 max-h-[500px] overflow-y-auto pr-2'>
                {filteredPartners.map((partner) => {
                    const hasIntegration = partner.propertyIntegrations && 
                                          Array.isArray(partner.propertyIntegrations) && 
                                          partner.propertyIntegrations.length > 0;
                    const integration = hasIntegration ? partner.propertyIntegrations[0] : null;
                    const isActive = integration?.isActive || false;

                    return (
                        <div 
                            key={partner.id} 
                            className={`group p-5 border-2 rounded-xl transition-all duration-200 ${
                                isActive 
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg hover:shadow-xl' 
                                    : hasIntegration 
                                        ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 hover:shadow-lg' 
                                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-md'
                            }`}
                        >
                            <div className='flex justify-between items-start gap-4'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                                            isActive 
                                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' 
                                                : hasIntegration
                                                    ? 'bg-gradient-to-br from-gray-400 to-slate-500 text-white'
                                                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                        }`}>
                                            {partner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className='font-bold text-lg text-gray-900'>{partner.name}</h4>
                                            <div className='flex items-center gap-2 mt-1'>
                                                {isActive && (
                                                    <Badge className='bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs'>
                                                        <CheckCircle className='h-3 w-3 mr-1' /> Active
                                                    </Badge>
                                                )}
                                                {hasIntegration && !isActive && (
                                                    <Badge variant='secondary' className='text-xs'>
                                                        <Shield className='h-3 w-3 mr-1' /> Configured
                                                    </Badge>
                                                )}
                                                {!hasIntegration && (
                                                    <Badge variant='outline' className='text-xs'>
                                                        Available
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Required Fields */}
                                    {partner.requiredFieldsForMasterIntegration.length > 0 && (
                                        <div className='mt-3 p-3 bg-white/50 rounded-lg border border-gray-200'>
                                            <p className='text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1'>
                                                <Shield className='h-3 w-3' />
                                                Required Credentials ({partner.requiredFieldsForMasterIntegration.length}):
                                            </p>
                                            <div className='flex flex-wrap gap-2'>
                                                {partner.requiredFieldsForMasterIntegration.map((field) => (
                                                    <span 
                                                        key={field.id} 
                                                        className='px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-200 rounded-full text-xs font-medium text-indigo-800'
                                                    >
                                                        {capitalizeFirstLetter(field.name.replaceAll('_', ' '))}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats Row */}
                                    <div className='flex gap-4 mt-3'>
                                        {partner.masterIntegrationURLFields.length > 0 && (
                                            <div className='text-xs'>
                                                <span className='text-gray-600'>API Endpoints:</span>
                                                <span className='font-semibold text-gray-900 ml-1'>
                                                    {partner.masterIntegrationURLFields.length}
                                                </span>
                                            </div>
                                        )}
                                        {hasIntegration && integration && (
                                            <div className='text-xs'>
                                                <span className='text-gray-600'>Configured Fields:</span>
                                                <span className='font-semibold text-gray-900 ml-1'>
                                                    {integration.propertyIntegrationSecrets?.length || 0}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    {!hasIntegration ? (
                                        // Not integrated - Show Integrate button
                                        <Button
                                            size='sm'
                                            onClick={() => onIntegrate(partner)}
                                            className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4'
                                        >
                                            <Plug className='h-4 w-4 mr-2' />
                                            Integrate
                                        </Button>
                                    ) : (
                                        // Integrated - Show action buttons
                                        <>
                                            <Button
                                                size='sm'
                                                variant={isActive ? 'destructive' : 'default'}
                                                onClick={() => {
                                                    if (onToggleStatus && integration) {
                                                        onToggleStatus(integration.id, isActive);
                                                    }
                                                }}
                                                className='w-full'
                                            >
                                                <Power className='h-3 w-3 mr-2' />
                                                {isLoading[integration?.id || ''] ? (isActive ? 'Deactivating...' : 'Activating...') : isActive ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            
                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => {
                                                    if (onViewDetails) {
                                                        onViewDetails(partner);
                                                    }
                                                }}
                                                className='w-full'
                                            >
                                                <Eye className='h-3 w-3 mr-2' />
                                                View
                                            </Button>

                                            <Button
                                                size='sm'
                                                variant='outline'
                                                onClick={() => {
                                                    if (onManageFields) {
                                                        onManageFields(partner);
                                                    }
                                                }}
                                                className='w-full'
                                            >
                                                <Settings2 className='h-3 w-3 mr-2' />
                                                Manage
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
