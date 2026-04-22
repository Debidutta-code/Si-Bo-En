export interface IGuest {
  firstName: string;
  lastName: string;
  type: 'adult' | 'child' | 'infant';
  dateOfBirth?: string;
  age?: number;
}

export interface IPrimaryGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'adult' | 'child' | 'infant';
  propertyId: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipCode?: string | null;
  userIdentityCardType?: string | null;
  identityCardNumber?: string | null;
  identityCardImage?: string | null;
  isALoyalityGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IReservationGuest {
  id: string;
  reservationId: string;
  firstName: string;
  lastName: string;
  type: 'adult' | 'child' | 'infant';
  dateOfBirth?: string | null;
  age?: number | null;
  createdAt: string;
}

export interface IProperty {
  propertyName: string;
  propertyCode: string;
}

export interface ITaxBreakdown {
  id: string;
  name: string;
  taxedAmount: number;
  currencyCode: string;
  priceBreakDownId: string | null;
}

export interface IAddonBreakdown {
  id: string;
  dailyPriceBrakeDownId: string | null;
  pricingBrakeDownId: string | null;
  date?: string;
  name: string;
  type?: 'selected' | 'included';
  amount: number;
  addonId?: string;
  quantity: number;
  totalAmount: number;
  currencyCode: string;

}


// ─── Guest Distribution ───────────────────────────────────────────────────────

export interface IGuestDistribution {
  adults: number;
  children: number;
  childAges: number[];
}

// ─── Promotion Breakdown ──────────────────────────────────────────────────────

export interface IPromotionBreakdown {
  id: string;
  name: string;
  type: 'auto_applied' | 'user_applied';
  currencyCode: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  promotionType: 'mlos' | 'device_specific' | 'early_bird' | 'offer_for_tonight';
  discountAmount: number;
  restrictionType: 'decrease' | 'increase' | 'payLater';
}

export interface IReservationPromotion {
  id: string;
  bookingCode: string;
  bookingId: string;
  promotionType: 'mlos' | 'device_specific' | 'early_bird' | 'offer_for_tonight';
  promotionId: string | null;
  mlosId: string | null;
  amount: number;
  currency: string;
}

// ─── Daily Breakdowns ─────────────────────────────────────────────────────────

/** Used inside finalPrice.dailyBreakdown */
export interface IDailyBreakdown {
  date: string;
  baseRate: number;
  dayOfWeek: string;
  roomNumber: string;
  totalAmount: number;
  currencyCode: string;
  ratePlanCode: string;
  taxBrakeDown: ITaxBreakdown[];
  totalPerRoom: number;
  addOnBrakeDown: IAddonBreakdown[];
  totalForAllRooms: number;
  baseChargesAmount: number;
  guestDistribution: IGuestDistribution;
  totalDailyTaxedAmount: number;
  additionalChargesAmount: number;
}

/** Used inside priceBreakdowns[].dailyBreakdown */
export interface IDailyPriceBreakdown {
  id: string;
  date: string;
  roomNumber: string;
  totalAmount: number;
  currencyCode: string;
  taxBrakeDown: ITaxBreakdown[];
  addOnBrakeDown: IAddonBreakdown[];
  baseChargesAmount: number;
  guestDistribution: IGuestDistribution;
  pricingBrakeDownId: string;
  additionalChargesAmount: number;
}


export interface IFinalPrice {
  taxedAmount: number;
  totalAmount: number;
  currencyCode: string;
  taxBrakeDown: ITaxBreakdown[];
  addonBrakeDown: IAddonBreakdown[];
  dailyBreakdown: IDailyBreakdown[];
  numberOfNights: number;
  requestedRooms: number;
  totalTaxAmount: number;
  amountBeforeTax: number;
  baseRatePerNight: number;
  loyalityDiscount: number;
  totalAddonAmount: number;
  promoCodeDiscount: number;
  promotionBrakeDown: IPromotionBreakdown[];
  dailyPriceBrakeDown: IDailyPriceBreakdown[];
  latterpayableAmount: number;
  totalPromotionAmount: number;
  additionalGuestCharges: number;
  currentChargeableAmount: number;
}

