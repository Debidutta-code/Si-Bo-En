// ─── Loyalty Guest Shared Types ────────────────────────────────────────────────
// Used by loyaltyUserSlice.ts and all loyalty-guest pages

export interface LoyalityLevel {
  id: string;
  level: number;
  discountPercentage: number;
  noOfReservations: number;
}

export interface Property {
  id: string;
  propertyName: string;
  propertyCode: string;
}

export interface PropertyLoyaltyConfig {
  id: string;
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  loyalityConfigLogo: string | null;
  isActive: boolean;
  Property: Property;
}

export interface BasicLoyaltyProgram {
  id: string;
  loyaltyProgramId: string;
  isActive: boolean;
  logo: string[];
  createdAt: string;
}

export interface CreationLoyaltyConfig {
  id: string;
  creationId: string;
  loyaltyDiscountType: string;
  discountValue: number;
  currencyCode: string | null;
  createdAt: string;
  BasicLoyaltyProgram: BasicLoyaltyProgram | null;
  AdvanceLoyaltyProgram: null;
  LoyalityLevels: LoyalityLevel[];
  PropertyLoyaltyConfig: PropertyLoyaltyConfig[];
}

export interface CreationGuest {
  id: string;
  loyalityGuestId: string;
  metaData: Record<string, string>;
  guestLevel: number;
  creationLoyaltyConfigId: string;
  noOfBookings: number;
  CreationLoyaltyConfig: CreationLoyaltyConfig;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProfileData {
  id: string;
  guestEmail: string;
  createdAt: string;
  guest: Guest | null;
  CreationGuest: CreationGuest[];
}
