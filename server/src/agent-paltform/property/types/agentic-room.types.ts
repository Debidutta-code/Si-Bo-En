import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';
import { IPropertyConfigs } from './agentic-property.types';
import { IBaseByGuest } from './charges.types';
import { IPolicy } from './ratePlan.type';

// ─── Commission ───────────────────────────────────────────────────────────────

export type CommissionType = 'percentage' | 'fixed';
export type DiscountType = 'percentage' | 'fixed';

export interface IAgencyCommission {
    commissionType: CommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode | null;
}

export interface IAppliedCommission {
    commissionType: CommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode | null;
    /** Absolute amount added on top of base — shown in breakdown */
    calculatedCommissionAmount: number;
}

// ─── Search Payload ───────────────────────────────────────────────────────────

export interface IRoomConfig {
    adults: number;
    children: number;
    childAges: number[];
}

export interface IGuestPayload {
    adults: number;
    children: number;
    rooms: number;
    roomsArray?: IRoomConfig[];
}

export interface IAgentSearchPayload {
    startDate: string;
    endDate: string;
    guests: IGuestPayload;
}

// ─── Raw DB shapes (from Prisma joins) ───────────────────────────────────────

export interface IAgencyRaw {
    id: string;
    commissionType: string;
    commissionValue: number;
    commissionCurrency: CurrencyCode | null;
}

export interface IAgenticPropertyRaw {
    id: string;
    Property: {
        id: string;
        propertyName: string;
        propertyEmail: string;
        propertyContact: string;
        propertyCode: string;
        description: string | null;
        image: string[];
        propertyAddress: {
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
        } | null;
        propertyAmenities: {
            amenity: {
                amenityName: string;
                description: string | null;
                icon: string | null;
            };
        }[];
        propertyCategory: {
            masterCategoryId: string;
            masterCategory: {
                categoryName: string;
                categoryDescription: string | null;
                isActive: boolean;
            };
        } | null;
        propertyType: {
            masterPropertyTypeId: string;
            masterPropertyType: {
                propertyTypeName: string;
                propertyTypeDescription: string | null;
                isActive: boolean;
            };
        } | null;
        propertyVideos: {
            propertyId: string;
            url: string;
            thumbnail: string | null;
        } | null;
        propertyConfigs: IPropertyConfigs | null;
    };
}

// ─── Restrictions ─────────────────────────────────────────────────────────────

export interface IRoomBookingOffset {
    id: string;
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    isActive: boolean;
    date: Date;
}

export interface IRoomRatePlanRule {
    id: string;
    ratePlanId: string;
    isActive: boolean;
    isAutoApplied: boolean;
    minLos: number | null;
    maxLos: number | null;
    startDate: Date | null;
    endDate: Date | null;
    discountType: string | null;
    discountValue: number | null;
    currencyCode: string | null;
}

// ─── Tourist Tax ──────────────────────────────────────────────────────────────

export interface IRoomTouristTaxData {
    id: string;
    name: string | null;
    discountType: string;
    discountValue: number | null;
    currencyCode: string | null;
}

/**
 * Paid at the hotel on check-in — NOT deducted from totalAmount online.
 * Returned for display purposes only.
 */
export interface ITouristTax {
    id: string;
    name: string | null;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    calculatedTaxAmount: number;
}

// ─── Addons ───────────────────────────────────────────────────────────────────

export interface IChildAddon {
    id: string;
    minAge: number;
    maxAge: number;
    discountApplicable: boolean;
    discountType: DiscountType | null;
    discountAmount: number | null;
}

export interface IAddonCategory {
    id: string;
    name: string;
    code: string;
}

export interface IAddonWithRelations {
    id: string;
    name: string;
    code: string;
    postingRhythm: string;
    description: string | null;
    images: string[];
    category: IAddonCategory | null;
    subCategory: IAddonCategory | null;
    addonVariant: IAddonCategory | null;
    ChildAddons: IChildAddon[];
}

export interface IRatePlanAddon {
    addonId: string;
    addon: IAddonWithRelations;
}

export interface IAddonAvailability {
    id: string;
    addonId: string;
    date: Date;
    price: number;
    isAvailable: boolean;
}

export interface IAddonDetail {
    id: string;
    name: string;
    code: string;
    price: number;
    postingRhythm: string;
    description: string | null;
    images: string[];
    category: IAddonCategory | null;
    subCategory: IAddonCategory | null;
    addonVariant: IAddonCategory | null;
}

// ─── Room Price ───────────────────────────────────────────────────────────────

export interface IBaseByGuestAmount {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string;
}

export interface IRoomPricePolicy {
    depositPolicy: IPolicy | null;
    cancellationPolicy: IPolicy | null;
    guaranteePolicy: IPolicy | null;
}

export interface IRoomPrice {
    ratePlanName: string;
    ratePlanCode: string;
    comboLabel: string;
    currencyCode: CurrencyCode;
    baseByGuestAmts: IBaseByGuestAmount[];
    policy: IRoomPricePolicy;
    baseAmount: number;
    /** Commission added on top */
    appliedCommission: IAppliedCommission;
    /** baseAmount + commission (+ addon price for combo rows) */
    totalAmount: number;
    addons: IAddonDetail[];
    /** Paid at hotel — not in totalAmount */
    touristTax: ITouristTax | null;
}

// ─── Final room output shape ──────────────────────────────────────────────────

export interface IBookingRoom {
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: RoomUnit;
    roomView: RoomView;
    maxOccupancy: number;
    description: string;
    images: string[];
    amenities: IRoomAmenity[];
    hasValidRate: boolean;
    roomPrice: IRoomPrice[];
    roomVideos: IRoomVideo | null;
}

// ─── Internal calculator result types ────────────────────────────────────────

export interface IBasePriceResult {
    baseAmount: number;
    sortedBaseAmounts: IBaseByGuest[];
}

export interface IGuestPriceResult {
    basePrice: number;
    additionalCharges: number;
}
export type RoomView = 'sea' | 'garden' | 'mountain' | 'others' | 'city';
export type RoomUnit = 'sqft' | 'sqm';
export type SmokingPolicy = 'smoking' | 'non_smoking' | 'designated_area';

export interface IRoomAmenity {
    amenity: {
        amenityName: string;
        description: string | null;
        icon: string | null;
    };
}

export interface IRoomVideo {
    roomId: string;
    url: string;
    thumbnail: string | null;
}

export interface IRoom {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: number;
    roomView: RoomView;
    roomSize: number; // ← was any
    roomUnit: RoomUnit;
    smokingPolicy: SmokingPolicy;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    numberOfLivingRoom: number | null;
    extraBed: number | null;
    description: string | null;
    view360Link: string | null;
    image: string[];
    available: boolean;
    isDeleted: boolean;
    propertyId: string;
    roomVideos: IRoomVideo | null;
    roomAmenities: IRoomAmenity[];
}

export interface IRooms {
    id: string;
    agenticPropertyId: string;
    roomId: string;
    isActive: boolean;
    isDeleted: boolean;
    room: IRoom;
}
