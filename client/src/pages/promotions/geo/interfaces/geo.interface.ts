export type GeoRestrictionType = "percentage" | "fixed" | "restricted";

export type GeoRestrictionTypeAction = "increase" | "decrease";

export type CurrencyCode = "USD" | "EUR" | "INR";

export interface GeoRatePlan {
  id: string;
  propertyId: string;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: GeoRestrictionType;
  restrictionTypeAction: GeoRestrictionTypeAction | null;
  restrictionValue: number | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  createdAt: string;
}

export interface CreateGeoRatePlan {
  propertyId: string;
  rooms: {
    id: string;
    type: string;
  }[];
  ratePlans: {
    id: string;
    code: string;
  }[];
  restrictionType: GeoRestrictionType;
  restrictionTypeAction?: GeoRestrictionTypeAction | null;
  restrictionValue?: number | null;
  currencyCode?: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
}

export interface UpdateGeoRatePlan {
  restrictionType?: GeoRestrictionType;
  restrictionTypeAction?: GeoRestrictionTypeAction | null;
  restrictionValue?: number | null;
  currencyCode?: CurrencyCode | null;
  countryCode?: string[];
  isActive?: boolean;
}

export interface GeoRatePlanFilters {
  roomType?: string;
  ratePlanCode?: string;
}