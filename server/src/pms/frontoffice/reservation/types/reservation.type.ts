import { DiscountType } from "../../../../promocode/types";
import { PromotionBrakeDown } from "../../../../booking-engine/types/pricing.type";
import { CurrencyCode } from "../../../../tax-system/interfaces";
import { PostingRhythm } from "../../../../add-on/interfaces";
import { RestrictionType } from "../../../../../prisma/generated/prisma/enums";
export type Platforms = 'web' | 'mobile' | 'desktop';
export type BookingSource = "direct" |
  "google" |
  "trip_adviser" |
  "trivago" |
  "social_media" |
  "agency"
export type BookingStatus = "pending" |
  "confirmed" |
  "cancelled" |
  "expired" |
  "modified" |
  "no_show" |
  "checked_in" |
  "checked_out"
export type PaymentMethod = "pay_at_hotel" | "net_banking" | "upi" | "payment_gateway";
export type ReservationPromotionType = "early_bird" | "mlos" | "device_specific" | "offer_for_tonight" | "normal";

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
  currencyCode: CurrencyCode;
  bookingSource: BookingSource;
  refundAmount: any
  bookingUserEmail: string;
  bookingUserPhone: string;
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
  age?: number | null;
  email?: string;
  phone?: string;
}

export interface ICReservationR {
  propertyId: string;
  propertyCode: string;
  currencyCode: CurrencyCode;
  hotelName: string;
  roomTypeCode: string;
  roomName: string | null;
  ratePlanCode: string;
  ratePlanName: string | null;
  bookingCode: string;
  bookedAt: Date;
  checkInDate: Date | null;
  checkOutDate: Date | null;
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
  finalPrice: any;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: PaymentMethod;
  paymentImages: any;
  bookingStatus: BookingStatus;
  cancellationReason: string | null;
  bookingSource: BookingSource;
  pricingBrakedownId: string | null;
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
  addOns: IBookingAddon[];
  PricingBrakeDown?: IPricingBreakDown | null;
  property: IPropertyDetails;
  reservationPromoCodes?: IReservationPromoCodes[];
  reservationGuests?: IReservationGuest[];
  promo: IPromoCode | null;
}
interface IPromoCode {
  id: string,
  code: string,
  discountType: DiscountType,
  discountValue: number,
  currencyCode: CurrencyCode,
}
export interface IReservationPromoCodes {
  id: string;
  reservationId: string;
  promoCodeId: string;
  amount: number;
  currency: CurrencyCode;
}
export interface IPropertyDetails {
  id: string
  propertyName: string
  propertyEmail: string
  propertyContact: string
  propertyCode: string
  description: string
  image: string[]
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
export interface INormalizedPromotion {
  id?: string;
  promotionType: ReservationPromotionType;
  promotionName?: string;
  ratePlanName?: string;
  discountValue: number;
  discountType: string;
  discountAmount: number;
}

export interface IReservationPromotionCreate {
  id?: string;
  bookingCode: string;
  bookingId: string;
  promotionId?: string | null;
  promotionType: ReservationPromotionType;
  mlosId?: string | null;
  amount: number;
  currency: CurrencyCode;
  type: PromotionBrakeDownType;
}

export interface ICPricingBreakDown {
  reservationId: string;
  totalAmount: number;
  amountBeforeTax: number;
  taxedAmount: number;
  totalAddonAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  promoCodeDiscount: number;
  currencyCode: CurrencyCode;
  loyalityDiscount: number;
}

export interface IPricingBreakDown extends ICPricingBreakDown {
  id: string;
  AddonBrakeDowns?: IAddonBrakeDown[];
  DailyPriceBrakeDown?: IDailyPriceBrakeDown[];
  taxBrakeDown?: ITaxBrakeDown[];
  promotionBrakeDown?: IPromotionBrakeDown[];
}
export interface IAddonBrakeDown {
  id: string;
  dailyPriceBrakeDownId?: string | null;
  pricingBrakeDownId?: string | null;
  addonId: string;
  name: string;
  amount: number;
  quantity: number;
  totalAmount: number;
  currencyCode: CurrencyCode;
  date: Date;
  type: AddonBreakDownType;
}

export interface ICPromotionBrakeDown {
  promotionType: ReservationPromotionType;
  name: string
  discountType: DiscountType
  discountValue: number
  currencyCode: CurrencyCode | null;
  discountAmount: number
  restrictionType: RestrictionType
  type: PromotionBrakeDownType
}
export interface IPromotionBrakeDown extends ICPromotionBrakeDown {
  id: string;

}
export interface IReservationPriceBrakeDown extends IPricingBreakDown {
  id: string;

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
  type: "included" | "selected";
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
  type: PromotionBrakeDownType;
}
export interface IReservationPromotionPayload {
  bookingCode: string;
  bookingId: string;
  promotionId?: string | null;
  mlosId?: string | null;
  discountAmount: number;
  currency: CurrencyCode;
  promotionType: string;
  type: PromotionBrakeDownType;
}
export interface IReservationPromotion extends IReservationPromotionCreate {
  id: string;
}
// ==================== ENUMS ====================
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "modified" | "expired" | "no_show" | "checked_in" | "checked_out";
export type userIdentityCardType = "passport"
  | "drivers_license"
  | "national_id"
  | "adhar_card"
  | "pan_card"
  | "others"


export interface IGuestCheckInDetails {
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  userIdentityCardType: userIdentityCardType
  identityCardNumber: string
  identityCardImage?: string
}



export interface IPropertyDetailsFromMiddleware {
  id: string;
  propertyName: string;
  propertyCode: string;
  creationId: string;
  timezone?: string | undefined;
  currencyCode?: string | undefined;
}
export interface ICReservationPayload {
  propertyCode: string;
  reservationStartDate: Date | string;
  reservationEndDate: Date | string;
  hotelName: string;
  bankDetails?: IBankDetails;
  roomName: string;
  roomTypeCode: string;
  guests?: IGuestdistribution;
  bookingUserEmail: string;
  bookingUserPhone: string;
  numberOfRooms: number;
  finalPrice: IFinalPrice;
  promoCode: string;
  currencyCode: CurrencyCode;
  guestDetails: IGuestDetails[];
  ratePlanCode: string;
  paymentMethod: string;
  bookingSource: BookingSource;
  selectedPromotions?: ISelectedPromotions[];
  selectedAddons?: ISelectedAddons[];
  platforms: Platforms;
  agencyId?: string;
  ngeniusOrderRef?: string;
  isLoyalityGuest?: boolean;
}
export interface ICReservationPayloadForEmail extends ICReservationPayload {
  numberOfNights: number;
  bookingCode: string;
  reservationId: string;
  bookedAt: string;
  bookingStatus: ReservationStatus;
  ratePlanName: string;
  refundAmount?: number;
  extraAmountToPay?: number;
}

export interface IBankDetails {
  id: string;
  payAtHotel: boolean;
  paymentGateway: boolean;
  propertyId: string;
  selectedPaymentIntegrations: ISelectedPaymentIntegrations | null;

}
export interface ISelectedPaymentIntegrations {
  id: string;
  propertyId: string;
  paymentIntegrationId: string;
  isActive: boolean;
  outletId: string;
  sameDayRefund: boolean;
  paymentIntegration: {
    id: string;
    name: string;
    isActive: boolean;
  }
}
export interface IGuestdistribution {
  adults: number;
  children: number;
  rooms: number;
  roomsArray: IRoomArray[]
}
export interface IRoomArray {
  adults: number;
  children: number;
  childAges: number[];
}
export interface IGuestDetails {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  salutation?: string;
}
export interface ISelectedAddons {
  addonCode: string;
  addonId: string;
  addonName: string;
  availabilityId: string;
  date: Date;
  price: number;
  quantity: number;
  totalPrice: number;
  type: PostingRhythm;
}
export interface ISelectedPromotions {
  discountType: DiscountType;
  discountValue: number;
  id: string;
  promotionName: string;
}
export type DeviceType = "mobile" | "tablet" | "desktop"
export interface IFinalPrice {
  additionalGuestCharges: number;
  amountBeforeTax: number;
  addonBrakeDown: IAddonBreakdown[];
  amountAfterTax: number;
  baseRatePerNight: number;
  currencyCode: CurrencyCode;
  currentChargeableAmount: number;
  dailyPriceBrakeDown: IDailyPriceBrakeDown[];
  latterpayableAmount: number;
  loyalityDiscount: number;
  numberOfNights: number;
  promoCodeDiscount: number;
  promotionBrakeDown: PromotionBrakeDown[];
  requestedRooms: number;
  taxBrakeDown: ITaxBrakeDown[];
  taxedAmount: number;
  totalAddonAmount: number;
  totalAmount: number;
  totalPromotionAmount: number;
  totalTaxAmount: number;
}

export interface ITaxBrakeDown {
  currencyCode: CurrencyCode
  name: string;
  taxedAmount: number;
}
export interface IPromotionBrakeDown {
  id: string;
  name: string;
  promotionType: ReservationPromotionType;
  restrictionType: PromotionrestrictionType;
  type: PromotionBrakeDownType;
  currencyCode: CurrencyCode | null;
  discountAmount: number;
  discountType: DiscountType;
  discountValue: number;
}
export type PromotionBrakeDownType = "auto_applied" | "user_applied";
export type PromotionrestrictionType = "decrease" | "payLater" | "increase";
export interface ICDailyPriceBrakeDown {
  addOnBrakeDown?: IAddonBreakdown[];
  additionalChargesAmount: number;
  baseChargesAmount: number;
  currencyCode: CurrencyCode;
  date: Date;
  guestDistribution: any;
  pricingBrakeDownId?: string;
  roomNumber: string;
  totalAmount: number;
}
export interface IDailyPriceBrakeDown extends ICDailyPriceBrakeDown {
  id: string;
}
export interface ICTaxBrakeDown {
  currencyCode: CurrencyCode
  name: string;
  taxedAmount: number;
}
export interface ITaxBrakeDown extends ICTaxBrakeDown {
  id: string;
}
export type AddonBreakDownType = "included" | "selected"
export interface ICAddonBreakdown {
  addonId: string;
  amount: number;
  currencyCode: CurrencyCode;
  date: string;
  name: string;
  quantity: number;
  totalAmount: number;
  type: AddonBreakDownType;
}
export interface IAddonBreakdown extends ICAddonBreakdown {
  id: string;
}
export interface IReservationPromocode {
  id: string;
  reservationId: string;
  promoCodeId: string;
  amount: number;
  currency: CurrencyCode;
}

