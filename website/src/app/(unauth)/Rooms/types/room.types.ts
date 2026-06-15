import { CurrencyCode } from "@/src/components/currencyCode/currency-code.type";
import { IPropertyLoyalityWithLoyality } from "../interface";
import { IBookingEngineConfig } from "./property-details.type";
import { AddonAvailability } from "@/src/components/RoomPage/AddonSelectionModal";

export interface IPropertyDetails {
    id: string;
    propertyName: string;
    propertyCode: string;
    starRating: number
    propertyVideos: IPropertyVideos | null;
    loyaltyProgramConfig: IPropertyLoyalityWithLoyality | null;
    bookingEngineConfig: IBookingEngineConfig | null;
    address: IPropertyAddress;
    propertyConfigs: IPropertyConfigs;
    _translations?: ITranslatedPropertyDetails
}
export interface ITranslatedPropertyDetails {
    propertyName: string;
    description: string;
}

export interface IPropertyConfigs {
    isSpaModuleEnabled: boolean
    isLoyaltyProgramEnabled: boolean
    showVideo: boolean
    isB2cAvailable: boolean
}

export interface IPropertyAddress {
    id: string;
    propertyId: string;
    addressLine1: string;
    addressLine2: string | null;
    country: string;
    state: string;
    city: string;
    location: string;
    landmark: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    _translations?: ITranslatedPropertyAddress
}

export interface ITranslatedPropertyAddress {
    addressLine1: string;
    addressLine2: string;
    country: string;
    state: string;
    city: string;
    location: string;
    landmark: string;
}
export interface IPropertyVideos {
    id: string
    propertyId: string
    url: string
    thumbnail: string
    createdAt: string
}
export interface IRoom {
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: RoomUnit;
    priority: number;
    roomView: IRoomView;
    numberOfBedrooms: number;
    maxOccupancy: number;
    description: string;
    images: string[];
    amenities: IAmenity[];
    hasValidRate: boolean;
    roomPrice: IRoomPrice[];
    roomVideos: IRoomVideo | null;
    _translations?: IRoomTranslated;
}
export interface IRoomTranslated {
    roomName: string;
    roomType: string;
    description: string;
}
export interface IRoomVideo {
    id: string;
    roomId: string;
    url: string;
    thumbnail: string;
    createdAt: string;
}
export interface IAmenity {
    id: string;
    amenityName: string;
    amenityType: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    _translations?: ITranslatedAmenity
}
export interface ITranslatedAmenity {
    amenityName: string
    description: string
}
export interface IRoomPrice {
    ratePlanId: string;
    ratePlanName: string;
    ratePlanCode: string;
    currencyCode: CurrencyCode;
    baseByGuestAmts: IBaseByGuestAmts[];
    policy: IPolicy;
    availablePromotions: IAvailablePromotions[];
    appliedDiscounts: IAppliedDiscounts[];
    comboLabel: {
        id: string;
        label: string;
        _translations: {
            name: string;
            description: string;
        };
    };
    addons: IAddonsWithRatePlan[];
    totalAmount: number;
    touristTax: ITouristTax | null;
    _translations?: {
        ratePlanName: string;
        comboLabel?: string;
    };
}
export type IPromotionType = "mlos" | "normal" | "early_bird" | "device_specific" | "offer_for_tonight";

export interface IAvailablePromotions {
    id: string;
    promotionName: string;
    promotionType: IPromotionType;

    discountType: IDiscountType;
    discountValue: number;

    minLos?: number;
    maxLos?: number;

    validFrom: string | null;
    validTo: string | null;

    advanceBookingDays: number | null;

    monApplicable?: boolean;
    tueApplicable?: boolean;
    wedApplicable?: boolean;
    thuApplicable?: boolean;
    friApplicable?: boolean;
    satApplicable?: boolean;
    sunApplicable?: boolean;
    _translations?: {
        promotionName: string;
    }
}
export interface IAppliedDiscounts {
    id: string;
    promotionName: string;
    promotionType: IPromotionType;
    discountType: IDiscountType;
    discountValue: number;
    calculatedDiscountAmount: number;
    _translations?: {
        promotionName: string;
    }
}
export interface IAddonsWithRatePlan {
    id: string;
    name: string;
    code: string;
    price: number;
    postingRhythm: IPostingRhythm;
    description: string;
    images: string[];
    category: IAddonCategory;
    subCategory: IAddonSubCategory;
    addonVariant: IAddonVariant;
}
export type IPostingRhythm =
    | 'per_night'
    | 'per_stay'
    | 'per_person_per_night'
    | 'per_person_per_stay'
    | 'per_person_per_room'
    | 'per_room'
    | 'per_room_per_night';


export interface IAddonCategory {
    id: string;
    name: string;
    code: string;
}
export interface IAddonSubCategory {
    id: string;
    name: string;
    code: string;
}
export interface IAddonVariant {
    id: string;
    name: string;
    code: string;
}
export interface ITouristTax {
    id: string;
    name: string;
    discountType: IDiscountType;
    discountValue: number;
    currencyCode: CurrencyCode;
    calculatedTaxAmount: number;
    _translations?:{
        name:string
    }
}
export type IDiscountType = "flat" | "percentage"
export interface IPolicy {
    depositPolicy: IPolicyDetails | null;
    cancellationPolicy: IPolicyDetails | null;
    guaranteePolicy: IPolicyDetails | null;
}
export interface IPolicyDetails {
    id: string;
    policyName: string;
    type: IPolicyType;
    description: string;
    propertyId: string;
    _translations?:IPolicyTranslation;
}
export interface IPolicyTranslation {
  policyName: string;
  description: string;
}
export type IPolicyType = "deposit" | "cancellation" | "guarantee"
export interface IBaseByGuestAmts {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string;
}
export type RoomUnit = "sqft" | "mtr";
export interface IRoomView {
    id: string;
    roomId: string;
    masterRoomViewId: string;
    MasterRoomView: IMasterRoomView;
    _translations?: ITranslatedRoomView;
}
export interface ITranslatedRoomView {
    viewName: string;
}
export interface IMasterRoomView {
    id: string;
    viewName: string;
    isActive: boolean;
    metaData: string | null;
}


