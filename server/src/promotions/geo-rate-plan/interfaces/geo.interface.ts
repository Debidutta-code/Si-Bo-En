// interfaces/geoRatePlan.interface.ts

// Input structures
export interface IRoomInput {
  id: string;
  type: string;
}

export interface IRatePlanInput {
  id: string;
  code: string;
}

// This is the BULK input (what you receive from the request)
export interface IGeoRatePlanBulkInput {
  propertyId: string;
  rooms: IRoomInput[];
  ratePlans: IRatePlanInput[];
  restrictionType: geoRestrictionType;
  restrictionValue?: number | null;
  currencyCode?: CurrencyCode;
  countryCode: string[];
  isActive?: boolean;
}

// This is for INDIVIDUAL record creation (used internally)
export interface IGeoRatePlanCreate {
  propertyId: string;
  roomId?: string;
  roomType?: string;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue?: number | null;
  currencyCode?: CurrencyCode;
  countryCode: string[];
  isActive?: boolean;
}

export interface IGeoRatePlanUpdate {
  roomId?: string;
  roomType?: string;
  ratePlanId?: string;
  ratePlanCode?: string;
  restrictionType?: geoRestrictionType;
  restrictionValue?: number | null;
  currencyCode?: CurrencyCode;
  countryCode?: string[];
  isActive?: boolean;
}

export interface IGeoRatePlan {
  id: string;
  propertyId: string;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue: number | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  createdAt: string;
}

export type geoRestrictionType = "percentage" | "fixed" | "restricted";
export type CurrencyCode = "USD" | "EUR" | "INR";

export interface IGeoRatePlanFilter {
  propertyId?: string;
  roomTypeCode?: string;
  ratePlanCode?: string;
  countryCode?: string;
  isActive?: boolean;
}

export interface IBulkCreateResponse {
  totalCreated: number;
  createdRecords: any[];
  summary: {
    totalRooms: number;
    totalRatePlans: number;
    totalCombinations: number;
  };
}