import {
    IBookingEngineConfig,
    IPropertyAddress,
    IPropertyVideo,
    IRoomVideo,
} from '../../property-management/types';
import { DiscountType } from '../../promocode/types';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import { DeviceType } from '../../agent-paltform/property/types';
import { ICreationLoyality } from '../../loyalty/types';

export interface IBookingSearchPayload {
    startDate: string;
    endDate: string;
    guests: {
        adults: number;
        children: number;
        rooms: number;
        roomsArray?: {
            adults: number;
            children: number;
            childAges: number[];
        }[];
    };
    propertyCode: string;
    countryCode?: string;
    deviceType?: DeviceType;
    promocode?: string;
}

export interface IRoomChargeBaseByGuest {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string;
}

export interface IRoomChargeAdditionalGuest {
    ageQualifyingCode: string;
    amount: number;
}

export interface IRoomCharge {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: string;
    date: Date;
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
    baseGuestAmounts: IRoomChargeBaseByGuest[];
    additionalGuestAmounts: IRoomChargeAdditionalGuest[];
}

export interface IRoomAmenity {
    id: string;
    amenity: {
        id: string;
        amenityName: string;
        amenityType: string;
        description: string | null;
        icon: string | null;
        isActive: boolean;
    };
}

export interface IMasterRoomView {
    id: string;
    viewName: string;
    isActive: boolean;
    metaData: any | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMRoomView {
    id: string;
    roomId: string;
    masterRoomViewId: string;
    MasterRoomView: IMasterRoomView;
}

export interface IPropertyRoom {
    id: string;
    roomName: string;
    roomType: string;
    priority: number;
    totalRoom: number;
    floor: number;
    roomView: string;
    roomSize: number;
    roomUnit: string;
    smokingPolicy: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    description: string | null;
    image: string[];
    available: boolean;
    roomAmenities: IRoomAmenity[];
    roomVideos: IRoomVideo | null;
    RoomViews: IMRoomView | null;  // ✅ add this
}

export interface IRoomPolicy {
    id: string;
    policyName: string;
    type: string;
    description: string;
}

export interface IPropertyRatePlan {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomOnlyVisible: boolean;
    depositPolicy: IRoomPolicy | null;
    cancellationPolicy: IRoomPolicy | null;
    guaranteePolicy: IRoomPolicy | null;
}

export interface IRoomBookingOffset {
    id: string;
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    isActive: boolean;
    date: Date;
}

export interface IRoomGeoRatePlan {
    id: string;
    restrictionType: 'percentage' | 'fixed' | 'restricted';
    restrictionTypeAction: 'increase' | 'decrease' | null;
    restrictionValue: number | null;
    countryCode: string[];
    isActive: boolean;
}

export interface IRoomPromotionData {
    id: string;
    promotionName: string;
    promotionType: string;
    discountType: string;
    discountValue: number | null;
    isAutoApplied: boolean;
    validFrom: Date | null;
    validTo: Date | null;
    advanceBookingDays: number | null;
    deviceType: string[];
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
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

export interface IRoomPromoCode {
    id: string;
    name: string;
    code: string;
    discountType: string;
    discountValue: number;
    validFrom: Date | null;
    validTo: Date | null;
    minBookingAmount: number | null;
    maxDiscountAmount: number | null;
    isApplicableForMobileApp: boolean;
    isApplicableForDesktop: boolean;
    isApplicableForTablet: boolean;
    applicableRoomTypes: string[];
    applicableRatePlans: string[];
    isActive: boolean;
    isDeleted: boolean;
    usageLimit: number | null;
}

export interface IRoomTouristTaxData {
    id: string;
    name: string | null;
    discountType: string;
    discountValue: number | null;
    currencyCode: string | null;
}

export interface IAddonDetail {
    id: string;
    name: string;
    code: string;
    price: number;
    postingRhythm: string;
    description?: string | null;
    images: string[];
    category?: { id: string; name: string; code: string } | null;
    subCategory?: { id: string; name: string; code: string } | null;
    addonVariant?: { id: string; name: string; code: string } | null;
}
export interface IChildAddon {
    id: string;
    minAge: number;
    maxAge: number;
    discountApplicable: boolean;
    discountType: DiscountType | null;
    discountAmount: number | null;
}

export interface IAddonWithRelations {
    id: string;
    name: string;
    code: string;
    postingRhythm: string;
    description: string | null;
    images: string[];
    category: { id: string; name: string; code: string } | null;
    subCategory: { id: string; name: string; code: string } | null;
    addonVariant: { id: string; name: string; code: string } | null;
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

export interface IBaseByGuestAmount {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string;
}

export interface IPromotion {
    id: string;
    promotionName: string;
    promotionType: string;
    discountType: string;
    discountValue: number | null;
    minLos?: number;
    maxLos?: number;
    validFrom?: Date | null;
    validTo?: Date | null;
    advanceBookingDays: number | null;
    monApplicable?: boolean;
    tueApplicable?: boolean;
    wedApplicable?: boolean;
    thuApplicable?: boolean;
    friApplicable?: boolean;
    satApplicable?: boolean;
    sunApplicable?: boolean;
}

export interface IAppliedDiscount {
    id: string;
    promotionName: string;
    promotionType: string;
    discountType: string;
    discountValue: number;
    calculatedDiscountAmount: number;
}

export interface ITouristTax {
    id: string;
    name: string | null;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    calculatedTaxAmount?: number;
}

export interface IRoomPrice {
    ratePlanId?: string;
    ratePlanName: string;
    ratePlanCode: string;
    comboLabel: string;
    totalAmount: number;
    currencyCode: string;
    baseByGuestAmts: IBaseByGuestAmount[];
    policy: {
        depositPolicy?: IRoomPolicy | null;
        cancellationPolicy?: IRoomPolicy | null;
        guaranteePolicy?: IRoomPolicy | null;
    };
    addons: IAddonDetail[];
    availablePromotions: IPromotion[];
    appliedDiscounts: IAppliedDiscount[];
    touristTax?: ITouristTax | null;
}
export interface IRoomAmenityDetail {
    id: string;
    amenityName: string;
    amenityType: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
}

export interface IRoom {
    id: string;
    roomName: string;
    roomType: string;
    priority: number;
    roomSize: number;
    maxOccupancy: number;
    roomUnit: string;
    roomView: string;
    description: string;
    numberOfBedrooms:number;
    images: string[];
    amenities: IRoomAmenityDetail[];
    hasValidRate: boolean;
    roomPrice: IRoomPrice[];
    roomVideos: IRoomVideo | null;
}
export interface ILoyaltyProgramConfig {
    id: string;
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    discountPercentage: number;
    loyalityConfigLogo: string;
    isActive: boolean;
    CreationLoyaltyConfig: ICreationLoyality | null;
}

export interface IPropertyData {
    id: string;
    propertyName: string;
    propertyCode: string;
    starRating: number | null;
    isAvailable: boolean;
    propertyAddress: IPropertyAddress;
    propertyVideos: IPropertyVideo[];
    propertyConfigs: IPropertyConfig | null;
    loyaltyProgramConfig: ILoyaltyProgramConfig | null;
    bookingEngineConfig: IBookingEngineConfig;
    propertyRooms: IPropertyRoom[];
    ratePlans: IPropertyRatePlan[];
}
export interface IPropertyConfig {
    id: string;
    propertyId: string;
    pmsIntegrationActive: Boolean;
    channelManagerIntegrationActive: Boolean;
    selfAriActive: Boolean;
    isB2bAvailable: Boolean;
    isB2cAvailable: Boolean;
    showVideo: Boolean;
    commission: Boolean;
    baseCurrency: CurrencyCode;
}
