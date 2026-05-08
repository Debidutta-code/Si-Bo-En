// src/modules/google-feeds/interfaces/google-feeds.interface.ts

export interface IGoogleHotelListItem {
    hotelId: string; // propertyCode
    hotelName: string;
    addressLine1: string;
    addressLine2?: string | null; // ✅ Changed from string | undefined to string | null | undefined
    city: string;
    state: string;
    country: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    phoneNumber: string;
    websiteUrl?: string;
}

export interface IGooglePriceItem {
    hotelId: string; // propertyCode
    roomId: string;
    roomName: string;
    roomDescription?: string | null; // ✅ Also allow null
    maxOccupancy: number;
    ratePlanId: string;
    ratePlanName: string;
    checkInDate: string; // YYYY-MM-DD
    nights: number;
    baseRate: number;
    tax: number;
    otherFees: number;
    currencyCode: string;
}

export interface IGoogleLandingPageItem {
    hotelId: string;
    ratePlanId: string;
    occupancy: number;
    baseRate: number;
    tax: number;
    otherFees: number;
    currencyCode: string;
    landingPageUrl: string;
}

export interface IPropertyForFeed {
    id: string;
    propertyCode: string;
    propertyName: string;
    propertyContact: string;
    propertyAddress: {
        addressLine1: string;
        addressLine2?: string | null; // ✅ Changed to allow null
        city: string;
        state: string;
        country: string;
        zipCode: string;
        latitude: number;
        longitude: number;
    };
}

export interface IRoomPriceForFeed {
    roomId: string;
    roomName: string;
    roomDescription?: string | null; // ✅ Allow null
    maxOccupancy: number;
    ratePlanCode: string;
    ratePlanName: string;
    totalAmount: number;
    currencyCode: string;
}
