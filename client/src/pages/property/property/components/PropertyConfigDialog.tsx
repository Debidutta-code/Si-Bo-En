import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { IUPropertyConfig, IMasterPartnersWProperty } from '../types';
import { formatTimezoneLabel, getAllTimezones } from '../utils/timezone.utils';
import { minutesToTime, timeToMinutes } from '../utils/time.utils';
import PartnerIntegrationSection from './PartnerIntegrationSection';
import { currencies } from '@/components/currency-code/cuurency';

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
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-w-[800px] max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Property Configuration</DialogTitle>
                    <DialogDescription>
                        Update property settings and integrations. Only Super Admin can modify these settings.
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    {/* Channel Manager Integration */}
                    <div className='flex items-center justify-between space-x-2'>
                        <div className='space-y-0.5'>
                            <Label htmlFor='channelManager'>Channel Manager Integration</Label>
                            <p className='text-xs text-muted-foreground'>Enable channel manager integration</p>
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
                            title='Available Channel Manager Partners'
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
                            <Label htmlFor='pmsIntegration'>PMS Integration</Label>
                            <p className='text-xs text-muted-foreground'>Enable PMS integration</p>
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
                            title='Available PMS Partners'
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
                            <Label htmlFor='selfAri'>Self ARI</Label>
                            <p className='text-xs text-muted-foreground'>Enable self availability, rates, and inventory</p>
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
                            <Label htmlFor='isB2bAvailable'>B2B Availability</Label>
                            <p className='text-xs text-muted-foreground'>Enable B2B booking channel</p>
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
                            <Label htmlFor='isB2cAvailable'>B2C Availability</Label>
                            <p className='text-xs text-muted-foreground'>Enable B2C booking channel</p>
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
                            <Label htmlFor='commission'>Commission</Label>
                            <p className='text-xs text-muted-foreground'>Enable commission on bookings</p>
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
                                <Label htmlFor='showVideo'>Show Video In Booking Engine</Label>
                                <p className='text-xs text-muted-foreground'>
                                    Enable this to show property video in booking engine
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

                    {/* Reservation Reset Time */}
                    <div className='space-y-2'>
                        <Label htmlFor='reservationResetTime'>Reservation Reset Time</Label>
                        <Input
                            id='reservationResetTime'
                            type='time'
                            value={minutesToTime(propertyConfig.reservationResetMinutes)}
                            onChange={(e) => {
                                const minutes = timeToMinutes(e.target.value);
                                setPropertyConfig({ ...propertyConfig, reservationResetMinutes: minutes });
                            }}
                        />
                        <p className='text-xs text-muted-foreground'>
                            Time when daily reservations reset
                        </p>
                    </div>

                    {/* Timezone */}
                    <div className='space-y-2'>
                        <Label htmlFor='timezone'>Timezone</Label>
                        <Select
                            value={propertyConfig.timezone}
                            onValueChange={(value) =>
                                setPropertyConfig({ ...propertyConfig, timezone: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder='Select timezone' />
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
                        <Label htmlFor="currencyCode">Currency Code</Label>
                        <Select
                            value={propertyConfig.baseCurrency}
                            onValueChange={(value) =>
                                setPropertyConfig({ ...propertyConfig, baseCurrency: value })
                            }                                      >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                        {currency.name} ({currency.symbol})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant='outline' onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
