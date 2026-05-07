import { CurrencyCode } from "../../tax-system/interfaces";

export interface ICSpaPricingR {
    pricingId: string;
    spaSlotId: string;
    price: number;
}
export interface ISpaPricing extends ICSpaPricingR {
    id: string;
}
export interface ICSpaPricing {
    reservationId: string;
    spaSlotId: string;
    spaDateId:string;
}

export interface ISpaReservation{
    id: string;
    amount: number;
    currencyCode: CurrencyCode;
    extraAmountToPay: number;
    pricingBrakedownId: string|null;
}