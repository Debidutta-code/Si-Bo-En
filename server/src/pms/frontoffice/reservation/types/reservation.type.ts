import { BookingSource, BookingStatus, CurrencyCode, PaymentMethod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// ==================== PAYLOAD TYPES ====================
export interface ICreateReservationPayload {
  data: {
    bookingDetails: IBookingDetails;
    bankDetails: IBankDetails;
    guestDetails: IGuestDetail[];
  };
}

export interface IBookingDetails {
  startDate: string;
  endDate: string;
  propertyCode: string;
  hotelName: string;
  roomTypeCode: string;
  ratePlanCode: string;
  numberOfRooms: number;
  finalPrice: IFinalPrice;
  promoCode: string | null;
  currency: CurrencyCode;
  email: string;
  phone: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
  };
  guestDetails: IGuestDetail[];
  paymentMethod: string;
}

export interface IGuestDetail {
  type: "adult" | "child" | "infant";
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
}

export interface IFinalPrice {
  totalAmount: number;
  numberOfNights: number;
  baseRatePerNight: number;
  additionalGuestCharges: number;
  breakdown: IPriceBreakdown;
  dailyBreakdown: IDailyBreakdown[];
  availableRooms: number;
  requestedRooms: number;
  totalTaxAmount: number;
  taxes: ITax[];
  subtotal: number;
  taxBreakdown: ITaxBreakdown;
}

export interface IPriceBreakdown {
  totalBaseAmount: number;
  totalAdditionalCharges: number;
  totalAmount: number;
  numberOfNights: number;
  averagePerNight: number;
  totalTax: number;
}

export interface IDailyBreakdown {
  date: string;
  dayOfWeek: string;
  baseRate: number;
  additionalCharges: number;
  totalPerRoom: number;
  totalForAllRooms: number;
  childrenChargesBreakdown: any[];
}

export interface ITax {
  id: string;
  name: string;
  code: string;
  type: string;
  value: number;
  applicableOn: string;
  isInclusive: boolean;
  baseAmount: number;
  taxAmount: number;
  priority: number;
}

export interface ITaxBreakdown {
  totalBaseAmount: number;
  totalAdditionalCharges: number;
  totalAmount: number;
  numberOfNights: number;
  averagePerNight: number;
  totalTax: number;
}

export interface IBankDetails {
  id: string;
  propertyId: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  activatedPaymentMethod: {
    upi: boolean;
    gateway: boolean;
    payAtHotel: boolean;
    bankTransfer: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// ==================== DATABASE TYPES ====================
export interface ICReservation {
  bookingCode: string;
  propertyId: string;
  propertyCode: string | null;
  hotelName: string | null;
  roomTypeCode: string | null;
  ratePlanCode: string | null;
  
  checkInDate: Date;
  checkOutDate: Date;
  bookedAt: Date;
  
  primaryGuestId: string;
  guests: any; // JSON field - stores all guest details
  bookingUserEmail: string;
  bookingUserPhone: string | null;
  
  amount: number;
  currencyCode: CurrencyCode;
  finalPrice: any | null; // JSON field
  
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  
  paymentMethod: PaymentMethod;
  paymentImages: any | null; // JSON field
  
  bookingStatus: BookingStatus;
  cancellationReason: string | null;
  
  bookingSource: BookingSource;
  
  isPromoUsed: boolean;
  promoId: string | null;
}

export interface IReservation extends ICReservation {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReservationWithAllDetails extends IReservation {
  primaryGuest: IGuests;
  priceBreakdowns: IReservationPriceBrakeDown[];
  addOns: any[];
  property?: any;
  promo?: any;
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
  userIdentityCardType?: string | null;
  identityCardNumber?: string | null;
  identityCardImage?: string | null;
}

export interface IGuests extends ICGuest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PRICE BREAKDOWN TYPES ====================
export interface IReservationPriceBrakeDownR {
  reservationId: string;
  additionalGuestCharges: number;
  baseRatePerNight: number;
  numberOfNights: number;
  priceAfterTax: Decimal | number;
  totalAmount: Decimal | number;
  totalTax: Decimal | number;
  breakdown: any; // JSON
  dailyBreakdown: any[]; // JSON array
  availableRooms: number;
  requestedRooms: number;
  tax: any[]; // JSON array
}

export interface IReservationPriceBrakeDown extends IReservationPriceBrakeDownR {
  id: string;
  createdAt: Date;
}

// ==================== ARI MANIPULATION TYPES ====================
export interface IAriManulupulation {
  propertyCode: string;
  roomInfos: AriManupulationRooms[];
  dates: string[];
}

export interface AriManupulationRooms {
  roomTypeCode: string;
  numberOfRooms: number;
}

// ==================== ENUMS ====================
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "modified";
export { BookingStatus, BookingSource, PaymentMethod, CurrencyCode };