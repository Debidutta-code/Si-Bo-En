import { PromotionType, DiscountType, CurrencyCode } from '@prisma/client';

// Room-RatePlan pair for offer-for-tonight promotions
export interface IRoomRatePlanPair {
  roomId?: string;
  roomType?: string;
  ratePlanId: string;
  ratePlanCode: string;
}

// Base promotion interface
export interface IOfferForTonightPromotionBase {
  promotionName: string;
  propertyId: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: Date;
  validTo?: Date;
}

// Offer for Tonight Promotion (has time, array of room-rateplan pairs)
export interface IOfferForTonightPromotion extends IOfferForTonightPromotionBase {
  roomRatePlans: IRoomRatePlanPair[];
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
}

// Update interface for offer-for-tonight promotion
export interface IOfferForTonightPromotionUpdate {
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
}

// Response interface for offer-for-tonight promotion
export interface IOfferForTonightPromotionResponse {
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