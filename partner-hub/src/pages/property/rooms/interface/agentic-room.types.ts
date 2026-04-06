// ─── Amenity interfaces ────────────────────────────────────────────────────────

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

// ─── Video interface ───────────────────────────────────────────────────────────

export interface IRoomVideo {
    id: string;
    roomId: string;
    url: string;
    thumbnail: string | null;
    createdAt: string;
}

// ─── Room details interface ────────────────────────────────────────────────────

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

// ─── Tourist tax ───────────────────────────────────────────────────────────────

export interface ITouristTax {
    id: string;
    name: string;
    discountType: "flat" | "percentage";
    discountValue: number;
    currencyCode: string;
    calculatedTaxAmount: number;
}

// ─── Addon interfaces ──────────────────────────────────────────────────────────

export interface IAddonCategory {
    id: string;
    name: string;
    code: string;
}

export interface IAddonVariant {
    id: string;
    name: string;
    code: string;
}

export interface IRoomAddon {
    id: string;
    name: string;
    code: string;
    price: number;
    postingRhythm: string;
    description: string;
    images: string[];
    category: IAddonCategory;
    subCategory: IAddonCategory;
    addonVariant: IAddonVariant;
}

// ─── Policy interfaces ─────────────────────────────────────────────────────────

export interface ICancellationPolicy {
    id?: string;
    name?: string;
    description?: string;
}

export interface IDepositPolicy {
    id?: string;
    name?: string;
    description?: string;
}

export interface IGuaranteePolicy {
    id?: string;
    name?: string;
    description?: string;
}

export interface IRatePlanPolicy {
    depositPolicy: IDepositPolicy | null;
    cancellationPolicy: ICancellationPolicy | null;
    guaranteePolicy: IGuaranteePolicy | null;
}

// ─── Rate plan pricing ─────────────────────────────────────────────────────────

export interface IBaseByGuestAmt {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string; // "10" = adult, "8" = child
}

export interface IAppliedDiscount {
    id: string;
    promotionName: string;
    promotionType: string;
    calculatedDiscountAmount: number;
}

export interface IAvailablePromotion {
    id: string;
    promotionName: string;
    promotionType: string;
    discountValue: number;
    minLos?: number;
    advanceBookingDays?: number;
    validTo?: string | null;
}

export interface IAgenticRoomPrice {
    ratePlanName: string;
    ratePlanCode: string;
    currencyCode: string;
    baseByGuestAmts: IBaseByGuestAmt[];
    policy: IRatePlanPolicy;
    availablePromotions: IAvailablePromotion[];
    appliedDiscounts: IAppliedDiscount[];
    touristTax: ITouristTax | null;
    comboLabel: string;
    addons: IRoomAddon[];
    totalAmount: number;
}

// ─── Agentic amenity ───────────────────────────────────────────────────────────

export interface IAgenticAmenity {
    id: string;
    amenityName: string;
    amenityType: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// ─── Full room with pricing ────────────────────────────────────────────────────

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

// ─── Rooms response ────────────────────────────────────────────────────────────

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

// ─── Agent pricing response ────────────────────────────────────────────────────

export interface IAgentPricingResponse {
    // Extend this as the pricing endpoint response shape becomes known
    [key: string]: unknown;
}

// ─── Charge interfaces ─────────────────────────────────────────────────────────

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

// ─── Rate plan interface ───────────────────────────────────────────────────────

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

// ─── Room with rate plans ──────────────────────────────────────────────────────

export interface IRoomWithRatePlans {
    room: IAgenticRoomFull;
    ratePlans: IRatePlanWithPrice[];
}

export interface IDateRange {
    startDate: string;
    endDate: string;
}

export interface IRoomResponse {
    rooms: IRoomWithRatePlans[];
    dateRange: IDateRange;
}