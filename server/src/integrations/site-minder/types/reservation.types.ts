export interface RTReservationSuccessResponse {
    hotelReservation: {
        hotelCode: string;
        timeStamp: string;
        success: 'true' | 'false';
        error?: {
            type: string;
            errorCode: string;
        };
        uniqueID: {
            type: string;
            idValue: string;
        };
        resGlobalInfo: {
            hotelReservationIDs: Array<{
                resIDType: string;
                resIDValue: string;
            }>;
        };
    };
}

export interface RTReservationErrorResponse {
    status: 'Error';
    uniqueID: string;
    timeStamp: string;
    error: {
        code: string;
        text: string;
    };
}

export type RTReservationResponse =
    | RTReservationSuccessResponse
    | RTReservationErrorResponse;

// ─── RT Outbound Interfaces ───────────────────────────────────────────────────

export interface RTGuarantee {
    guaranteeType: 'None' | 'PrePay' | 'Deposit' | 'CC/DC/Voucher';
    guaranteeCode?: string;
}

export interface RTRoomStay {
    roomStayID: string;
    mealPlanIndicator: string;
    isGuestPerRoom: string;
    guestCount: Array<{
        ageQualifyingCode: '10' | '8';
        count: string;
    }>;
    roomRates: Array<{
        invCode: string;
        ratePlanCode: string;
        numberOfUnits: string;
        rates: Array<{
            effectiveDate: string;
            expireDate: string;
            currencyCode: string;
            amountBeforeTax?: string;
            amountAfterTax?: string;
        }>;
    }>;
    timeSpan: {
        start: string;
        end: string;
    };
    totalPrice: {
        amountBeforeTax?: string;
        amountAfterTax: string;
        taxAmount: string;
    };
    guestIDs: string[];
    comments: Array<{
        text: string;
        guestViewable: string;
    }>;
    specialRequests: Array<{
        requestCode: string;
        text: string;
    }>;
}

export interface RTGuestDetail {
    guestID: string;
    profileType: string;
    personName: {
        salutation?: string;
        firstName: string;
        middleName: string;
        surName: string;
    };
    telePhone: {
        phoneNo: string;
        phoneTechType: string;
        locationType: string;
    };
    email: string;
    address: {
        addressType: string;
        addressLine: string;
        city: string;
        postalCode: string;
        state: string;
        countryCode: string;
    };
}

export interface RTService {
    serviceID: string;
    serviceCode: string;
    units: string;
    amountBeforeTax?: string;
    amountAfterTax?: string;
    isInclusive: string;
    effectiveDate?: string;
    serviceDescription?: string;
}

// ─── RT Payload Types — Commit/Modify vs Cancel have different resGlobalInfo ──

export interface RTCommitModifyPayload {
    hotelReservation: {
        hotelCode: string;
        resStatus: 'Commit' | 'Modify';
        createDateTime?: string;
        lastModifiedDateTime?: string;
        creatorID: string;
        timeStamp: string;
        pos: {
            channelCode: string;
            channelName: string;
        };
        currency?: string;
        uniqueID: {
            type: string;
            idValue: string;
        };
        roomStays?: RTRoomStay[];
        guarantee?: RTGuarantee;
        guestDetails?: RTGuestDetail[];
        services?: RTService[];
        resGlobalInfo: {
            hotelReservationIDs: Array<{
                resIDType: string;
                resIDValue: string;
            }>;
        };
    };
}

export interface RTCancelPayload {
    hotelReservation: {
        hotelCode: string;
        resStatus: 'Cancel';
        createDateTime?: string;
        lastModifiedDateTime?: string;
        creatorID: string;
        timeStamp: string;
        pos: {
            channelCode: string;
            channelName: string;
        };
        uniqueID: {
            type: string;
            idValue: string;
        };
        resGlobalInfo: {
            resIDType: string;
            resIDValue: string;
        };
    };
}

export type RTReservationPayload = RTCommitModifyPayload | RTCancelPayload;

