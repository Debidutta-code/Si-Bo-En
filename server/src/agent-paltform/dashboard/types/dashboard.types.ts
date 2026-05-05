import { BookingStatus } from "../../../reservation/types/reservation.type";

// ─── Backend types (used in repository/service) ───────────────────────────────

export interface IAgentReservationAnalytics {
    totalReservations: number;
    confirmedReservations: number;
    pendingReservations: number;
    cancelledReservations: number;
    todayCheckIns: number;
    todayCheckOuts: number;
    upcomingReservations: number;
    recentBookings: number;
    cancellationRate: number;
}

export interface IAgentRevenueAnalytics {
    totalRevenue: number;
    paidAmount: number;
    pendingAmount: number;
    refundedAmount: number;
    averageBookingValue: number;
    totalCommissionEarned: number;
    averageCommissionPerBooking: number;
    revenueByPaymentMethod: {
        pay_at_hotel: number;
        net_banking: number;
        upi: number;
        payment_gateway: number;
    };
}

export interface IAgentGuestAnalytics {
    totalGuests: number;
    adults: number;
    children: number;
    infants: number;
    repeatGuests: number;
}

export interface IAgentBookingSourceAnalytics {
    direct: number;
    google: number;
    trip_adviser: number;
    trivago: number;
    social_media: number;
    agency: number;
}

export interface IAgentPropertyAnalytics {
    propertyId: string;
    propertyName: string;
    propertyCode: string;
    totalReservations: number;
    totalRevenue: number;
    averageBookingValue: number;
    totalCommission: number;
}

export interface IAgentAnalyticsData {
    reservation: IAgentReservationAnalytics;
    revenue: IAgentRevenueAnalytics;
    guest: IAgentGuestAnalytics;
    bookingSource: IAgentBookingSourceAnalytics;
    propertiesBreakdown: IAgentPropertyAnalytics[];
}

export interface IDateRange {
    startDate?: Date;
    endDate?: Date;
}

export interface IAgentDashboardFilters extends IDateRange {
    propertyId?: string;
    bookingStatus?: BookingStatus;
}

export interface IStoredGuest {
    type?: string;
    userType?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
}

export interface IAgencyProperty {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
}