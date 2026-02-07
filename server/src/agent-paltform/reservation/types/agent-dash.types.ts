import { BookingStatus, BookingSource, PaymentMethod, CurrencyCode, DeviceType } from "@prisma/client";

export interface IReservationFilters {
    bookingStatus?: BookingStatus;
    bookingSource?: BookingSource;
    propertyId?: string;
    propertyCode?: string;
    roomTypeCode?: string;
    ratePlanCode?: string;
    checkInDateFrom?: Date;
    checkInDateTo?: Date;
    checkOutDateFrom?: Date;
    checkOutDateTo?: Date;
    bookingCode?: string;
    guestEmail?: string;
    guestPhone?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface IReservationResponse {
    id: string;
    bookingCode: string;
    propertyId: string;
    propertyCode: string | null;
    hotelName: string | null;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    checkInDate: Date;
    checkOutDate: Date;
    bookingStatus: BookingStatus;
    bookingSource: BookingSource;
    amount: number;
    currencyCode: CurrencyCode;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    bookingUserEmail: string;
    bookingUserPhone: string | null;
    bookedAt: Date;
    actualCheckInAt: Date | null;
    actualCheckOutAt: Date | null;
    cancelledAt: Date | null;
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

export interface ICancelReservationPayload {
    cancellationReason: string;
}

export interface IReservationStats {
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    pendingReservations: number;
    totalRevenue: number;
    averageBookingValue: number;
}
