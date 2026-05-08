import {
    CurrencyCode,
    TaxApplicableOn,
    TaxType,
} from '../../tax-system/interfaces';

export interface ICSpaPricingR {
    pricingId: string;
    spaSlotId: string;
    price: number;
}
export interface ISpaPricing extends ICSpaPricingR {
    id: string;
}
export interface ISpaPricingWithPricing extends ISpaPricing {}
export interface ICSpaPricing {
    reservationId: string;
    spaSlotId: string;
    spaDateId: string;
}
export interface IDSpaPricing {
    spaSlotId: string;
    spaDateId: string;
    reservationId: string;
}

export interface ISpaReservation {
    id: string;
    amount: number;
    currencyCode: CurrencyCode;
    extraAmountToPay: number;
    pricingBrakedownId: string | null;
    refundAmount: number;
    paidAmount: number;
    ratePlanCode: string;
}

export interface IRateplanTax {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    taxGroup: {
        taxGroupRules: {
            taxRule: {
                id: string;
                name: string;
                currencyCode: CurrencyCode;
                priority: number;
                value: number;
                type: TaxType;
            } | null;
        }[];
    } | null;
}
