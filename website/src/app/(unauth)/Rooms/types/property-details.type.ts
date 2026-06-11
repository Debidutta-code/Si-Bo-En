// ─── Property Details API response types ─────────────────────────────────────
// Route: GET /booking-engine/property-details/get-property-details/:propertyCode

import { IPropertyAddress } from "./room.types";

export interface IBookingEngineConfig {
  id: string;
  propertyId: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bannerImage: string | null;
  logo: string;
  url: string |null;
}




export interface IPropertyContextConfigs {
  isSpaModuleEnabled: boolean;
  isLoyaltyProgramEnabled: boolean;
  isB2cAvailable: boolean;
  isB2bAvailable: boolean;
}

export interface IPropertyTranslations {
  propertyName?: string;
}

export interface IPropertyDetailsData {
  id: string;
  propertyName: string;
  propertyCode: string;
  bookingEngineConfig: IBookingEngineConfig | null;
  propertyAddress: IPropertyAddress | null;
  propertyConfigs: IPropertyContextConfigs;
  _translations?: IPropertyTranslations;
}

export interface IPropertyDetailsResponse {
  success: boolean;
  message: string;
  data: IPropertyDetailsData;
  timestamp: string;
}

// ─── Derived color shape used throughout the app ──────────────────────────────
export interface IBookingEngineColor {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bgImage: string | null;
  logo: string | null;
  url: string | null;
}

// ─── What PropertyContext stores ──────────────────────────────────────────────
export interface IPropertyContextState {
  propertyId: string | null;
  propertyCode: string | null;
  hotelName: string | null;
  propertyConfigs: IPropertyContextConfigs | null;
  propertyAddress: IPropertyAddress | null;
  bookingEngineColor: IBookingEngineColor;
}