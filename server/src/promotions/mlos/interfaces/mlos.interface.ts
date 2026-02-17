// Rate Plan Rule Types

export interface IMLOSCreate {
  ratePlanId: string;
  startDate?: string | null;
  endDate?: string | null;
  minLos: number;
  maxLos?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  isActive: boolean;
  isAutoApplied: boolean;
}

export interface IMLOSUpdate {
  startDate?: string | null;
  endDate?: string | null;
  minLos?: number;
  maxLos?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  isActive?: boolean;
    isAutoApplied: boolean;

}

export interface IMLOS {
  id: string;
  ratePlanId: string;
  startDate: string | null;
  endDate: string | null;
  minLos: number;
  maxLos: number | null;
  discountType:DiscountType ;
  discountValue: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
    isAutoApplied: boolean;

}

// Validation types
export type DiscountType = "percentage" | "flat";
