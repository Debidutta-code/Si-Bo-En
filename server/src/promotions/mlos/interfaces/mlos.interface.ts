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
}

export interface IMLOSUpdate {
  startDate?: string | null;
  endDate?: string | null;
  minLos?: number;
  maxLos?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  isActive?: boolean;
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
}

// Validation types
export type DiscountType = "percentage" | "flat";
