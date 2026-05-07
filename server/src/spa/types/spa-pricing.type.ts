import { CurrencyCode } from "../../tax-system/interfaces";

export interface ICSpaPricingR {
    pricingId: string;
    spaSlotId: string;
    price: number;
}
export interface ISpaPricing extends ICSpaPricingR {
    id: string;
}
export interface ISpaPricingWithPricing extends ISpaPricing {
}
export interface ICSpaPricing {
    reservationId: string;
    spaSlotId: string;
    spaDateId:string;
}
export interface IDSpaPricing {
    spaSlotId: string;
    spaDateId:string;
    reservationId: string;
}

export interface ISpaReservation{
    id: string;
    amount: number;
    currencyCode: CurrencyCode;
    extraAmountToPay: number;
    pricingBrakedownId: string|null;
    refundAmount: number;
    paidAmount: number;
}