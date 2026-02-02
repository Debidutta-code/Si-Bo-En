import { CurrencyCode } from "../../pms/frontoffice/payment/types";

export interface IUPropertyConfig {
  channelManagerIntegrationActive: boolean,
  pmsIntegrationActive: boolean,
  baseCurrency: CurrencyCode,
  commission: boolean,
  isB2cAvailable: boolean,
  isB2bAvailable: boolean,
  reservationResetMinutes: number,
  selfAriActive: boolean,
  timezone: string,
}