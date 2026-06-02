import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IUPropertyConfig, IMasterPartnersWProperty } from '../types';
import { formatTimezoneLabel, getAllTimezones } from '../utils/timezone.utils';
import PartnerIntegrationSection from './PartnerIntegrationSection';
import { currencies } from '@/components/currency-code/cuurency';
import { useTranslation } from 'react-i18next';

interface PropertyConfigDialogProps {
    isOpen: boolean;
    onClose: () => void;
    propertyConfig: IUPropertyConfig;
    setPropertyConfig: (config: IUPropertyConfig) => void;
    masterPartners: IMasterPartnersWProperty[];
    onIntegrate: (partner: IMasterPartnersWProperty) => void;
    onToggleStatus?: (integrationId: string, currentStatus: boolean) => void;
    onViewDetails?: (partner: IMasterPartnersWProperty) => void;
    onManageFields?: (partner: IMasterPartnersWProperty) => void;
    onSave: () => void;
    isSaving?: boolean;
    userLevel?: number;
    isLoading: { [key: string]: boolean; }
}

export default function PropertyConfigDialog({
    isOpen,
    onClose,
    propertyConfig,
    setPropertyConfig,
    masterPartners,
    onIntegrate,
    onToggleStatus,
    onViewDetails,
    onManageFields,
    onSave,
    isSaving = false,
    userLevel,
    isLoading
}: PropertyConfigDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-[800px] max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{t('PropertyConfigDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('PropertyConfigDialog.description')}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    {/* Channel Manager Integration */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='channelManager'>{t('PropertyConfigDialog.switches.channelManager.label')}</Label>
                            <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.channelManager.description')}</p>
                        </div>
                        <Switch
                            id='channelManager'
                            checked={propertyConfig.channelManagerIntegrationActive}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({
                                    ...propertyConfig,
                                    channelManagerIntegrationActive: checked,
                                    pmsIntegrationActive: checked ? false : propertyConfig.pmsIntegrationActive,
                                    selfAriActive: checked ? false : propertyConfig.selfAriActive
                                })
                            }
                        />
                    </div>

                    {/* Channel Manager Partners */}
                    {propertyConfig.channelManagerIntegrationActive && (
                        <PartnerIntegrationSection
                            title={t('PropertyConfigDialog.partnerSections.channelManager')}
                            partners={masterPartners}
                            type='channel_manager'
                            onIntegrate={onIntegrate}
                            onToggleStatus={onToggleStatus}
                            onViewDetails={onViewDetails}
                            onManageFields={onManageFields}
                            isLoading={isLoading}
                        />
                    )}

                    {/* PMS Integration */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='pmsIntegration'>{t('PropertyConfigDialog.switches.pmsIntegration.label')}</Label>
                            <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.pmsIntegration.description')}</p>
                        </div>
                        <Switch
                            id='pmsIntegration'
                            checked={propertyConfig.pmsIntegrationActive}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({
                                    ...propertyConfig,
                                    channelManagerIntegrationActive: checked ? false : propertyConfig.channelManagerIntegrationActive,
                                    pmsIntegrationActive: checked,
                                    selfAriActive: checked ? false : propertyConfig.selfAriActive
                                })
                            }
                        />
                    </div>

                    {/* PMS Partners */}
                    {propertyConfig.pmsIntegrationActive && (
                        <PartnerIntegrationSection
                            title={t('PropertyConfigDialog.partnerSections.pms')}
                            partners={masterPartners}
                            type='pms'
                            onIntegrate={onIntegrate}
                            onToggleStatus={onToggleStatus}
                            onViewDetails={onViewDetails}
                            onManageFields={onManageFields}
                            isLoading={isLoading}

                        />
                    )}

                    {/* Self ARI */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='selfAri'>{t('PropertyConfigDialog.switches.selfAri.label')}</Label>
                            <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.selfAri.description')}</p>
                        </div>
                        <Switch
                            id='selfAri'
                            checked={propertyConfig.selfAriActive}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({
                                    ...propertyConfig,
                                    channelManagerIntegrationActive: checked ? false : propertyConfig.channelManagerIntegrationActive,
                                    pmsIntegrationActive: checked ? false : propertyConfig.pmsIntegrationActive,
                                    selfAriActive: checked
                                })
                            }
                        />
                    </div>

                    {/* B2B Availability */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='isB2bAvailable'>{t('PropertyConfigDialog.switches.b2bAvailability.label')}</Label>
                            <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.b2bAvailability.description')}</p>
                        </div>
                        <Switch
                            id='isB2bAvailable'
                            checked={propertyConfig.isB2bAvailable}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({ ...propertyConfig, isB2bAvailable: checked })
                            }
                        />
                    </div>

                    {/* B2C Availability */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='isB2cAvailable'>{t('PropertyConfigDialog.switches.b2cAvailability.label')}</Label>
                            <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.b2cAvailability.description')}</p>
                        </div>
                        <Switch
                            id='isB2cAvailable'
                            checked={propertyConfig.isB2cAvailable}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({ ...propertyConfig, isB2cAvailable: checked })
                            }
                        />
                    </div>

                    {/* Commission */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='commission'>{t('PropertyConfigDialog.switches.commission.label')}</Label>
                            <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.commission.description')}</p>
                        </div>
                        <Switch
                            id='commission'
                            checked={propertyConfig.commission}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({ ...propertyConfig, commission: checked })
                            }
                        />
                    </div>

                    {/* Show Video - Only for Super Admin */}
                    {userLevel === 4 && (
                        <div className='flex items-center justify-between space-x-2'>
                            <div className='space-y-0.5'>
                                <Label htmlFor='showVideo'>{t('PropertyConfigDialog.switches.showVideo.label')}</Label>
                                <p className='text-xs text-muted-foreground'>
                                    {t('PropertyConfigDialog.switches.showVideo.description')}
                                </p>
                            </div>
                            <Switch
                                id='showVideo'
                                checked={propertyConfig.showVideo}
                                onCheckedChange={(checked) =>
                                    setPropertyConfig({ ...propertyConfig, showVideo: checked })
                                }
                            />
                        </div>
                    )}


                    {/* Timezone */}
                    <div className='space-y-2'>
                        <Label htmlFor='timezone'>{t('PropertyConfigDialog.form.timezone')}</Label>
                        <Select
                            value={propertyConfig.timezone}
                            onValueChange={(value) =>
                                setPropertyConfig({ ...propertyConfig, timezone: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('PropertyConfigDialog.form.timezonePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {getAllTimezones().map((tz) => (
                                    <SelectItem key={tz} value={tz}>
                                        {formatTimezoneLabel(tz)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Base Currency */}
                    <div className='space-y-2'>
                        <Label htmlFor="currencyCode"></Label>
                        <Select
                            value={propertyConfig.baseCurrency}
                            onValueChange={(value) =>
                                setPropertyConfig({ ...propertyConfig, baseCurrency: value })
                            }                                      >
                        </Select>
                    </div>
                </div>
                <div className='flex items-center justify-between space-x-2'>
                    <div className='space-y-0.5'>
                        <Label htmlFor='isAvailableForBooking'>{t('PropertyConfigDialog.switches.isAvailableForBooking.label')}</Label>
                        <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.isAvailableForBooking.description')}</p>
                    </div>
                    <Switch
                        id='isAvailableForBooking'
                        checked={propertyConfig.isAvailableForBooking}
                        onCheckedChange={(checked) =>
                            setPropertyConfig({ ...propertyConfig, isAvailableForBooking: checked })
                        }
                    />
                </div>
                <div className='flex items-center justify-between space-x-2'>
                    <div className='space-y-0.5'>
                        <Label htmlFor='isAvailableForBookingEngine'>{t('PropertyConfigDialog.switches.isAvailableForBookingEngine.label')}</Label>
                        <p className='text-xs text-muted-foreground'>{t('PropertyConfigDialog.switches.isAvailableForBookingEngine.description')}</p>
                    </div>
                    <Switch
                        id='isAvailableForBookingEngine'
                        checked={propertyConfig.isAvailableForBookingEngine}
                        onCheckedChange={(checked) =>
                            setPropertyConfig({ ...propertyConfig, isAvailableForBookingEngine: checked })
                        }
                    />
                </div>
                {userLevel === 4 && (
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='isAvailableForOTA'>{t('PropertyConfigDialog.switches.isAvailableForOTA.label')}</Label>
                            <p className='text-xs text-muted-foreground'>
                                {t('PropertyConfigDialog.switches.isAvailableForOTA.description')}
                            </p>
                        </div>
                        <Switch
                            id='isAvailableForOTA'
                            checked={propertyConfig.isAvailableForOTA}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({ ...propertyConfig, isAvailableForOTA: checked })
                            }
                        />
                    </div>
                )}
                {userLevel === 4 && (
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='isSpaModuleEnabled'>{t('PropertyConfigDialog.switches.isSpaModuleEnabled.label')}</Label>
                            <p className='text-xs text-muted-foreground'>
                                {t('PropertyConfigDialog.switches.isSpaModuleEnabled.description')}
                            </p>
                        </div>
                        <Switch
                            id='isSpaModuleEnabled'
                            checked={propertyConfig.isSpaModuleEnabled}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({ ...propertyConfig, isSpaModuleEnabled: checked })
                            }
                        />
                    </div>
                )}
                {userLevel === 4 && (
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='isLoyaltyProgramEnabled'>{t('PropertyConfigDialog.switches.isLoyaltyProgramEnabled.label')}</Label>
                            <p className='text-xs text-muted-foreground'>
                                {t('PropertyConfigDialog.switches.isLoyaltyProgramEnabled.description')}
                            </p>
                        </div>
                        <Switch
                            id='isLoyaltyProgramEnabled'
                            checked={propertyConfig.isLoyaltyProgramEnabled}
                            onCheckedChange={(checked) =>
                                setPropertyConfig({ ...propertyConfig, isLoyaltyProgramEnabled: checked })
                            }
                        />
                    </div>
                )}
                <DialogFooter>
                    <Button variant='outline' onClick={onClose} disabled={isSaving}>
                        {t('PropertyConfigDialog.footer.cancel')}
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? t('PropertyConfigDialog.footer.saving') : t('PropertyConfigDialog.footer.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
