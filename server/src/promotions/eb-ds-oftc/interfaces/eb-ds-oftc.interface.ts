import { DeviceType } from "../../../agent-paltform/property/types";
import {  DiscountType, IRatePlan, IRoom } from "../../customizable-deal/interfaces";
import { IProperty } from "../../../agency/types";
import { CurrencyCode } from "../../../tax-system/interfaces/tourist-tax.type";

export type PromotionType = "early_bird" | "offer_for_tonight" | "device_specific";
export interface ICEbDsOftc { //create payload type for early bird ,device specific and offer for tonight
    promotionName: string;
    validFrom: Date|null;
    validTo: Date|null;
    advanceBookingDays: number|null;
        propertyId: string;

    promotionType: PromotionType
    roomId: string|null;
    roomType: string|null;
    deviceType: DeviceType[];
    ratePlanId: string;
    ratePlanCode: string;
    discountType: DiscountType;
    discountValue: number|null;
    currencyCode: CurrencyCode|null;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isActive: boolean;
    isAutoApplied: boolean;
}
export interface IEbDsOftc extends ICEbDsOftc {
    id: string;
    property:IProperty;
    room:IRoom|null;
    ratePlan:IRatePlan;
    createdAt: Date;
}