// types/price-pull.types.ts

// ─── REQUEST ───────────────────────────────────────────

export interface RateTigerRatePlanRequest {
    ratePlanCode: string;
    start: string;
    end: string;
}

export interface RateTigerOTAHotelRatePlanRQ {
    otaHotelRatePlanRQ: {
        requestId: string;
        timeStamp: string;
        hotelCode: string;
        ratePlans: RateTigerRatePlanRequest[];
    };
}

// ─── RESPONSE ──────────────────────────────────────────

export interface RateTigerBaseByGuestAmt {
    amountBeforeTax?: string;
    amountAfterTax?: string;
    ageQualifyingCode: string; // "10" = Adult, "8" = Child
    numberOfGuests: string; // "1" to "6" for adults, "1" for child
}

export interface RateTigerAdditionalGuestAmt {
    amount: string;
    ageQualifyingCode: string; // "10" = Extra Adult, "8" = Extra Child
}

export interface RateTigerRate {
    start: string;
    end: string;
    invTypeCode: string;
    baseByGuestAmts: RateTigerBaseByGuestAmt[];
    additionalGuestAmts: RateTigerAdditionalGuestAmt[];
}

export interface RateTigerRatePlanPrice {
    ratePlanCode: string;
    currencyCode: string;
    rates: RateTigerRate[];
}

export interface RateTigerOTAHotelRatePlanRS {
    otaHotelRatePlanRS: {
        requestId: string;
        timeStamp: string;
        hotelCode: string;
        success: string;
        ratePlans?: RateTigerRatePlanPrice[];
        error?: {
            type?: string;
            errorCode?: string;
            text?: string;
        };
    };
}

// ─── INTERNAL DAO TYPES ────────────────────────────────

export interface PricePullChargeResult {
    ratePlanCode: string;
    roomTypeCode: string;
    currencyCode: string;
    date: Date;
    baseByGuestAmounts: Array<{
        numberOfGuests: number;
        amountBeforeTax: number;
    }>;
    additionalGuestAmounts: Array<{
        ageQualifyingCode: string;
        amount: number;
    }>;
}
