import { CurrencyCode } from "../../tax-system/interfaces/tourist-tax.type";

export type DiscountType = "percentage" | "flat";

export interface ICreatePromoCode {
    name: string;
    code: string;
    description?: string | null;
    propertyId: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode:CurrencyCode;
    validFrom: Date;
    validTo: Date;
    minBookingAmount: number |null;
    maxDiscountAmount: number | null;

    isApplicableForMobileApp?: boolean;
    isApplicableForDesktop?: boolean;
    isApplicableForTablet?: boolean;

    usageLimit?: number | null;
    // usageLimitPerUser?: number | null;
    applicableRoomTypes?: any[];
    applicableRatePlans?: any[];
}

export interface IRPromoCode {
    id: string;
    name: string;
    code: string;
    description: string | null;
    propertyId: string;
    discountType: DiscountType;
    discountValue: number;
    validFrom: Date;
    validTo: Date;
    minBookingAmount: number | null;
    maxDiscountAmount: number | null;

    isApplicableForMobileApp: boolean;
    isApplicableForDesktop: boolean;
    isApplicableForTablet: boolean;

    // isApplicableForWalkIn: boolean;
    // isApplicableForOTA: boolean;
    // isApplicableForCorporate: boolean;

    usageLimit: number | null;
    // usageLimitPerUser: number | null;
    applicableRoomTypes: any[];
    applicableRatePlans: any[];
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}



export interface ICReservationPromoCode {
    reservationId: string;
    promoCodeId: string;
    amount: number;
    currency: CurrencyCode;
}
export interface IReservationPromoCode extends ICReservationPromoCode {
    id: string;
}
