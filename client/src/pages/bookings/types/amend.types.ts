// ─── Guest ───────────────────────────────────────────────────────────────────

import type { IGuestDistribution, IReservation } from "./reservation";

export interface IAmendGuest {
  type: "adult" | "child";
  firstName: string;
  lastName: string;
  dob: string;
  age?: number | null;
}


export interface IAmendRoom {
  adults: number;
  children: number;
  childAges: number[];
}

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
  previousRooms: number;
  includedAddons?: string[];
  parsedAddons?: ISelectedAddons[];
  childAges?:number[];
  promoCode?: string;
  guestDistribution?:IGuestDistribution[];
}
export interface ISelectedAddons {
  addOnId: string;
  availability: IAddonAvailability[];
}
export interface IAddonAvailability {
  date: Date;
  quantity: number;
}
export interface ITaxBrakeDown {
  name: string;
  taxedAmount: number;
  currencyCode: string;
}

export interface IAddonBrakeDown {
  addonId: string;
  name: string;
  amount: number;
  quantity: number;
  totalAmount: number;
  type: string;
  currencyCode: string;
  date: string;
}

export interface IDailyPriceBrakeDown {
  roomNumber: string;
  date: string;
  baseChargesAmount: number;
  additionalChargesAmount: number;
  totalAmount: number;
  currencyCode: string;
  totalDailyTaxedAmount: number;
  taxBrakeDown: ITaxBrakeDown[];
  addOnBrakeDown: any[];
  guestDistribution: {
    adults: number;
    children: number;
    childAges: number[];
  };
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
  dailyPriceBrakeDown: IDailyPriceBrakeDown[];
  taxBrakeDown: ITaxBrakeDown[];
  addonBrakeDown: IAddonBrakeDown[];
  promotionBrakeDown: any[];
  booking?: IBookingCalculation;
}

export interface IBookingCalculation {
  finalPayable: number;
  refundAmount: number;
  discount: number;
}

// ─── Amend Payload ───────────────────────────────────────────────────────────

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

// ─── Validation Errors ───────────────────────────────────────────────────────

export interface IGuestFieldErrors {
  firstName?: string;
  lastName?: string;
}

export interface IAmendValidationErrors {
  checkIn?: string;
  checkOut?: string;
  guests?: Record<string, IGuestFieldErrors>;
}
export interface IBookingAddon {
  id:string;
  reservationId: string;
  addonId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currencyCode: string;
  specialInstructions?: string | null; 
  type: "included"|"selected";
  date: Date;
}
// ─── Modal Props ─────────────────────────────────────────────────────────────

export interface IAmendReservationModalProps {
  open: boolean;
  reservation: IReservation;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export type AmendTab = "dates" | "guests";