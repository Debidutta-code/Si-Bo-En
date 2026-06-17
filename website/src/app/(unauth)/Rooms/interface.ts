import { IAmenity, IAppliedDiscounts, IAvailablePromotions, IPolicy, IPostingRhythm, IRoomVideo, IRoomView, ITouristTax, RoomUnit } from "./types";

export interface IPropertyLoyalityWithLoyality {
    CreationLoyaltyConfig: ICreationLoyality;
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    discountPercentage: number | null;
    loyalityConfigLogo: string | null;
    _translations?: {
        propertyName: string
    }
}
export interface ICCreationLoyality {
    creationId: string
    loyaltyDiscountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
}
export interface ITCreationLoyality extends ICCreationLoyality {
    id: string;
}
export interface IUCreationLoyalty {
    loyaltyDiscountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
}
export interface ICreationLoyality extends ICCreationLoyality {
    id: string;
    BasicLoyaltyProgram: IloyaltyProgram | null;
    loyaltyConditions: ILoyalityCondition[] | null;
    LoyaltyProgramFieldConfig: ILoyaltyField[] | null;
    loyaltySpecialConditions: ILoyalitySpecialCondition[] | null;
    PropertyLoyaltyConfig: IPropertyLoyaltyConfig[] | null;
    LoyalityLevels: ILoyalityLevels[]
}
export interface ILoyalityLevels {
    id: string;
    level: number;
    discountPercentage: number;
    noOfReservations: number;
}
export interface IPropertyLoyaltyConfig {
    id: string;
    propertyId: string;
    creationLoyaltyConfigId: string;
    propertyCode: string;
    propertyName: string;
    loyalityConfigLogo: string | null;
    isActive: boolean;

}
export interface ICloyaltyProgram {
    loyaltyProgramId: string;
    isActive: boolean;
    logo: string[];
}
export interface IloyaltyProgram extends ICloyaltyProgram {
    id: string;
    isActive: boolean;
}
export interface ICLoyalityCondition {
    loyaltyProgramId: string;
    text: string;
}
export interface ILoyalityCondition extends ICLoyalityCondition {
    id: string;
    isActive: boolean;
    isDeleted: boolean;
    _translations?: {
        text: string;
    }
}
export type Languages = 'en';
export interface ICLoyaltyField {
    loyaltyProgramId: string
    masterRegistrationFieldId: string

    fieldName: string

    visibleInRegistration: boolean;
    visibleInCustomerForm: boolean;
    required: boolean;
}
export interface ILoyaltyField extends ICLoyaltyField {
    id: string;
    _translations?: {
        fieldName: string;
    }
}
export interface ILoyalitySpecialCondition extends ICLoyalitySpecialCondition {
    id: string;
    isActive: boolean;
    isDeleted: boolean;
    _translations?: {
        subTitle: string;
        title: string;
    }
}
export interface ICLoyalitySpecialCondition {
    loyaltyProgramId: string;
    title: string;
    subTitle: string | null;
}
export type DiscountType = "percentage" | "flat";
export type CurrencyCode = "USD" | "EUR" | "INR";

export interface IRoomPrice {
    ratePlanId: string,
    ratePlanName: string,
    ratePlanCode: string,
    currencyCode: CurrencyCode;
    baseByGuestAmts: IBaseByGuestAmt[]
    policy: IPolicy;
    availablePromotions: IAvailablePromotions[];
    appliedDiscounts: IAppliedDiscounts[];
    touristTax: ITouristTax | null;
    comboLabel: {
        id: string;
        label: string;
        _translations: {
            name: string;
            description: string;
        };
    };
    addons: IIncudedAddons[];
    totalAmount: number;
    _translations?: {
        ratePlanName: string
    }
}

export interface IBaseByGuestAmt {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode: string;
}
export interface IIncudedAddons {
    id: string;
    name: string;
    code: string;
    price: number;
    postingRhythm: IPostingRhythm;
    description: string;
    images: string[];
    category: {
        id: string;
        name: string;
        code: string;
        _translations?: {
            name: string;
        }
    }
    subCategory: {
        id: string;
        name: string;
        code: string;
        _translations?: {
            name: string;
        }
    }
    addonVariant: {
        id: string;
        name: string;
        code: string;
        _translations?: {
            name: string;
        }
    }
}

export interface IRoomDetails {

    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: RoomUnit;
    priority: number;
    roomView: IRoomView | null,
    numberOfBedrooms: number,
    maxOccupancy: number,
    description: string | null,
    images: string[],
    amenities: IAmenity[] ,
    hasValidRate: boolean,
    roomPrice: IRoomPrice[];
    roomVideos: IRoomVideo | null;
    _translations?: {
        roomName: string;
        description: string;
    }
}