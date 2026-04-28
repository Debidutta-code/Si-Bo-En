// types/price-update.types.ts

import { RateTigerAdditionalGuestAmt } from './price-pull.types';

export interface RateTigerPriceUpdateRQ {
    rateAmountMessages: {
        requestId: string;
        timeStamp: string;
        hotelCode: string;
        notifType: 'Delta';
        rateAmountMessage: RateTigerRateAmountMessage[];
    };
}

export interface RateTigerRateAmountMessage {
    rates: Array<
        | { baseByGuestAmts: RateTigerBaseByGuestAmt[] }
        | { additionalGuestAmts: RateTigerAdditionalGuestAmt[] }
    >;
    statusApplicationControl: {
        start: string;
        end: string;
        invTypeCode: string;
        ratePlanCode: string;
    };
}

interface RateTigerBaseByGuestAmt {
    amountBeforeTax?: string;
    amountAfterTax?: string;
    currencyCode: string;
    ageQualifyingCode: string; // '10' = Adult, '8' = Child
    numberOfGuests?: string; // only for adult base prices
}

export interface RateTigerPriceUpdateRS {
    otaRateAmountNotifRS: {
        hotelCode: string;
        requestId: string;
        success: 'true' | 'false';
        timeStamp: string;
        error?: {
            type?: string;
            errorCode?: string;
            text?: string;
        };
    };
}
