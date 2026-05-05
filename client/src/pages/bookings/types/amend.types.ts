import type {
  IGuestDistribution,
  ITaxBreakdown,
  IAddonBreakdown,
  IDailyPriceBreakdown,
  IReservation,
} from "./reservation";

// Re-export shared types for convenience
export type { IGuestDistribution, ITaxBreakdown, IAddonBreakdown, IDailyPriceBreakdown };

// ─── Guest ────────────────────────────────────────────────────────────────────

export interface IAmendGuest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dob: string;
  age?: number | null;
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export interface IAmendRoom {
  adults: number;
  children: number;
  childAges: number[];
}

// ─── Addons ───────────────────────────────────────────────────────────────────

export interface IAddonAvailability {
  date: string; // ISO date string e.g. "2026-03-15T00:00:00.000Z"
  quantity: number;
}

export interface ISelectedAddons {
  addOnId: string;
  availability: IAddonAvailability[];
}

// ─── Promotions ───────────────────────────────────────────────────────────────

export interface IPromotion {
  id: string;
  promotionType: "normal" | string;
}

// ─── Price Check Request ──────────────────────────────────────────────────────

export interface IPriceCheckRequest {
  propertyCode: string;
  invTypeCode: string;
  startDate: string;
  endDate: string;
  noOfAdults: number;
  noOfChildren: number;
  noOfRooms: number;
  ratePlanCode: string;
  bookingCode: string;
  childAges?: number[];
  guestDistribution?: IGuestDistribution[];
  parsedAddons?: ISelectedAddons[];
  includedAddons?: string[];
  promotions?: IPromotion[];
  promoCode?: string;
}

// ─── Booking Calculation ──────────────────────────────────────────────────────

export interface IBookingCalculation {
  finalPayable: number;
  refundAmount: number;
  discount: number;
}

// ─── Amend Final Price ────────────────────────────────────────────────────────

export interface IAmendPromotionBreakdown {
  id: string;
  promotionType: string;
  name: string;
  currencyCode: string | null;
  discountAmount: number;
  discountType: "percentage" | "fixed" | string;
  discountValue: number;
  restrictionType: "decrease" | "payLater" | string;
  type: "user-applied" | string;
}

export interface IAmendFinalPrice {
  totalAmount: number;
  amountBeforeTax: number;
  taxedAmount: number;
  totalAddonAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  loyalityDiscount: number;
  promoCodeDiscount: number;
  currencyCode: string;
  dailyPriceBrakeDown: IDailyPriceBreakdown[];
  taxBrakeDown: ITaxBreakdown[];
  addonBrakeDown: IAddonBreakdown[];
  promotionBrakeDown: IAmendPromotionBreakdown[];
  booking?: IBookingCalculation;
}

// ─── Amend Payload ────────────────────────────────────────────────────────────

export interface IAmendPayload {
  propertyCode: string;
  checkInDate: string;
  checkOutDate: string;
  requestedRooms: number;
  rooms: IAmendRoom[];
  previousRooms: number;
  guests: IAmendGuest[];
  roomTypeCode: string;
  ratePlanCode: string;
  amount: number;
  finalPrice: IAmendFinalPrice;
  currencyCode: string;
  bookingUserEmail: string;
  bookingUserPhone?: string;
  status: "Modified";
  extraAmountToPay: number;
  refundAmount: number;
  paymentType: string;
}

// ─── Validation Errors ────────────────────────────────────────────────────────

export interface IGuestFieldErrors {
  firstName?: string;
  lastName?: string;
}

export interface IAmendValidationErrors {
  checkIn?: string;
  checkOut?: string;
  guests?: Record<string, IGuestFieldErrors>;
}

// ─── Modal Props ──────────────────────────────────────────────────────────────

export interface IAmendReservationModalProps {
  open: boolean;
  reservation: IReservation;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Step State (shared across steps) ────────────────────────────────────────

export interface IAmendStepState {
  checkInDate: string;
  checkOutDate: string;
  roomConfigs: IAmendRoom[];
  guests: IAmendGuest[];
}

// ─── Tab ──────────────────────────────────────────────────────────────────────

export type AmendStep = 1 | 2 | 3;

export type PriceStatus = "idle" | "loading" | "success" | "error";