// ─── Price Breakdowns ─────────────────────────────────────────────────────────

export interface IPriceBreakdownSummary {
  totalBaseAmount: number;
  loyalityDiscount: number;
  totalAddonAmount: number;
  promoCodeDiscount: number;
  latterpayableAmount: number;
  totalPromotionAmount: number;
  currentChargeableAmount: number;
}

export interface IPriceBreakdown {
  id: string;
  reservationId: string;
  additionalGuestCharges: number;
  baseRatePerNight: number;
  numberOfNights: number;
  priceAfterTax: number;
  totalAmount: number;
  totalTax: number;
  availableRooms: number;
  requestedRooms: number;
  breakdown: IPriceBreakdownSummary;
  dailyBreakdown: IDailyPriceBreakdown[];
  tax: ITaxBreakdown[];
  createdAt: string;
}

// ─── Add-Ons ──────────────────────────────────────────────────────────────────

export interface IAddOn {
  id: string;
  reservationId: string;
  addonId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  currencyCode: string;
  specialInstructions?: string | null;
  date: string;
  type: 'selected' | 'included';
  createdAt: string;
  updatedAt: string;
}


export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'modified' | 'no_show' | 'checked_in' | 'checked_out';
export type BookingSource = 'direct' | 'google' | 'trip_adviser' | 'trivago' | 'social_media' | 'agency';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type PaymentMethod = 'pay_at_hotel' | 'online' | 'bank_transfer';

export interface IReservation {
  id: string;
  bookingCode: string;
  propertyId: string;
  propertyCode: string;
  hotelName: string;
  roomTypeCode: string;
  ratePlanCode: string;
  bookedAt: string;
  reservationStartDate: string;
  reservationEndDate: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  countryCode: string;
  timezone: string;
  deviceTypes: DeviceType;
  primaryGuestId: string;
  guests: IGuest[];
  bookingUserEmail: string;
  bookingUserPhone: string;
  amount: number;
  roomName: string;
  ratePlanName: string;
  currencyCode: string;
  finalPrice: IFinalPrice;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: PaymentMethod;
  paymentImages?: string[] | null;
  bookingStatus: BookingStatus;
  bookingSource: BookingSource;
  cancellationReason?: string | null;
  isPromoUsed: boolean;
  promoId?: string | null;
  cancelledAt?: string | null;
  agencyId?: string | null;
  createdAt: string;
  updatedAt: string;
  primaryGuest: IPrimaryGuest;
  property: IProperty;
  PricingBrakeDown?: IPricingBreakdown | null;
  pricingBrakedownId?: string | null;
  platforms?: string; addOns: IAddOn[];
  reservationPromotions: IReservationPromotion[];
  reservationGuests: IReservationGuest[];
  promoCode?: string | null;
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
  AddonBrakeDowns: IAddonBreakdown[];
  DailyPriceBrakeDown: IDailyPriceBreakdown[];
  taxBrakeDown: ITaxBreakdown[];
  promotionBrakeDown: IPromotionBreakdown[];
}

export interface IPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  resultsPerPage: number;
}

export interface IReservationResponse {
  success: boolean;
  message: string;
  data: IReservation[];
  meta: IPaginationMeta;
  timestamp: string;
}


export interface IPropertyListItem {
  id: string;
  code: string;
  name: string;
}
// ─── Filters ──────────────────────────────────────────────────────────────────

export interface IReservationFilters {
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
  dateFilterType?: 'checkin' | 'booking' | 'modification';
  bookingStatus?: 'all' | BookingStatus;
  reservationType?: 'all' | 'arrivals' | 'departures' | 'checkins' | 'checkouts';
  propertyId?: string;
  propertyCode?: string;
  bookingSource?: 'all' | BookingSource;
  bookingDateFrom?: string;
  bookingDateTo?: string;
  promoCode?: string;
  guestName?: string;
  modificationDateFrom?: string;
  modificationDateTo?: string;
  deviceType?: 'all' | DeviceType;
  countryCode?: string;
  bookingCode?: string;
}