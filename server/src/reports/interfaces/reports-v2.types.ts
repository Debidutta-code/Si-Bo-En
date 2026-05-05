export interface IReportUser {
    id: string;
    email: string;
    role?: string;
}

export interface IBaseReportParams {
    creationId: string;
    startDate: string;
    endDate: string;
    user: IReportUser;
    propertyId?: string;
    brandId?: string;
    groupId?: string;
}

export interface IExcelResponse {
    excel: Buffer;
    fileName: string;
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
}


export type ComparisonGroupBy = 'day' | 'month' | 'year';

export interface IComparisonParams extends IBaseReportParams {
    groupBy?: ComparisonGroupBy;
}

export interface IComparisonRow {
    period: string;
    totalBookings: number;
    revenue: number;
    avgBookingValue: number;
    cancellationRate: string;
    roomNights: number;
    properties: string;
}

export interface IComparisonReport {
    groupBy: ComparisonGroupBy;
    startDate: Date;
    endDate: Date;
    rows: IComparisonRow[];
}


export interface IReservationOverviewRow {
    bookingCode: string;
    propertyName: string;
    guestName: string;
    email: string;
    phone: string;
    roomType: string;
    ratePlan: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    amount: string;
    currency: string;
    status: string;
    source: string;
    bookedAt: string;
}

export interface IReservationOverviewReport {
    total: number;
    rows: IReservationOverviewRow[];
}


export interface IRevenuePropertySummary {
    propertyId: string;
    propertyName: string;
    totalBookings: number;
    grossRevenue: number;
    paidAmount: number;
    refundAmount: number;
    outstanding: number;
    netRevenue: number;
    byRoomType: Record<string, number>;
    byBookingSource: Record<string, number>;
    byPaymentMethod: Record<string, number>;
}

export interface IRevenueDetailRow {
    bookingCode: string;
    propertyName: string;
    roomType: string;
    ratePlan: string;
    source: string;
    paymentMethod: string;
    amount: string;
    paid: string;
    refund: string;
    addOnRevenue: string;
    nights: number;
    status: string;
}

export interface IRevenueAnalyticsReport {
    propertySummaries: IRevenuePropertySummary[];
    detailRows: IRevenueDetailRow[];
}


export interface IInsightRow {
    propertyName: string;
    device: string;
    platform: string;
    bookingSource: string;
    country: string;
    promoUsed: string;
    leadDays: string | number;
    bookedAt: string;
}

export interface IInsightsSummary {
    deviceBreakdown: Record<string, number>;
    platformBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    countryBreakdown: Record<string, number>;
    promoUsedCount: number;
    avgLeadDays: number;
}

export interface IInsightsReport {
    total: number;
    summary: IInsightsSummary;
    rows: IInsightRow[];
}


export type TopPropertiesSortBy = 'revenue' | 'bookings' | 'nights';

export interface ITopPropertyRow {
    rank: number;
    propertyName: string;
    propertyCode: string;
    totalBookings: number;
    revenue: string;
    avgBookingValue: string;
    roomNights: number;
    cancellationRate: string;
}

export interface ITopPropertiesReport {
    sortBy: TopPropertiesSortBy;
    rows: ITopPropertyRow[];
}


export interface IAllReservationRow {
    bookingCode: string;
    propertyName: string;
    guestName: string;
    email: string;
    phone: string;
    roomType: string;
    ratePlan: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalGuests: number;
    amount: string;
    paid: string;
    outstanding: string;
    refund: string;
    paymentMethod: string;
    status: string;
    source: string;
    promoUsed: string;
    agency: string;
    isOtaBooking: string;
    addOnsCount: number;
    addOnTotal: string;
    cancelledAt: string;
    cancellationReason: string;
    bookedAt: string;
}

export interface IAllReservationsReport {
    total: number;
    rows: IAllReservationRow[];
}

export type CheckInOutMode = 'checkin' | 'checkout';

export interface ICheckInOutParams extends IBaseReportParams {
    mode?: CheckInOutMode;
}

export interface ICheckInOutRow {
    bookingCode: string;
    propertyName: string;
    guestName: string;
    email: string;
    phone: string;
    country: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    amount: string;
    paidAmount: string;
    paymentMethod: string;
    status: string;
}

export interface ICheckInOutReport {
    mode: CheckInOutMode;
    total: number;
    rows: ICheckInOutRow[];
}


export interface IStatusBreakdownRow {
    status: string;
    count: number;
    totalAmount: string;
    percentageOfBookings: string;
    avgAmount: string;
}

export interface IPropertyStatusBreakdown {
    propertyName: string;
    propertyCode: string;
    totalBookings: number;
    statuses: IStatusBreakdownRow[];
}

export interface IStatusBreakdownReport {
    overallTotal: number;
    overallStatuses: IStatusBreakdownRow[];
    byProperty: IPropertyStatusBreakdown[];
}

export interface ILoyaltyGuestRow {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    propertyName: string;
    loyaltyMemberSince: string;
    totalBookings: number;
    totalSpend: string;
    lastVisit: string;
    isActive: string;
}

export interface ILoyaltyGuestReport {
    total: number;
    rows: ILoyaltyGuestRow[];
}


export interface IPaymentStatusRow {
    bookingCode: string;
    propertyName: string;
    guestName: string;
    email: string;
    amount: string;
    paid: string;
    outstanding: string;
    refund: string;
    paymentMethod: string;
    derivedStatus: string;
    agencyName: string;
    agencyCommission: string;
    commissionType: string;
    bookedAt: string;
}

export interface IPaymentStatusSummary {
    totalAmount: number;
    totalPaid: number;
    totalOutstanding: number;
    totalRefund: number;
    fullyPaid: number;
    partiallyPaid: number;
    unpaid: number;
    refunded: number;
}

export interface IPaymentStatusReport {
    total: number;
    summary: IPaymentStatusSummary;
    rows: IPaymentStatusRow[];
}


export interface IWatermarkData {
    downloadedBy: string;
    email: string;
    downloadedAt: string;
    reportName: string;
}
