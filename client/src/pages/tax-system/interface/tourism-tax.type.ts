// Add to your existing interface file

// Tourist Tax Interfaces
export type DiscountType = "flat" | "percentage";
export type CurrencyCode = "USD" | "EUR" | "INR"; // Add more as needed

export interface ITouristTax {
    id: string;
    ratePlanId: string;
    ratePlanCode: string;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    createdAt: Date;
    ratePlan?: {
        id: string;
        ratePlanCode: string;
        ratePlanName: string;
    };
}

export interface ICTouristTax {
    ratePlanCode: string;
    discountType: DiscountType;
    discountValue?: number;
    currencyCode?: CurrencyCode;
}

export interface IUTouristTax {
    discountType: DiscountType;
    discountValue?: number;
    currencyCode?: CurrencyCode;
}