import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface IUPropertyConfig {
    channelManagerIntegrationActive: boolean;
    pmsIntegrationActive: boolean;
    baseCurrency: CurrencyCode;
    commission: boolean;
    isB2cAvailable: boolean;
    isB2bAvailable: boolean;
    selfAriActive: boolean;
    timezone: string;
    showVideo: boolean;
    isAvailableForBooking: boolean;
    isAvailableForOTA: boolean;
    isAvailableForBookingEngine: boolean;
    isSpaModuleEnabled: boolean;
    isLoyaltyProgramEnabled: boolean;
}
export interface IPropertyConfig extends IUPropertyConfig {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}