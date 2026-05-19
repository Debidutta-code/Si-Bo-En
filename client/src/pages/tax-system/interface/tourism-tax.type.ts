// Add to your existing interface file

import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

// Tourist Tax Interfaces
export type DiscountType = "flat" | "percentage";

export interface ITouristTax {
    id: string;
    roomId: string;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    createdAt: Date;
    name:string;
    Room?: {
        id: string;
        roomCode: string;
        roomName: string;
    };
    _translations?:{
        name:string;
    }
}

export interface ICTouristTax {
    name:string;
    roomId: string;
    discountType: DiscountType;
    discountValue?: number;
    currencyCode?: CurrencyCode;
}

export interface IUTouristTax {
    discountType: DiscountType;
    discountValue?: number;
    currencyCode?: CurrencyCode;
}