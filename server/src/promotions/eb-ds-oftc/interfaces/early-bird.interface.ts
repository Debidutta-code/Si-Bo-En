import { CurrencyCode, DiscountType } from "../../customizable-deal/interfaces";
import { PromotionType } from "./eb-ds-oftc.interface";

// Room-RatePlan pair for early-bird promotions
export interface IRoomRatePlanPair {
  roomId?: string;
  roomType?: string;
  ratePlanId: string;
  ratePlanCode: string;
}

export interface IEarlyBirdPromotionBase {
  promotionName: string;
  propertyId: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: Date;
  validTo?: Date;
  advanceBookingDays: number|null;
}

// Early Bird Promotion (array of room-rateplan pairs)
export interface ICEarlyBirdPromotion extends IEarlyBirdPromotionBase {
  roomRatePlans: IRoomRatePlanPair[];
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
  isAutoApplied: boolean;
}

export interface IEarlyBirdPromotionUpdate {
  promotionName?: string;
  validFrom?: Date;
  validTo?: Date;
  discountType?: DiscountType;
  discountValue?: number;
  currencyCode?: CurrencyCode;
  monApplicable?: boolean;
  tueApplicable?: boolean;
  wedApplicable?: boolean;
  thuApplicable?: boolean;
  friApplicable?: boolean;
  satApplicable?: boolean;
  sunApplicable?: boolean;
  isActive?: boolean;
  advanceBookingDays: number|null;
  isAutoApplied: boolean;

}

// Response interface for early-bird promotion
export interface IEarlyBirdPromotionResponse {
  id: string;
  promotionName: string;
  propertyId: string;
  validFrom: Date | null;
  validTo: Date | null;
  promotionType: PromotionType;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  discountType: DiscountType;
  discountValue: number;
  currencyCode: CurrencyCode | null;
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
  isActive: boolean;
  createdAt: Date;
}