import { Decimal } from "@prisma/client/runtime/library";
import { DeviceType } from "../../../agent-paltform/property/types";
import { CurrencyCode, DiscountType, IRatePlan, IRoom } from "../../customizable-deal/interfaces";
import { IProperty } from "../../../agency/types";

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
    discountValue: Decimal|null;
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