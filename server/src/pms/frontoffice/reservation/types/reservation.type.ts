import { DiscountType } from "../../../../promocode/types";
import { DailyPriceBrakeDown, TaxBrakeDown, AddOnBrakeDown, PromotionBrakeDown } from "../../../../booking-engine/types/pricing.type";
import { CurrencyCode } from "../../../../tax-system/interfaces";
import { DeviceType } from "../../../../agent-paltform/property/types";
export type Platforms = 'web' | 'mobile' | 'desktop';
export type BookingSource="direct"|
  "google"|
  "trip_adviser"|
  "trivago"|
  "social_media"|
  "agency"
  export type BookingStatus="pending"|
  "confirmed"|
  "cancelled"|
  "expired"|
  "modified"|
  "no_show"|
  "checked_in"|
  "checked_out"
  export type PaymentMethod= "pay_at_hotel" | "net_banking" | "upi" | "payment_gateway";
  export type ReservationPromotionType="early_bird" | "mlos" | "device_specific" | "offer_for_tonight"|"normal"
export interface ICreateReservationPayload {
  data: {
    bookingDetails: IBookingDetails;
    bankDetails: IBankDetails;
    guestDetails: IGuestDetail[];
  };
}
export interface IPropertyEmails {
  email: string;
}
export interface IBookingDetails {
  startDate: string;
  endDate: string;
  propertyCode: string;
  hotelName: string;
  roomTypeCode: string;
  ratePlanCode: string;
  numberOfRooms: number;
  numberOfNights?: number;
  finalPrice: IFinalPrice;
  promoCode: string | null;
  currency: CurrencyCode;
  bookingSource: BookingSource;
  refundAmount: any
  email: string;
  phone: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  guestDetails: IGuestDetail[];
  paymentMethod: string;
  selectedAddons?: IBookingAddonCreate[];
  selectedPromotions?: IReservationPromotionCreate[];
  agencyId?: string | null;
  // Additional fields for email service
  bookingCode?: string;
  reservationId?: string;
  bookedAt?: string;
  bookingStatus?: BookingStatus;
  ngeniusOrderRef?: string;
}

export interface IGuestDetail {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age?: number|null;
  email?: string;
  phone?: string;
}

// New PriceBrakeDown-aligned IFinalPrice
export interface IFinalPrice {
  totalAmount: number;
  amountBeforeTax: number;
  taxedAmount: number;
  totalAddonAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  promoCodeDiscount: number;
  loyalityDiscount: number;
  currencyCode: CurrencyCode;
  dailyPriceBrakeDown: DailyPriceBrakeDown[];
  taxBrakeDown: TaxBrakeDown[];
  addonBrakeDown: AddOnBrakeDown[];
  promotionBrakeDown: PromotionBrakeDown[];
  // Fields preserved from old shape for backward compat / email usage
  numberOfNights?: number;
  requestedRooms?: number;
  loyaltyDiscount?: {
    amountAfterDiscount: number;
    appliedTo: string;
    currencyCode: CurrencyCode;
    discountAmount: number;
    discountType: DiscountType;
    discountValue: number;
    guestEmail: string;
    loyaltyMemberId: string;
    originalAmount: number;
    propertyName: string;
  } | null;
}

