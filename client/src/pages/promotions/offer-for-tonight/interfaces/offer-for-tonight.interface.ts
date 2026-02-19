export type PromotionType = 'offer_for_tonight';
export type DiscountType = 'percentage' | 'flat';
export type CurrencyCode = 'USD' | 'EUR' | 'INR';

// Room-RatePlan pair for early-bird promotions
export interface RoomRatePlanPair {
  roomId?: string;
  roomType?: string;
  ratePlanId: string;
  ratePlanCode: string;
}

// Applicable days interface
export interface ApplicableDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// Create Early Bird Promotion payload
export interface CreateOfferForTonight {
  promotionName: string;
  propertyId: string;
  promotionType: PromotionType;
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  validFrom: string;
  validTo?: string | null;
  roomRatePlans: RoomRatePlanPair[];
  monApplicable: boolean;
  tueApplicable: boolean;
  wedApplicable: boolean;
  thuApplicable: boolean;
  friApplicable: boolean;
  satApplicable: boolean;
  sunApplicable: boolean;
  advanceBookingDays?: number;
    isAutoApplied: boolean;
isActive:boolean;
}

// Update Early Bird Promotion payload
export interface UpdateOfferForTonight {
  promotionName?: string;
  validFrom?: string;
  validTo?: string | null;
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
  advanceBookingDays?: number;
    isAutoApplied: boolean;

}

// Early Bird Promotion response with RatePlan details
export interface OfferForTonightWithRatePlan {
  id: string;
  promotionName: string;
  propertyId: string;
  validFrom: string | null;
  validTo: string | null;
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
  isAutoApplied: boolean
  isActive: boolean;
  advanceBookingDays: number | null;
  createdAt: string;
  applicableDays: ApplicableDays;
  ratePlan?: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
  };
  roomRatePlans?: RoomRatePlanPair[];
}

// Convert backend format to frontend format
export function convertBackendToApplicableDays(promo: any): ApplicableDays {
  return {
    monday: promo.monApplicable ?? true,
    tuesday: promo.tueApplicable ?? true,
    wednesday: promo.wedApplicable ?? true,
    thursday: promo.thuApplicable ?? true,
    friday: promo.friApplicable ?? true,
    saturday: promo.satApplicable ?? true,
    sunday: promo.sunApplicable ?? true,
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}