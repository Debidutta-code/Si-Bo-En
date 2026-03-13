// ─── Guest ───────────────────────────────────────────────────────────────────

import type { IReservation } from "./reservation";

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
  noOfChildrens: number;
  noOfRooms: number;
  ratePlanCode: string;
  bookingCode: string;
  previousRooms: number;
  includedAddons?: string[];
  parsedAddons?: ISelectedAddons[];
  childAges?:number[];
  promoCode?: string;
}
export interface ISelectedAddons {
  addOnId: string;
  availability: IAddonAvailability[];
}
export interface IAddonAvailability {
  date: string;
  quantity: number;
}
export interface ITaxItem {
  name: string;
  type: "percentage" | "fixed";
  amount?: number;
  percentage?: number;
}

export interface IPriceBreakdownDetail {
  totalBaseAmount: number;
  totalAdditionalCharges: number;
  totalAmount: number;
  totalTax: number;
  priceAfterTax: number;
}

export interface IDailyBreakdown {
  date: string;
  baseRate: number;
  totalPerRoom: number;
  totalForAllRooms: number;
  additionalCharges: number;
  currencyCode: string;
  ratePlanCode: string;
}

export interface IPriceCheckResponse {
  totalAmount: number;
  priceAfterTax: number;
  totalTax: number;
  numberOfNights: number;
  numberOfRooms?: number;
  baseRatePerNight: number;
  breakdown: IPriceBreakdownDetail;
  dailyBreakdown: IDailyBreakdown[];
  tax: ITaxItem[];
  discount?: number;
  availableRooms?: number;
}


export interface IBookingCalculation {
  finalPayable: number;   // extra amount guest owes
  refundAmount: number;   // amount to be refunded
  discount: number;
}

export interface IAmendFinalPrice extends IPriceCheckResponse {
  booking: IBookingCalculation;
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
  reservation: IReservation;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export type AmendTab = "dates" | "guests";