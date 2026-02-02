// Rate Plan Rule Types

export interface IRatePlanRuleCreate {
  ratePlanId: string;
  startDate?: string | null;
  endDate?: string | null;
  minLos: number;
  maxLos?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  isActive: boolean;
}

export interface IRatePlanRuleUpdate {
  startDate?: string | null;
  endDate?: string | null;
  minLos?: number;
  maxLos?: number | null;
  discountType?: DiscountType;
  discountValue?: number | null;
  isActive?: boolean;
}

export interface IRatePlanRule {
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

export interface policyInterface {
  depositPolicy: string;
  cancellationPolicy: string;
  guaranteePolicy: string;
}

export interface IRatePlanMetadata {
  propertyId: string;
  propertyCode: string;
  ratePlanName: string;
  ratePlanDescription?: string;
  ratePlanCode: string;
  depositPolicy: string;
  cancellationPolicy: string;
  guaranteePolicy: string;
  b2bAvailable: boolean;
  b2cAvailable: boolean;
}

export interface IRatePlanUpdate {
  ratePlanName?: string;
  depositPolicyId?: string;
  cancellationPolicyId?: string;
  guaranteePolicyId?: string;
  taxId?: string;
  b2bAvailable?: boolean;
  b2cAvailable?: boolean;
}

export interface IRatePlan extends IRatePlanMetadata {
  id: string;
  createdAt: string;
  updatedAt: string;
}