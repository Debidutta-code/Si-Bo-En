// types/commission.ts - Add this to your existing types/commission.ts file

export type CommissionType = "percentage" | "fixed";

// API Response type (what you get from backend)
export interface Commission {
  _id: string;
  propertyCode: string;
  type: CommissionType;
  value: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// API Request types (what you send to backend)
export interface CreateCommissionPayload {
  propertyCode: string;
  type: CommissionType;
  value: number;
  isActive: boolean;
}

export interface UpdateCommissionPayload {
  type?: CommissionType;
  value?: number;
  isActive?: boolean;
}