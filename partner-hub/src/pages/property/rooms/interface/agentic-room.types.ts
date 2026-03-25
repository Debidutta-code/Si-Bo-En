// Amenity interfaces
export interface IRoomAmenity {
    id: string;
    amenityName: string;
    amenityType: string;
    description?: string | null;
    icon?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IRoomAmenityItem {
    id: string;
    roomId: string;
    amenityId: string;
    amenity: IRoomAmenity;
}

// Video interface
export interface IRoomVideo {
    id: string;
    roomId: string;
    url: string;
    thumbnail: string | null;
    createdAt: string;
}

// Room details interface
export interface IRoomDetails {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: number;
    roomView: string;
    roomSize: string;
    roomUnit: string;
    smokingPolicy: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    numberOfLivingRoom: number;
    extraBed: number;
    description: string;
    view360Link?: string | null;
    image: string[];
    available: boolean;
    isDeleted: boolean;
    propertyId: string;
    createdAt: string;
    updatedAt: string;
    roomVideos: IRoomVideo | null;
    roomAmenities: IRoomAmenityItem[];
}

// Agentic room interface
export interface IAgenticRoomPrice {
    ratePlanName: string;
    ratePlanCode: string;
    currencyCode: string;
    baseByGuestAmts: {
        numberOfGuests: number;
        amountBeforeTax: number;
        ageQualifyingCode: string;
    }[];
    policy: {
        depositPolicy: null | object;
        cancellationPolicy: null | object;
        guaranteePolicy: null | object;
    };
    availablePromotions: unknown[];
    appliedDiscounts: unknown[];
    touristTax: null | object;
    comboLabel: string;
    addons: unknown[];
    totalAmount: number;
}

export interface IAgenticAmenity {
    id: string;
    amenityName: string;
    amenityType: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IAgenticRoomFull {
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: string;
    roomView: string;
    smokingPolicy: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    numberOfLivingRoom: number | null;
    extraBed: number | null;
    totalRoom: number;
    floor: number;
    description: string | null;
    view360Link: string | null;
    available: boolean;
    isDeleted: boolean;
    propertyId: string;
    images: string[];
    roomVideos: { roomId: string; url: string; thumbnail: string | null } | null;
    amenities: IAgenticAmenity[];
    hasValidRate: boolean;
    roomPrice: IAgenticRoomPrice[];
}

export interface IAgenticRoomsResponse {
    propertyDetails: {
        id: string;
        propertyName: string;
        propertyCode: string;
    };
    rooms: IAgenticRoomFull[];
    searchCriteria: {
        startDate: string;
        endDate: string;
        guests: {
            adults: number;
            children: number;
            rooms: number;
            roomsArray: { adults: number; children: number; childAges: number[] }[];
        };
    };
}

// Rate plan pricing interfaces
export interface IAdditionalGuestAmount {
    id: string;
    chargeId: string;
    ageQualifyingCode: string;
    amount: string;
}

export interface IBaseGuestAmount {
    id: string;
    chargeId: string;
    amountBeforeTax: string;
    numberOfGuests: number;
}

export interface ICharge {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: string;
    date: string;
    isAvailable: boolean;
    isSaleStopped: boolean;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isClosedToArrival: boolean;
    isClosedToDeparture: boolean;
    restrictionNotes: string | null;
    createdAt: string;
    updatedAt: string;
    additionalGuestAmounts: IAdditionalGuestAmount[];
    baseGuestAmounts: IBaseGuestAmount[];
}

export interface IChargePerDay {
    date: string;
    price: number;
    isAvailable: boolean;
    charge: ICharge;
}

// Policy interfaces
export interface ICancellationPolicy {
    // Add fields when available
}

export interface IDepositPolicy {
    // Add fields when available
}

export interface IGuaranteePolicy {
    // Add fields when available
}

// Rate plan interface
export interface IRatePlan {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    deviceType: string[];
    propertyId: string;
    depositPolicyId: string | null;
    cancellationPolicyId: string | null;
    guaranteePolicyId: string | null;
    taxGroupId: string | null;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    cancellationPolicy: ICancellationPolicy | null;
    depositPolicy: IDepositPolicy | null;
    guaranteePolicy: IGuaranteePolicy | null;
}

export interface IRatePlanWithPrice {
    ratePlan: IRatePlan;
    totalPrice: number;
    isAvailable: boolean;
    chargesPerDay: IChargePerDay[];
}

// Room with rate plans
export interface IRoomWithRatePlans {
    room: IAgenticRoomFull;
    ratePlans: IRatePlanWithPrice[];
}

// Date range interface
export interface IDateRange {
    startDate: string;
    endDate: string;
}

// Complete response interface
export interface IRoomResponse {
    rooms: IRoomWithRatePlans[];
    dateRange: IDateRange;
}