// ─── Your Internal Payload Types ─────────────────────────────────────────────

export interface DailyBreakdown {
    date: string;
    dayOfWeek: string;
    ratePlanCode: string;
    baseRate: number;
    additionalCharges: number;
    totalDailyTaxedAmount: number;
    totalPerRoom: number;
    totalForAllRooms: number;
    currencyCode: string;
}

export interface SelectedAddon {
    addonId: string;
    addonName: string;
    addonCode: string;
    availabilityId: string;
    date: string;
    price: number;
    quantity: number;
    totalPrice: number;
    type: string;
}
export interface RTDynamicConfig {
    authUrl: string;
    reservationUrl: string;
    partnerId: string;
    partnerName: string;
    rateTigerPropertyCode: string; // ✅ ADD THIS
}

export interface GuestDetail {
    type: 'adult' | 'child';
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    salutation?: 'Mr.' | 'Mrs.' | 'Ms.' | 'Mstr.' | 'Miss' | 'Dr.';
}

export interface FinalPrice {
    totalAmount: number;
    totalTax: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    numberOfNights: number;
    dailyBreakdown: DailyBreakdown[];
    taxedAmount?: number;
    userAddons?: {
        selected: SelectedAddon[];
        totalAmount: number;
    };
}

export interface BookingDetails {
    startDate: string;
    endDate: string;
    propertyCode: string;
    hotelName: string;
    roomTypeCode: string;
    ratePlanCode: string;
    numberOfRooms: number;
    currency: string;
    email: string;
    phone: string;
    bookingSource: string;
    paymentMethod: string;
    finalPrice: FinalPrice;
    selectedAddons: SelectedAddon[];
    guestDetails: GuestDetail[];
    guests: {
        adults: number;
        children: number;
        rooms: number;
        roomsArray: Array<{
            // ← ADD
            adults: number;
            children: number;
        }>;
    };
}

export interface IncomingBookingPayload {
    bookingDetails: BookingDetails;
    guestDetails: GuestDetail[];
    bankDetails: {
        propertyId: string;
        payAtHotel: boolean;
        paymentGateway: boolean;
    };
    timezone?: string;
    countryCode?: string;
    deviceTypes?: string;
}

// ─── Payment → Guarantee Mapping ─────────────────────────────────────────────

export type PaymentMethodType =
    | 'pay_at_hotel'
    | 'net_banking'
    | 'upi'
    | 'payment_gateway';

export const PAYMENT_TO_GUARANTEE_MAP: Record<PaymentMethodType, RTGuarantee> =
    {
        pay_at_hotel: { guaranteeType: 'None' },
        net_banking: { guaranteeType: 'PrePay' },
        upi: { guaranteeType: 'PrePay' },
        payment_gateway: { guaranteeType: 'PrePay' },
    };

// CHANGE TO:
export interface ExistingReservation {
    id: string;
    bookingCode: string;
    propertyCode: string | null;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    currencyCode: string;
    bookingSource: string;
    bookedAt: Date;
    checkInDate: Date;
    checkOutDate: Date;
    amount: number;
    guests: GuestDetail[];
    bookingUserEmail: string; // ← from DB: booking_user_email
    bookingUserPhone: string | null; // ← from DB: booking_user_phone
    countryCode: string; // ← from DB: country_code
    hotelName: string | null; // ← already in DB, add while we're here
    paymentMethod: string; // ← already in DB, add while we're here
    finalPrice: {
        requestedRooms?: number;
        totalTax?: number;
        roomsArray?: Array<{
            adults: number;
            children: number;
        }>;
        [key: string]: any;
    } | null;
}

// ─── Update Payload shape ─────────────────────────────────────────────────────

export interface RTUpdatePayload {
    checkInDate: string | Date;
    checkOutDate: string | Date;
    amount: number;
    finalPrice?: {
        totalTax?: number;
        [key: string]: any;
    };
}
