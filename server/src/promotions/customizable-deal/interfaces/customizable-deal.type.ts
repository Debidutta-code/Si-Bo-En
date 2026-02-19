import { Decimal } from "@prisma/client/runtime/library";

export type DiscountType = 'percentage' | 'flat';
export type CurrencyCode = 'USD' | 'EUR' | 'INR';

export interface ICCreateCustomizableDealS {
    discountType: DiscountType;
    discountValue: Decimal;
    currencyCode: CurrencyCode | null;
    applicableRoomTypes: string[];
    applicableRatePlans: string[];
    applicableAddons: string[];
    isAutoApplied: boolean;

}
export interface ICCreateCustomizableDealR {
    discountType: DiscountType;
    discountValue: Decimal;
    currencyCode: CurrencyCode | null;
    applicableRoomTypes: IRoom[];
    applicableRatePlans: IRatePlan[];
    applicableAddons: IAddOn[];
    isAutoApplied: boolean;

}
export interface IUCustomizableDealS {
    discountType: DiscountType;
    discountValue: Decimal;
    currencyCode: CurrencyCode | null;
    applicableRoomTypes: string[];
    applicableRatePlans: string[];
    applicableAddons: string[];
    isAutoApplied: boolean;

}

export interface ICustomizableDeals {
    id: string;
    propertyId: string;
    propertyCode: string;
    discountType: DiscountType;
    discountValue: Decimal;
    currencyCode: CurrencyCode | null;
    createdAt: Date;
}
export interface ICustomizableDealWDetails extends ICustomizableDeals {

    CustomizableDealsApplicableRoomTypes: ICustomizableDealsApplicableRoomTypes[];
    CustomizableDealsApplicableRatePlanTypes: ICustomizableDealsApplicableRatePlans[];
    CustomizableDealsApplicableAddons: ICustomizableDealsApplicableAddons[];

}


export interface ICustomizableDealsApplicableRoomTypes {
    roomId: string;
    roomTypeCode: string;
    Room: IRoom;
}
export interface ICustomizableDealsApplicableRatePlans {
    ratePlanId: string;
    ratePlanCode: string;
    RatePlan: IRatePlan;
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