export interface IRoomGuest {
    rooms: number;
    adults: number;
    children: number;
    roomsArray: IRoomGuestDetail[];
}

export interface IRoomGuestDetail {
    adults: number;
    children: number;
    childAges: number[];
}

export interface IFetchRoomsRequest {
    propertyCode: string;
    startDate: string;
    endDate: string;
    guests: IRoomGuest;
    location: string;
    numberOfRooms: number;
    promocode: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export interface IFetchRoomsResponse {
    success: boolean;
    status: string;
    message: string;
    data: IFetchRoomsData;
}

export interface IFetchRoomsData {
    rooms: IRoom[];
    propertyDetails: IPropertyDetails
}

export interface IAddon {
    id: string;
    name: string;
    code: string;
    price: number;
    description: string;
    images: string[];
}

// ─── Guest form ───────────────────────────────────────────────────────────────

export interface IGuest {
    type: "adult" | "child";
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}


export interface IPriceSummaryData {
    room: IRoom;
    ratePlan: IRoomPrice;
    selectedAddons: ISelectedAddon[];
    basePrice: number;
    totalAddonsPrice: number;
    finalprice?: IFinalPrice;
}

export interface IDailyPriceBreakdown {
    date: string;
    baseChargesAmount: number;
    additionalChargesAmount: number;
    totalAmount: number;
    currencyCode: CurrencyCode;
    // normalized additions (added by normalizePriceBreakdown)
    ratePlanCode?: string;
    dayOfWeek?: string;
    baseRate?: number;
    totalPerRoom?: number;
    totalForAllRooms?: number;
    // raw additions from API
    roomNumber?: string;
    guestDistribution?: IGuestDistribution;
    addOnBrakeDown?: IAddonBreakdownItem[];
}

export interface IGuestDistribution {
    adults: number;
    children: number;
    childAges: number[];
}

export interface IAddonBreakdownItem {
    addonId: string;
    name: string;
    amount: number;
    quantity: number;
    totalAmount: number;
    type: IAddonBreakdownType;
    currencyCode: string;
    date: string;
}

export type IAddonBreakdownType = "included" | "selected";

export interface ITaxBreakdownItem {
    id: string;
    name: string;
    taxedAmount: number;
    currencyCode: string;
}

export type IPromotionRestrictionType = "decrease" | "payLater" | "increase";
export type IPromotionAppliedType = "auto_applied" | "user_applied";

export interface IPromotionBreakdownItem {
    id: string;
    promotionType: IPromotionType;
    name: string;
    currencyCode: string | null;
    discountAmount: number;
    discountType: IDiscountType;
    discountValue: number;
    restrictionType: IPromotionRestrictionType;
    type: IPromotionAppliedType;
}

export interface IRawPriceBreakdown {
    totalAmount: number;
    amountBeforeTax: number;
    taxedAmount: number;
    totalAddonAmount: number;
    totalPromotionAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    promoCodeDiscount: number;
    loyalityDiscount: number;
    currencyCode: string;
    dailyPriceBrakeDown: IDailyPriceBreakdown[];
    taxBrakeDown: ITaxBreakdownItem[];
    addonBrakeDowns: IAddonBreakdownItem[];
    promotionBrakeDown: IPromotionBreakdownItem[];
}

export interface IFinalPrice extends IRawPriceBreakdown {
    numberOfNights: number;
    baseRatePerNight: number;
    requestedRooms: number;
    additionalGuestCharges: number;
    totalTaxAmount: number;
    dailyBreakdown: IDailyPriceBreakdown[];
    availableRooms?: number;
    addons?: IAddonBreakdownItem[];
}

export interface IGetPriceResponse {
    success: boolean;
    message: string;
    data: IRawPriceBreakdown;
}

// ─── RoomCard local types ─────────────────────────────────────────────────────

export interface ISelectedAddon {
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

export interface ISelectedPromotion {
    id: string;
    promotionType: IPromotionType;
    promotionName: string;
    discountValue: number;
    discountType: IDiscountType;
}

export interface IPricePayloadPromotion {
    id: string;
    promotionType: "mlos" | "normal";
}

export interface IParsedAddon {
    addOnId: string;
    availability: IParsedAddonAvailability[];
}

export interface IParsedAddonAvailability {
    date: string;
    quantity: number;
}

export interface IGetPricePayload {
    propertyCode: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: string;
    endDate: string;
    noOfAdults: number;
    noOfChildren: number;
    noOfRooms: number;
    childAges: number[];
    promoCode: string;
    guestDistribution: IRoomGuestDetail[];
    promotions?: IPricePayloadPromotion[];
    parsedAddons?: IParsedAddon[];
    includedAddons?: string[];
}

export interface IAvailableAddonAvailability {
    availabilityId: string;
    date: string;
    price: number;
}