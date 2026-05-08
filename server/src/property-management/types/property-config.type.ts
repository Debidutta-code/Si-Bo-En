import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface IUPropertyConfig {
    channelManagerIntegrationActive: boolean;
    pmsIntegrationActive: boolean;
    baseCurrency: CurrencyCode;
    commission: boolean;
    isB2cAvailable: boolean;
    isB2bAvailable: boolean;
    reservationResetMinutes: number;
    selfAriActive: boolean;
    timezone: string;
    showVideo: boolean;
    isAvailableForBooking: boolean;
    isAvailableForOTA: boolean;
}
