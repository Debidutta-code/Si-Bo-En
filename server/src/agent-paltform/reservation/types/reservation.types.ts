// Agent Booking Payload Interface
export interface IAgentBookingPayload {
    data: {
        bookingDetails: IAgentBookingDetails;
        guestDetails: IAgentGuestDetail[];
        bankDetails?: IBankDetails;
    };
}

export interface IAgentBookingDetails {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    propertyCode: string;
    hotelName: string;
    roomTypeCode: string;
    ratePlanCode: string;
    numberOfRooms: number;
    finalPrice: IAgentFinalPrice;
    promoCode?: string | null;
    currency: 'USD' | 'EUR' | 'INR';
    bookingSource: 'agency';
    email: string; // Primary guest email
    phone: string; // Primary guest phone
    guests: {
        adults: number;
        children: number;
        rooms: number;
    };
    paymentMethod: 'payAtHotel' | 'paymentGateway';
    agencyId?: string; // Will be added by controller
    agentEmail?: string; // Will be added by controller
    selectedAddons?: IAgentSelectedAddon[];
    selectedPromotions?: IAgentSelectedPromotion[];
}

export interface IAgentGuestDetail {
    type: 'adult' | 'child' | 'infant';
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    email?: string;
    phone?: string;
}

export interface IAgentFinalPrice {
    totalAmount: number;
    numberOfNights: number;
    baseRatePerNight: number;
    additionalGuestCharges: number;
    breakdown: {
        totalBaseAmount: number;
        totalAdditionalCharges: number;
        totalIncludedAddons: number;
        subtotal: number;
        agencyCommission: number;
        totalBeforeTax: number;
        totalTax: number;
        totalAmount: number;
        averagePerNight: number;
    };
    dailyBreakdown: Array<{
        date: string;
        dayOfWeek: string;
        ratePlanCode: string;
        baseRate: number;
        additionalCharges: number;
        totalPerRoom: number;
        totalForAllRooms: number;
        currencyCode: string;
        breakdown: any;
    }>;
    availableRooms: number;
    requestedRooms: number;
    includedAddons: Array<{
        addonId: string;
        addonName: string;
        addonCode: string;
        postingRhythm: string;
        amount: number;
        currencyCode: string;
        description: string;
    }>;
    agencyCommission: {
        commissionType: string;
        commissionValue: number;
        commissionAmount: number;
        commissionCurrency: string;
    };
    tax: Array<{
        name: string;
        amount: number;
        type: string;
    }>;
    totalTax: number;
    priceAfterTax: number;
}

export interface IAgentSelectedAddon {
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

export interface IAgentSelectedPromotion {
    id: string;
    promotionType:
        | 'early_bird'
        | 'mlos'
        | 'offer_for_tonight'
        | 'device_specific';
    promotionName?: string;
    ratePlanName?: string;
    discountValue: number;
    discountType: string;
    amount: number;
}

export interface IBankDetails {
    id: string;
    payAtHotel: boolean;
    paymentGateway: boolean;
    createdAt: string;
    updatedAt: string;
}
