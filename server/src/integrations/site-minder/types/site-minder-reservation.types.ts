export type SMResStatus = 'Commit' | 'Modify' | 'Cancel';

export interface SMGuestCount {
    ageQualifyingCode: '10' | '8' | '7';
    count: number;
    age?: number;
}

export interface SMRateDay {
    effectiveDate: string;
    expireDate: string;
    amountBeforeTax: string;
    amountAfterTax: string;
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

export type SMPaymentMethod = 'PAY_AT_HOTEL' | 'PREPAY';

export interface SMReservationPushParams {
    hotelCode: string;
    bookingCode: string;
    resStatus: SMResStatus;
    createDateTime: string;
    lastModifyDateTime?: string;
    channelCode: string;
    channelName: string;
    roomStays: SMRoomStay[];
    primaryGuest: SMGuestProfile;
    currencyCode: string;
    paymentMethod: SMPaymentMethod;
    totalAmountBeforeTax: string;
    totalAmountAfterTax: string;
}


export interface SMReservationResult {
    success: boolean;
    siteMinderResId?: string; // ResID_Value from SiteMinder response
    message: string;
}