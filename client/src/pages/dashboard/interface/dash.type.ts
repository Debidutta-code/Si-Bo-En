import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

export interface ILoader {
    isLoading: boolean;
    message: string;
}

export interface IPropertyCodeAndIds {
    id: string;
    code: string;
    name: string;
    currencyCode: CurrencyCode;
}

// Reservation Analytics Interfaces
export interface IReservationStatusBreakdown {
    status: string;
    count: number;
}

export interface IReservationAnalytics {
    totalReservations: number;
    statusBreakdown: IReservationStatusBreakdown[];
    todayCheckIns: number;
    todayCheckOuts: number;
    upcomingReservations: number;
    cancellationRate: string;
    averageStayDuration: string;
    averageGuestsPerBooking: string;
    totalGuests: number;
    last30DaysBookings: number;
}

// Revenue Analytics Interfaces
export interface IPaymentStatusBreakdown {
    status: string;
    amount: number;
    count: number;
}

export interface IRevenueAnalytics {
    totalRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    lastMonthRevenue: number;
    monthOverMonthGrowth: string;
    revPAR: number;
    paymentStatusBreakdown: IPaymentStatusBreakdown[];
    averageRevenuePerBooking: number;
    pendingPayments: {
        amount: number;
        count: number;
    };
    last7DaysTrend: Array<{
        date: string;
        revenue: number;
    }>;
}

// Room Analytics Interfaces
export interface IRoomStatusBreakdown {
    status: string;
    count: number;
}

export interface IRoomTypeStats {
    roomType: string;
    roomName: string;
    totalRoom: number;
}

export interface IRoomTypeOccupancy {
    roomType: string;
    roomName: string;
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: string;
}

export interface IRoomAnalytics {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    dirtyRooms: number;
    reservedRooms: number;
    checkedInRooms: number;
    tentativeRooms: number;
    occupancyRate: string;
    roomStatusBreakdown: IRoomStatusBreakdown[];
    roomTypeStats: IRoomTypeStats[];
    roomTypeOccupancy: IRoomTypeOccupancy[];
}

// Guest Analytics Interfaces
export interface IGuestTypeBreakdown {
    type: string;
    count: number;
}

export interface ICountryBreakdown {
    country: string;
    count: number;
}

export interface IGuestAnalytics {
    totalGuests: number;
    guestTypeBreakdown: IGuestTypeBreakdown[];
    repeatGuestsCount: number;
    repeatGuestRate: string | number;
    topCountries: ICountryBreakdown[];
    recentGuests: number;
    verifiedGuests: number;
    verificationRate: string;
}

// Addon Analytics Interfaces
export interface IPopularAddon {
    addonId: string;
    addonName: string,
    revenue: number;
    bookingCount: number;
}

export interface IAddonAnalytics {
    totalAddonRevenue: number;
    addonCount: number;
    popularAddons: IPopularAddon[];
}

// Booking Source Analytics Interfaces
export interface ISourceBreakdown {
    source: string;
    count: number;
    revenue: number;
}

export interface IBookingSourceAnalytics {
    sourceBreakdown: ISourceBreakdown[];
}

// Payment Method Analytics Interfaces
export interface IPaymentMethodBreakdown {
    method: string;
    amount: number;
    count: number;
}

export interface IPaymentMethodAnalytics {
    methodBreakdown: IPaymentMethodBreakdown[];
}

// Top Performing Properties Interfaces
export interface ITopPropertyByRevenue {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    totalRevenue: number;
    _translations?: {
        propertyName: string;
        description?: string;
    };
}

export interface ITopPropertyByBookings {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    totalBookings: number;
    _translations?: {
        propertyName: string;
        description?: string;
    };
}

export interface ITopPropertyByOccupancy {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
    _translations?: {
        propertyName: string;
        description?: string;
    };
}

export interface ITopPerformingProperties {
    topByRevenue: ITopPropertyByRevenue[];
    topByBookings: ITopPropertyByBookings[];
    topByOccupancy: ITopPropertyByOccupancy[];
}

// Combined Analytics Response Interface - REMOVED housekeeping
export interface IAnalyticsData {
    currencyCode: CurrencyCode;
    reservation: IReservationAnalytics;
    revenue: IRevenueAnalytics;
    room: IRoomAnalytics;
    guest: IGuestAnalytics;
    addon: IAddonAnalytics;
    bookingSource: IBookingSourceAnalytics;
    paymentMethod: IPaymentMethodAnalytics;
    topPerformingProperties?: ITopPerformingProperties;
}
// Add these to your interface.ts file

export interface IComparisonPeriod {
    current: {
        start: string;
        end: string;
        label: string;
    };
    previous: {
        start: string;
        end: string;
        label: string;
    };
}

export interface IStatisticMetric {
    current: number;
    previous: number;
    percentageChange: number;
}

export interface IStatisticsComparison {
    currencyCode: CurrencyCode;
    bookings: IStatisticMetric;
    cancelledBookings: IStatisticMetric;
    revenue: IStatisticMetric;
    averageBookingValue: IStatisticMetric;
    roomNights: IStatisticMetric;
    period: IComparisonPeriod;
}