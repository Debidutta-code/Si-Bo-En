import { Decimal } from "@prisma/client/runtime/library";

export type DiscountType = 'flat' | 'percentage';
export type CurrencyCode = 'USD' | 'EUR' | 'INR';

export interface ICTouristTax {
    ratePlanCode: string;
    discountType: DiscountType;
    discountValue?: number | null;
    currencyCode?: CurrencyCode | null;
}

export interface IGetTouristTax extends ICTouristTax {
    id: string;
    ratePlanId: string;
    createdAt: Date;
    ratePlan?: {
        id: string;
        ratePlanCode: string;
        ratePlanName: string;
    };
}