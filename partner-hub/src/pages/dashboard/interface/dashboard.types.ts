export interface AgentReservationAnalytics {
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

export interface AgentRevenueAnalytics {
    totalRevenue: number;
    paidAmount: number;
    pendingAmount: number;
    refundedAmount: number;
    averageBookingValue: number;
    revenueByPaymentMethod: {
        pay_at_hotel: number;
        net_banking: number;
        upi: number;
        payment_gateway: number;
    };
}

export interface AgentGuestAnalytics {
    totalGuests: number;
    adults: number;
    children: number;
    infants: number;
    repeatGuests: number;
}

export interface AgentBookingSourceAnalytics {
    direct: number;
    google: number;
    trip_adviser: number;
    trivago: number;
    social_media: number;
    agency: number;
}

export interface AgentPropertyAnalytics {
    propertyId: string;
    propertyName: string;
    propertyCode: string;
    totalReservations: number;
    totalRevenue: number;
    averageBookingValue: number;
}

export interface AgentAnalyticsData {
    reservation: AgentReservationAnalytics;
    revenue: AgentRevenueAnalytics;
    guest: AgentGuestAnalytics;
    bookingSource: AgentBookingSourceAnalytics;
    propertiesBreakdown: AgentPropertyAnalytics[];
}

export interface DashboardFilters {
    propertyId?: string;
    bookingStatus?: string;
    startDate?: string;
    endDate?: string;
}

export interface AgencyProperty {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
}
