import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export type DiscountType = 'percentage' | 'flat';

export interface ICCreateCustomizableDealS {
    discountType: DiscountType;
    discountValue: number;
    currencyCode?: CurrencyCode | null;
    startDate: Date;
    endDate: Date;
    roomId: string;
    ratePlanId: string;
    applicableAddons: string[];
    // isAutoApplied: boolean;
    isActive?: boolean;
}

export interface IUCustomizableDealS {
    discountType?: DiscountType;
    discountValue?: number;
    currencyCode?: CurrencyCode | null;
    startDate?: Date;
    endDate?: Date;
    roomId?: string;
    ratePlanId?: string;
    applicableAddons?: string[];
    // isAutoApplied?: boolean;
    isActive?: boolean;
}

export interface ICCreateCustomizableDealR {
    discountType: DiscountType;
    discountValue: number;
    currencyCode?: CurrencyCode | null;
    startDate: Date;
    endDate: Date;
    roomId: string;
    roomType: string;
    ratePlanId: string;
    ratePlanCode: string;
    applicableAddons: IAddOn[];
    // isAutoApplied: boolean;
    isActive?: boolean;
}

export interface ICustomizableDeals {
    id: string;
    propertyId: string;
    propertyCode: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
    startDate: Date;
    endDate: Date;
    roomId: string;
    roomType: string;
    ratePlanId: string;
    ratePlanCode: string;
    // isAutoApplied: boolean;
    isActive: boolean;
    createdAt: Date;
}

export interface ICustomizableDealWDetails extends ICustomizableDeals {
    Room: IRoom;
    RatePlan: IRatePlan;
    CustomizableDealsApplicableAddons: ICustomizableDealsApplicableAddons[];
}

export interface ICustomizableDealsApplicableAddons {
    addOnId: string;
    AddOn: IAddOn;
}

export interface IRoom {
    id: string;
    roomName: string;
    roomType: string;
}

export interface IRatePlan {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
}

export interface IAddOn {
    id: string;
    code: string;
    name: string;
}
