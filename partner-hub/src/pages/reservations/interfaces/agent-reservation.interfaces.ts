export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'modified' | 'no_show';
export type BookingSource = 'direct' | 'google' | 'trip_adviser' | 'trivago' | 'social_media' | 'agency';
export type PaymentMethod = 'pay_at_hotel' | 'net_banking' | 'upi' | 'payment_gateway';
export type CurrencyCode = 'USD' | 'EUR' | 'INR';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface IReservation {
  id: string;
  bookingCode: string;
  propertyId: string;
  propertyCode: string | null;
  hotelName: string | null;
  roomTypeCode: string | null;
  ratePlanCode: string | null;
  checkInDate: string;
  checkOutDate: string;
  bookingStatus: BookingStatus;
  bookingSource: BookingSource;
  amount: number;
  currencyCode: CurrencyCode;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  bookingUserEmail: string;
  bookingUserPhone: string | null;
  bookedAt: string;
  actualCheckInAt: string | null;
  actualCheckOutAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  guests: any;
  finalPrice: any;
  primaryGuest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
  };
  property?: {
    id: string;
    propertyName: string;
    propertyCode: string;
    propertyEmail: string;
    propertyContact: string;
  };
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
  data?: {
    reservation: IReservation;
  };
}

export interface IReservationDetailsResponse {
  success: boolean;
  message: string;
  data?: {
    reservation: IReservation;
  };
}
