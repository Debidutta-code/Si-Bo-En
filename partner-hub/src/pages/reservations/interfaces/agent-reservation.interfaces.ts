import { CurrencyCode } from "@/components/currencyCode/currency-code.type";

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'modified' | 'no_show' | 'checked_in' | 'checked_out' | 'expired';
export type BookingSource = 'direct' | 'google' | 'trip_adviser' | 'trivago' | 'social_media' | 'agency';
export type PaymentMethod = 'pay_at_hotel' | 'net_banking' | 'upi' | 'payment_gateway';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type CommissionType = 'percentage' | 'fixed';
export type DiscountType = 'percentage' | 'fixed';

// ─── Nested Types ─────────────────────────────────────────────────────────────

export interface IGuestDetail {
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
}

export interface IAgencyCommission {
  commissionType: CommissionType;
  commissionValue: number;
  commissionAmount: number;
  commissionCurrency: string;
}

export interface ITaxBreakdown {
  name: string;
  taxedAmount: number;
  currencyCode: string;
}

export interface IGuestDistribution {
  adults: number;
  children: number;
  childAges?: number[];
}

export interface IDailyPriceBreakdown {
  date: string;
  roomNumber?: string;
  dayOfWeek?: string;
  currencyCode: string;
  baseChargesAmount: number;
  additionalChargesAmount: number;
  totalAmount?: number;
  totalForAllRooms?: number;
  addOnBrakeDown?: any[];
  guestDistribution?: IGuestDistribution;
  perRoomBreakdown?: any[];
}

export interface ITouristTax {
  id: string;
  name: string;
  currencyCode: string;
  discountType: DiscountType;
  discountValue: number;
  calculatedAmount: number;
}

export interface IFinalPrice {
  totalAmount: number;
  taxedAmount: number;
  amountBeforeTax: number;
  currencyCode: string;
  taxBrakeDown: ITaxBreakdown[];
  addonBrakeDown: IPricingAddonBreakdown[];
  dailyPriceBrakeDown: IDailyPriceBreakdown[];
  promotionBrakeDown: any[];
  agencyCommission?: IAgencyCommission;
  agencyCommissionAmount?: number;
  latterpayableAmount: number;
  currentChargeableAmount: number;
  loyalityDiscount: number;
  totalAddonAmount: number;
  promoCodeDiscount: number;
  totalPromotionAmount: number;
  availableRooms?: number;
  requestedRooms?: number;
  touristTax?: ITouristTax;
}

export interface IPricingDailyBreakdown {
  id: string;
  pricingBrakeDownId: string;
  roomNumber: string;
  guestDistribution: Record<string, unknown>;
  date: string;
  baseChargesAmount: number;
  additionalChargesAmount: number;
  totalAmount: number;
  currencyCode: string;
}

export interface IPricingTaxBreakdown {
  id: string;
  pricingBrakeDownId: string;
  name: string;
  taxedAmount: number;
  currencyCode: string;
}

export interface IPricingAddonBreakdown {
  id: string;
  pricingBrakeDownId: string | null;
  addonId: string;
  name: string;
  amount: number;
  quantity: number;
  totalAmount: number;
  currencyCode: string;
  date: string;
  type: 'included' | 'selected';
}

export interface IPricingBreakdown {
  id: string;
  reservationId: string;
  totalAmount: number;
  amountBeforeTax: number;
  taxedAmount: number;
  totalAddonAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  promoCodeDiscount: number;
  currencyCode: string;
  loyalityDiscount: number;
  DailyPriceBrakeDown?: IPricingDailyBreakdown[];
  taxBrakeDown?: IPricingTaxBreakdown[];
  AddonBrakeDowns?: IPricingAddonBreakdown[];
  promotionBrakeDown?: IPromotionBrakeDown[];
}

