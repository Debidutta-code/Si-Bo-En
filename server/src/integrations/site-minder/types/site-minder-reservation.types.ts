import { GuestDetail } from '../../rate-tiger/types';

export type SMResStatus = 'Commit' | 'Modify' | 'Cancel';

export interface SMGuestCount {
    ageQualifyingCode: '10' | '8' | '7';
    count: number;
    age?: number; // required for children (AgeQualifyingCode=8) and infants (7)
}

export interface SMRateDay {
    effectiveDate: string;   // YYYY-MM-DD (inclusive)
    expireDate: string;      // YYYY-MM-DD (exclusive = next day)
    amountBeforeTax?: string; // discounted nightly base (omit if equal to afterTax)
    amountAfterTax: string;  // discounted nightly base + tax share
    currencyCode: string;
}

export interface SMRoomRate {
    roomTypeCode: string;
    ratePlanCode: string;
    rates: SMRateDay[];
}

export interface SMRoomStay {
    roomTypeCode: string;
    roomTypeName: string;
    ratePlanCode: string;
    ratePlanName: string;
    roomRates: SMRoomRate;
    roomDescription?: string;
    guestCounts: SMGuestCount[];
    checkIn: string;
    checkOut: string;
    totalAmountBeforeTax: string;
    totalAmountAfterTax: string;
    currencyCode: string;
    comments?: string;
    specialRequests?: Array<{ name: string; text: string }>;
}

export interface SMGuestProfile {
    firstName: string;
    lastName: string;
    salutation?: string;
    phone?: string;
    email?: string;
    address?: {
        line1?: string;
        city?: string;
        postalCode?: string;
        state?: string;
        country?: string;
    };
}

// Payment method — only used internally to decide
// whether to include <DepositPayments> in the XML.
// SiteMinder has no explicit payment type field.
export type SMPaymentMethod = 'PAY_AT_HOTEL' | 'PREPAY';

// A single service / addon to be sent at reservation level
export interface SMService {
    inventoryCode: string;   // e.g. 'EXTRA_BED', 'MEAL', 'OTHER', 'PARKING'
    name: string;            // human-readable label for RateDescription
    baseAmount: number;      // per-unit / per-night amount
    totalAmount: number;     // full total for all nights / units
    currencyCode: string;
    isPayLater: boolean;     // payLater = no TimeSpan, not in chargeable total
    startDate?: string;      // YYYY-MM-DD (inclusive) — omit for payLater
    endDate?: string;        // YYYY-MM-DD (inclusive last day, same as start for single night)
}

// A discount entry — rendered as a Comment only (already baked into amounts)
export interface SMDiscount {
    name: string;     // e.g. 'MLOS discount', 'Loyalty discount', 'Promo code'
    amount: number;
    currencyCode: string;
}

export interface SMReservationPushParams {
    hotelCode: string;
    bookingCode: string;
    resStatus: SMResStatus;
    createDateTime: string;       // ISO 8601
    lastModifyDateTime?: string;  // ISO 8601 — required for Modify and Cancel

    channelCode: string;
    channelName: string;
    hotelName: string;
    roomDetails?:string;

    roomStays: SMRoomStay[];
    primaryGuest: SMGuestProfile;
    guestDetails?: GuestDetail[]; // all guests, one per room if available

    currencyCode: string;         // reservation currency (AED, USD, etc.)

    // ResGlobalInfo Total
    // BeforeTax = amountBeforeTax (rooms + addons - all discounts)
    // AfterTax  = currentChargeableAmount (amountBeforeTax + tax, NO payLater)
    totalAmountBeforeTax: string;
    totalAmountAfterTax: string;

    // Payment
    // PAY_AT_HOTEL  → no Guarantee or DepositPayments element
    // PREPAY        → <DepositPayments> with currentChargeableAmount
    paymentMethod: SMPaymentMethod;

    // Services rendered at reservation level (no room link)
    services: SMService[];

    // Discounts — rendered as Comments only (already deducted from totals)
    discounts: SMDiscount[];
}

export interface SMReservationResult {
    success: boolean;
    siteMinderResId?: string;
    message: string;
     rawResponse?: string;
}