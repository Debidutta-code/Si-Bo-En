// Report Types Enum
export enum ReportType {
    GUEST = 'guest',
    RESERVATION = 'reservation',
    ARRIVAL = 'arrival',
    DEPARTURE = 'departure',
}

// Request Interface
export interface IGenerateReportRequest {
    propertyId: string;
    reportType?: ReportType;
    startDate?: string;
    endDate?: string;
}

// Guest Report Types
export interface IGuestReportData {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    userType: string;
    totalReservations: number;
    totalSpent: number;
    lastVisit: Date | null;
}

export interface IGuestReport {
    totalGuests: number;
    guests: IGuestReportData[];
}

// Reservation Report Types
export interface IReservationReportData {
    id: string;
    bookingCode: string;
    bookedAt: Date;
    bookingStatus: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfNights: number;
    numberOfGuests: number; // Parsed from guests JSON
    amount: number;
    paidAmount: number;
    bookingSource: string;
    primaryGuestName: string;
    primaryGuestEmail: string | null;
    primaryGuestPhone: string | null;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
}

export interface IReservationReport {
    totalReservations: number;
    reservations: IReservationReportData[];
    summary: {
        confirmedReservations: number;
        cancelledReservations: number;
        pendingReservations: number;
        totalRevenue: number;
        totalPaid: number;
        totalOutstanding: number;
    };
}

// Arrival Report Types
export interface IArrivalReportData {
    id: string;
    bookingCode: string;
    bookingStatus: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfNights: number;
    numberOfGuests: number;
    amount: number;
    primaryGuestName: string;
    primaryGuestEmail: string | null;
    primaryGuestPhone: string | null;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
}

export interface IArrivalReport {
    totalArrivals: number;
    arrivals: IArrivalReportData[];
}

// Departure Report Types
export interface IDepartureReportData {
    id: string;
    bookingCode: string;
    bookingStatus: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfNights: number;
    numberOfGuests: number;
    amount: number;
    paidAmount: number;
    primaryGuestName: string;
    primaryGuestEmail: string | null;
    primaryGuestPhone: string | null;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
}

export interface IDepartureReport {
    totalDepartures: number;
    departures: IDepartureReportData[];
}

// Combined Report Response
export type ReportData =
    | IGuestReport
    | IReservationReport
    | IArrivalReport
    | IDepartureReport;

export interface IReportResponse {
    reportType: ReportType;
    propertyId: string;
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
    data: ReportData;
}
export interface IGuestsData {
  adults: number;
  children: number;
  infants: number;
  [key: string]: any; // For any additional fields
}