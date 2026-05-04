// types/siteminder.types.ts

// ─── PARSED FROM XML ──────────────────────────────────────────────────────────

export interface SiteMinderSecurityHeader {
    username: string;
    password: string;
}

// ─── RATE AMOUNT NOTIF (Pricing Push) ─────────────────────────────────────────

export interface SiteMinderBaseByGuestAmt {
    amountAfterTax: number;
    currencyCode?: string;
    numberOfGuests?: number;    // OBP: 1, 2, 3... up to MaxOccupancy
    ageQualifyingCode?: string; // '10' = Adult
}

export interface SiteMinderAdditionalGuestAmount {
    ageQualifyingCode: string;  // '8' = Child only (OBP)
    amount: number;
    currencyCode?: string;
}

export interface SiteMinderRateDescription {
    text?: string;
}

export interface SiteMinderRate {
    baseByGuestAmts: SiteMinderBaseByGuestAmt[];
    additionalGuestAmounts?: SiteMinderAdditionalGuestAmount[];
    rateDescription?: SiteMinderRateDescription;
}

export interface SiteMinderStatusApplicationControl {
    start: string;
    end: string;
    invTypeCode: string;
    ratePlanCode?: string;
}

export interface SiteMinderRateAmountMessage {
    statusApplicationControl: SiteMinderStatusApplicationControl;
    rates: SiteMinderRate;
}

export interface SiteMinderRateAmountNotifRQ {
    echoToken: string;
    timeStamp: string;
    version: string;
    hotelCode: string;
    rateAmountMessages: SiteMinderRateAmountMessage[];
}


export interface SiteMinderLengthOfStay {
    time: string;
    timeUnit: string;
    minMaxMessageType: 'SetMinLOS' | 'SetMaxLOS' | 'SetForwardMinStay' | 'SetForwardMaxStay';
}

export interface SiteMinderRestrictionStatus {
    status: 'Open' | 'Close';
    restriction?: 'Master' | 'Arrival' | 'Departure';
}

export interface SiteMinderAvailStatusMessage {
    start: string;
    end: string;
    invTypeCode: string;
    ratePlanCode?: string;
    bookingLimit?: number;
    lengthsOfStay?: SiteMinderLengthOfStay[];
    restrictionStatuses?: SiteMinderRestrictionStatus[];
}

export interface SiteMinderHotelAvailNotifRQ {
    echoToken: string;
    timeStamp: string;
    version: string;
    hotelCode: string;
    availStatusMessages: SiteMinderAvailStatusMessage[];
}

export interface SiteMinderError {
    type: number;
    code?: number;
    text: string;
}

export interface SiteMinderRateAmountNotifRS {
    echoToken: string;
    timeStamp: string;
    version: string;
    success: boolean;
    errors?: SiteMinderError[];
}

export interface SiteMinderHotelAvailNotifRS {
    echoToken: string;
    timeStamp: string;
    version: string;
    success: boolean;
    errors?: SiteMinderError[];
}

export interface SiteMinderProcessResult {
    success: boolean;
    errors?: SiteMinderError[];
}

export interface SiteMinderParsedRequest {
    type: 'rates' | 'availability';
    security: SiteMinderSecurityHeader;
    ratesPayload?: SiteMinderRateAmountNotifRQ;
    availPayload?: SiteMinderHotelAvailNotifRQ;
}