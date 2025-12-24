export interface IPropertyCodeAndIds {
    id: string;
    code: string;
    name: string;
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

// Room Analytics Interfaces - UPDATED
export interface IRoomStatusBreakdown {
    status: string;
    count: number;
}

// UPDATED: Removed IndividualRooms since that model no longer exists
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
    dirtyRooms: number; // Will always be 0 now
    reservedRooms: number;
    checkedInRooms: number;
    tentativeRooms: number; // Will always be 0 now
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
}

export interface ITopPropertyByBookings {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    totalBookings: number;
}

export interface ITopPropertyByOccupancy {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
}

export interface ITopPerformingProperties {
    topByRevenue: ITopPropertyByRevenue[];
    topByBookings: ITopPropertyByBookings[];
    topByOccupancy: ITopPropertyByOccupancy[];
}

// Combined Analytics Response Interface - UPDATED: Removed housekeeping
export interface IAnalyticsData {
    reservation: IReservationAnalytics;
    revenue: IRevenueAnalytics;
    // room: IRoomAnalytics;
    guest: IGuestAnalytics;
    addon: IAddonAnalytics;
    bookingSource: IBookingSourceAnalytics;
    paymentMethod: IPaymentMethodAnalytics;
    topPerformingProperties?: ITopPerformingProperties;
}
// Add these to your existing types file

export interface IComparisonPeriod {
  current: {
    start: Date;
    end: Date;
    label: string;
  };
  previous: {
    start: Date;
    end: Date;
    label: string;
  };
}

export interface IStatisticsComparison {
  bookings: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  cancelledBookings: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  revenue: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  averageBookingValue: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  roomNights: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  period: IComparisonPeriod;
}