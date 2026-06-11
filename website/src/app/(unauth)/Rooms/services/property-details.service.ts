import { fetchPropertyDetailsByCode } from "../apis";
import type {
  IBookingEngineColor,
  IPropertyDetailsData,
} from "../types";

// ─── Fallback branding used when a property has no bookingEngineConfig ────────
export const DEFAULT_BOOKING_ENGINE_COLOR: IBookingEngineColor = {
  primaryColor: "#1A98A6",
  secondaryColor: "#F4EFE6",
  tertiaryColor: "#5B543F",
  buttonTextColor: "#FFFFFF",
  bgImage: null,
  logo: null,
  url: null,
};

export const getPropertyDetailsService = async (
  propertyCode: string
): Promise<{ success: boolean; message: string; data: IPropertyDetailsData | null }> => {
  try {
    const response = await fetchPropertyDetailsByCode(propertyCode);
    if (!response.success) {
      return { success: false, message: response.message, data: null };
    }
    return { success: true, message: response.message, data: response.data };
  } catch {
    return { success: false, message: "Failed to fetch property details.", data: null };
  }
};

/**
 * Derives the flat color/branding shape the app uses everywhere.
 * Always returns a non-null value — falls back to defaults when
 * the property has no bookingEngineConfig or individual fields are missing.
 */
export const deriveBookingEngineColor = (
  config: IPropertyDetailsData["bookingEngineConfig"] | null | undefined
): IBookingEngineColor => {
  if (!config) return DEFAULT_BOOKING_ENGINE_COLOR;

  return {
    primaryColor: config.primaryColor || DEFAULT_BOOKING_ENGINE_COLOR.primaryColor,
    secondaryColor: config.secondaryColor || DEFAULT_BOOKING_ENGINE_COLOR.secondaryColor,
    tertiaryColor: config.tertiaryColor || DEFAULT_BOOKING_ENGINE_COLOR.tertiaryColor,
    buttonTextColor: config.buttonTextColor || DEFAULT_BOOKING_ENGINE_COLOR.buttonTextColor,
    bgImage: config.bannerImage ?? null,
    logo: config.logo ?? null,
    url: config.url ?? null,
  };
};