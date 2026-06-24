import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

export type DiscountType = 'percentage' | 'flat';

export interface CreateCustomizableDeal {
  discountType: DiscountType;
  discountValue: number;
  currencyCode?: CurrencyCode;
  startDate: string;
  endDate: string;
  roomId: string;
  ratePlanId: string;
  applicableAddons: string[];
  isActive: boolean;
}

export interface DealApplicableAddon {
  id: string;
  addOnId: string;
  AddOn: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CustomizableDeal {
  id: string;
  propertyId: string;
  propertyCode: string;
  discountType: DiscountType;
  discountValue: number;
  currencyCode: CurrencyCode;
  startDate: string;
  endDate: string;
  roomId: string;
  roomType: string;
  ratePlanId: string;
  ratePlanCode: string;
  // isAutoApplied: boolean;
  isActive: boolean;
  createdAt: string;
  Room: {
    id: string;
    roomName: string;
    roomType: string;
    _translations?: {
      roomName: string;
    };
  };
  RatePlan: {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    _translations?: {
      ratePlanName: string;
    };
  };
  CustomizableDealsApplicableAddons: DealApplicableAddon[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ICCustomizableDeals {
  discountType: DiscountType;
  discountValue: number;
  currencyCode: CurrencyCode;
  startDate: string;
  endDate: string;
  roomId: string;
  ratePlanId: string;
  applicableAddons: string[];
  // isAutoApplied: boolean;
  isActive: boolean;
}