export interface MobilePromotion {
  id: string;
  ratePlanId: string;
  promotionName: string;
  discountPercentage: number;
  startDate: string;
  endDate?: string | null;
  applicableDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  isB2C: boolean;
  isB2B: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MobilePromotionWithRatePlan extends MobilePromotion {
  ratePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
  };
}

export interface CreateMobilePromotion {
  ratePlanId: string;
  promotionName: string;
  discountPercentage: number;
  startDate: string;
  endDate?: string | null;
  applicableDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  isB2C: boolean;
  isB2B: boolean;
  isActive: boolean;
}

export interface UpdateMobilePromotion {
  promotionName?: string;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string | null;
  applicableDays?: {
    monday?: boolean;
    tuesday?: boolean;
    wednesday?: boolean;
    thursday?: boolean;
    friday?: boolean;
    saturday?: boolean;
    sunday?: boolean;
  };
  isB2C?: boolean;
  isB2B?: boolean;
  isActive?: boolean;
}