export interface IBankDetails {
  id: string
  payAtHotel: boolean;
  paymentGateway: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ICReservationR {


    propertyId: string;
    propertyCode: string;
    hotelName: string;

    roomTypeCode: string;
    ratePlanCode: string;

    bookingCode: string;

    bookedAt: Date;

    checkInDate: Date|null;
    checkOutDate: Date|null;

    reservationStartDate: Date;
    reservationEndDate: Date;

    countryCode: string;
    timezone: string;
    deviceTypes: DeviceType;
    platforms: Platforms;

  primaryGuestId: string;

  guests: any;
  bookingUserEmail: string;
  bookingUserPhone: string | null;

  amount: number;
  currencyCode: CurrencyCode;
  finalPrice: any;

  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;

  paymentMethod: PaymentMethod;
  paymentImages: any;

  bookingStatus: BookingStatus;
  cancellationReason: string | null;

  bookingSource: BookingSource;

  isPromoUsed: boolean;
  promoId: string | null;

  cancelledAt: Date | null;
  agencyId: string | null;

}

export interface IReservation extends ICReservationR {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservationWithAllDetails extends IReservation {
  primaryGuest: IGuests;
  priceBreakdowns: IReservationPriceBrakeDown[];
  addOns: IBookingAddon[];
  property?: any;
  promo?: any;
  reservationGuests?: IReservationGuest[];
  reservationPromotions?: IReservationPromotion[];
}

export interface IReservationGuest {
  id: string;
  reservationId: string;
  firstName: string;
  lastName: string;
  type: "adult" | "child" | "infant";
  dateOfBirth: Date | null;
  age: number | null;
}
// ==================== GUEST TYPES ====================
export interface ICGuest {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  propertyId: string;
  userType: "adult" | "child" | "infant";
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  userIdentityCardType: string | null;
  identityCardNumber: string | null;
  identityCardImage: string | null;
}

export interface IGuests extends ICGuest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
// ==================== NORMALIZED PROMOTION TYPES (for internal use) ====================
export interface INormalizedPromotion {
  id?: string;
  promotionType: string;
  promotionName?: string;
  ratePlanName?: string;
  discountValue: number;
  discountType: string;
  discountAmount: number;
}

// ==================== RESERVATION PROMOTION TYPES ====================
export interface IReservationPromotionCreate {
  id?: string;
  bookingCode: string;
  bookingId: string;
  promotionId?: string | null;
  promotionType: ReservationPromotionType;
  mlosId?: string | null;
  amount: number;
  currency: CurrencyCode;
}

// ==================== PRICE BREAKDOWN TYPES ====================
export interface IReservationPriceBrakeDownR {
  reservationId: string;
  additionalGuestCharges: number;
  baseRatePerNight: number;
  numberOfNights: number;
  priceAfterTax: number | number;
  totalAmount: number | number;
  totalTax: number | number;
  breakdown: any; // JSON
  dailyBreakdown: any[]; // JSON array
  availableRooms: number;
  requestedRooms: number;
  tax: any[]; 
}

export interface IReservationPriceBrakeDown extends IReservationPriceBrakeDownR {
  id: string;
  createdAt: Date;
}

// ==================== ARI MANIPULATION TYPES ====================
export interface IAriManulupulation {
  propertyCode: string;
  roomInfos: AriManupulationRooms[];
  dates: Date[];
}

export interface AriManupulationRooms {
  roomTypeCode: string;
  numberOfRooms: number;
}
// Add these interfaces to your existing types file

export interface IReservationUpdatePayload {
  propertyCode: string;
  checkInDate: string;  
  checkOutDate: string; 
  requestedRooms: number;
  rooms: Array<{
    adults: number;
    children: number;
    childAges: number[];
  }>;
  previousRooms: number;
  guests: IGuestDetail[];
  roomTypeCode: string;
  ratePlanCode: string;
  amount: number;
  finalPrice: IFinalPrice;
  currencyCode: CurrencyCode;
  bookingUserEmail: string;
  bookingUserPhone: string;
  status: "Modified";
  extraAmountToPay: number;
  refundAmount: number;
}

export interface IReservationModification {
  reservationId: string;
  oldCheckIn: Date;
  oldCheckOut: Date;
  oldRooms: number;
  oldPrice: number;
  newCheckIn: Date;
  newCheckOut: Date;
  newRooms: number;
  newPrice: number;
  extraAmountToPay: number;
  refundAmount: number;
  modifiedAt: Date;
}

export interface IUpdateReservationResult {
  success: boolean;
  reservation: IReservationWithAllDetails;
  ariChanges: {
    datesFreed: string[];
    datesReserved: string[];
    roomsFreed: number;
    roomsReserved: number;
  };
  financialSummary: {
    oldAmount: number;
    newAmount: number;
    difference: number;
    extraAmountToPay: number;
    refundAmount: number;
  };
}
// ==================== BOOKING ADDON TYPES ====================
// In reservation.type.ts
export interface IBookingAddonCreate {
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

export interface IBookingAddon extends IBookingAddonCreate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== RESERVATION PROMOTION TYPES ====================
export interface IReservationPromotionCreate {
  bookingCode: string;
  bookingId: string;
  promotionId?: string | null;
  mlosId?: string | null;
  amount: number;
  currency: CurrencyCode;
  promotionType: ReservationPromotionType;
}
export interface IReservationPromotionPayload {
  bookingCode: string;
  bookingId: string;
  promotionId?: string | null;
  mlosId?: string | null;
  discountAmount: number;
  currency: CurrencyCode;
  promotionType: string;
}
export interface IReservationPromotion extends IReservationPromotionCreate {
  id: string;
}
// ==================== ENUMS ====================
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "modified";