export interface IPromotionBrakeDown {
    id: string;
    name: string;
    promotionType: ReservationPromotionType;
    promotionId?: string | null;
    restrictionType: PromotionrestrictionType;
    type: PromotionBrakeDownType;
    currencyCode: CurrencyCode | null;
    discountAmount: number;
    discountType: DiscountType;
    discountValue: number;
}
export type ReservationPromotionType =
    | 'early_bird'
    | 'mlos'
    | 'device_specific'
    | 'offer_for_tonight'
    | 'normal';
export type PromotionrestrictionType = 'decrease' | 'payLater' | 'increase';
export type PromotionBrakeDownType = 'auto_applied' | 'user_applied';

export interface IAgencyCommissionRecord {
  id: string;
  reservationId: string;
  agencyId: string;
  agentId: string | null;
  commissionType: CommissionType;
  commissionValue: number;
  commissionAmount: number;
  currencyCode: string;
  createdAt: string;
}

export interface IPrimaryGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface IReservationProperty {
  id: string;
  propertyName: string;
  propertyCode: string;
  propertyEmail: string;
  propertyContact: string;
  propertyAddress?: string;
}

// ─── Main Reservation Interface ───────────────────────────────────────────────

export interface IReservation {
  id: string;
  bookingCode: string;
  propertyId: string;
  propertyCode: string | null;
  hotelName: string | null;
  roomName: string | null;
  roomTypeCode: string | null;
  ratePlanCode: string | null;
  ratePlanName: string | null;

  // Use reservationStartDate / reservationEndDate as check-in / check-out
  reservationStartDate: string;
  reservationEndDate: string;
  checkInDate: string | null;   // actual check-in timestamp (set on check-in action)
  checkOutDate: string | null;  // actual check-out timestamp

  countryCode: string;
  timezone: string;
  deviceTypes: DeviceType;
  platforms: string;

  bookingStatus: BookingStatus;
  bookingSource: BookingSource;
  amount: number;
  currencyCode: CurrencyCode;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: PaymentMethod;
  bookingUserEmail: string;
  bookingUserPhone: string | null;
  bookedAt: string;
  cancelledAt: string | null;
  cancellationReason: string | null;

  isPromoUsed: boolean;
  promoId: string | null;
  agencyId: string | null;
  pricingBrakedownId: string | null;

  guests: IGuestDetail[];         // array of guest details
  finalPrice: IFinalPrice;        // typed price breakdown

  primaryGuest?: IPrimaryGuest;
  property?: IReservationProperty;
  PricingBrakeDown?: IPricingBreakdown | null;
  AgencyCommission?: IAgencyCommissionRecord | null;

  createdAt: string;
  updatedAt: string;
}


export interface IReservationFilters {
  bookingStatus?: BookingStatus;
  bookingSource?: BookingSource;
  propertyId?: string;
  propertyCode?: string;
  roomTypeCode?: string;
  ratePlanCode?: string;
  checkInDateFrom?: string;
  checkInDateTo?: string;
  checkOutDateFrom?: string;
  checkOutDateTo?: string;
  bookingCode?: string;
  guestEmail?: string;
  guestPhone?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IReservationsResponse {
  success: boolean;
  message: string;
  data?: {
    reservations: IReservation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ICancelReservationPayload {
  cancellationReason: string;
}

export interface ICancelReservationResponse {
  success: boolean;
  message: string;
  data?: { reservation: IReservation };
}

export interface IReservationDetailsResponse {
  success: boolean;
  message: string;
  data?: { reservation: IReservation };
}


export interface IUReservation {
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
    guests: ICReservationGuest[];
    roomTypeCode: string;
    ratePlanCode: string;
    amount: number;
    finalPrice: IFinalPrice;
    currencyCode: CurrencyCode;
    bookingUserEmail: string;
    bookingUserPhone: string;
    status: 'Modified';
    extraAmountToPay: number;
    refundAmount: number;
    agencyId?: string;
    agentId: string | null;
}
export interface ICReservationGuest {
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  age?: number | null;
  dateOfBirth?: string | null;
}