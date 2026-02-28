export interface IGuest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'adult' | 'child' | 'infant';
}

export interface IPrimaryGuest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: 'adult' | 'child' | 'infant';
}

export interface IProperty {
  propertyName: string;
  propertyCode: string;
}

export interface IPriceBreakdown {
  reservationId: string;
  additionalGuestCharges: number;
  baseRatePerNight: number;
  numberOfNights: number;
  priceAfterTax: number;
  totalAmount: number;
  totalTax: number;
  availableRooms: number;
  requestedRooms: number;
}
export interface ITaxBreakdown {
  name: string;
  taxedAmount: number;
  currencyCode: string;
}

export interface IAddonBreakdown {
  name: string;
  amount: number;
  quantity: number;
  totalAmount: number;
  currencyCode: string;
}

export interface IDailyBreakdown {
  date: string;
  baseRate: number;
  dayOfWeek: string;
  totalAmount: number;
  currencyCode: string;
  ratePlanCode: string;
  taxBrakeDown: ITaxBreakdown[];
  totalPerRoom: number;
  addOnBrakeDown: IAddonBreakdown[];
  totalForAllRooms: number;
  baseChargesAmount: number;
  totalDailyTaxedAmount: number;
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
  promotionBrakeDown: any[];
  dailyPriceBrakeDown: any[];
  latterpayableAmount: number;
  totalPromotionAmount: number;
  additionalGuestCharges: number;
  currentChargeableAmount: number;
  
}
export interface IReservation {
  id: string;
  bookingCode: string;
  propertyId: string;
  propertyCode?: string;
  hotelName?: string;
  roomTypeCode?: string;
  ratePlanCode?: string;
  checkInDate: string;
  checkOutDate: string;
  bookedAt: string;
  primaryGuestId: string;
  guests: IGuest[];
  bookingUserEmail: string;
  bookingUserPhone?: string;
  amount: number;
  currencyCode: string;
  finalPrice?: IFinalPrice;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'modified' | 'no_show';
  bookingSource: string;
  isPromoUsed: boolean;
  createdAt: string;
  updatedAt: string;
  primaryGuest?: IPrimaryGuest;
  property?: IProperty;
  priceBreakdowns?: IPriceBreakdown[];
  addOns?: any[];
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
  timestamp?: string;
}

export interface IReservationFilters {
  // Existing filters
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
  dateFilterType?: 'checkin' | 'booking' | 'modification';
  bookingStatus?: 'all' | 'confirmed' | 'pending' | 'cancelled' | 'modified' | 'no_show';
  reservationType?: 'all' | 'arrivals' | 'departures' | 'checkins' | 'checkouts';
  propertyId?: string;
  propertyCode?: string;
  
  // New filters
  bookingSource?: 'all' | 'direct' | 'google' | 'trip_adviser' | 'trivago' | 'social_media' | 'agency';
  bookingDateFrom?: string;
  bookingDateTo?: string;
  promoCode?: string;
  guestName?: string;
  modificationDateFrom?: string;
  modificationDateTo?: string;
  deviceType?: 'all' | 'mobile' | 'tablet' | 'desktop';
  countryCode?: string; // Source Market (GEO)
  bookingCode?: string;
}

export type BookingSource = 'direct' | 'google' | 'trip_adviser' | 'trivago' | 'social_media' | 'agency';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface IProperty {
  id: string;
  code: string;
  name: string;
}