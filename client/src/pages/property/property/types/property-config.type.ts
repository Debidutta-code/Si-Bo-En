export interface IUPropertyConfig {
    pmsIntegrationActive: boolean;
    channelManagerIntegrationActive: boolean;
    selfAriActive: boolean;
    reservationResetMinutes: number;
    isB2bAvailable?: boolean;
    isB2cAvailable?: boolean;
    commission?: boolean;
    timezone?: string;
    baseCurrency?: string;
    showVideo:boolean;
}