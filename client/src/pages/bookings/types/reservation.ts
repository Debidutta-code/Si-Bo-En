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
  finalPrice?: any;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'modified';
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
  startDate: string;
  endDate: string;
  propertyId?: string;
  propertyCode?: string;
  page: number;
  limit: number;
  bookingStatus?: 'pending' | 'confirmed' | 'cancelled' | 'modified' | 'all';
  reservationType?: 'all' | 'arrivals' | 'departures' | 'checkins' | 'checkouts';
}

export interface IProperty {
  id: string;
  code: string;
  name: string;
}