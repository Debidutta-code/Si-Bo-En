import { RestrictionType } from "../../ari/types";
import { DiscountType } from "../../promocode/types";
import { AddonBreakDownType, BookingSource, BookingStatus, ISpaPricing, PaymentMethod, ReservationPromotionType } from "../../reservation/types";
import { CurrencyCode } from "../../tax-system/interfaces";

export interface IRawDailyPriceBrakeDown {
    id: string;
    pricingBrakeDownId: string;
    roomNumber: string;
    guestDistribution: {
        adults: number;
        children: number;
        childAges?: number[];
        [key: string]: any;
    } | null;
    date: Date;
    baseChargesAmount: number;
    additionalChargesAmount: number;
    totalAmount: number;
    currencyCode: CurrencyCode;
}

export interface IRawTaxBrakeDown {
    id: string;
    pricingBrakeDownId: string;
    name: string;
    taxedAmount: number;
    currencyCode: CurrencyCode;
}

export interface IRawAddonBrakeDown {
    id: string;
    dailyPriceBrakeDownId: string | null;
    pricingBrakeDownId: string | null;
    addonId: string;
    name: string;
    amount: number;
    quantity: number;
    totalAmount: number;
    currencyCode: CurrencyCode;
    date: Date;
    type: AddonBreakDownType;
}

export interface IRawPromotionBrakeDown {
    id: string;
    pricingBrakedownId: string;
    promotionType: ReservationPromotionType;
    name: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
    discountAmount: number;
    restrictionType: RestrictionType;
    type: PromotionApplyType;
}
export enum PromotionApplyType {
    user_applied = 'user_applied',
    auto_applied = 'auto_applied',
}
export interface IRawPricingBreakdown {
    id: string;
    reservationId: string;
    totalAmount: number;
    amountBeforeTax: number;
    taxedAmount: number;
    totalAddonAmount: number;
    totalPromotionAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    promoCodeDiscount: number;
    currencyCode: CurrencyCode;
    loyalityDiscount: number;
    totalSpa: number;
    DailyPriceBrakeDown: IRawDailyPriceBrakeDown[];
    taxBrakeDown: IRawTaxBrakeDown[];
    AddonBrakeDowns: IRawAddonBrakeDown[];
    promotionBrakeDown: IRawPromotionBrakeDown[];
    SpaPricingBrakeDowns:ISpaPricing[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  NORMALISED PRICE DATA  (output of buildPriceData)
// ─────────────────────────────────────────────────────────────────────────────

export interface IDailyPriceEntry {
    date: Date;
    roomNumber: string;
    guestDistribution: {
        adults: number;
        children: number;
        childAges?: number[];
    } | null;
    baseChargesAmount: number;
    additionalChargesAmount: number;
    totalAmount: number;
    currencyCode: string;
}

export interface ITaxEntry {
    name: string;
    taxedAmount: number;
    currencyCode: string;
}

export interface IAddonEntry {
    addonId: string;
    name: string;
    amount: number;
    quantity: number;
    totalAmount: number;
    currencyCode: string;
    date: Date;
    type: AddonBreakDownType;
}

export interface IPromotionEntry {
    id: string;
    name: string;
    promotionType: ReservationPromotionType;
    discountType: DiscountType;
    discountValue: number;
    discountAmount: number;
    currencyCode: string;
    restrictionType: RestrictionType;
    type: PromotionApplyType;
}

export interface IPriceData {
    // ── Totals ──────────────────────────────────────────────────────────────
    totalAmount: number;
    amountBeforeTax: number;
    taxedAmount: number;
    totalAddonAmount: number;
    totalPromotionAmount: number;
    currentChargeableAmount: number;
    latterpayableAmount: number;
    promoCodeDiscount: number;
    loyalityDiscount: number;
    currencyCode: string;
    totalSpa:number;

    // ── Computed ─────────────────────────────────────────────────────────────
    numberOfNights: number;
    requestedRooms: number;
    baseRatePerNight: number;

    // ── Breakdowns ───────────────────────────────────────────────────────────
    dailyPriceBrakeDown: IDailyPriceEntry[];
    taxBrakeDown: ITaxEntry[];
    addonBrakeDown: IAddonEntry[];
    promotionBrakeDown: IPromotionEntry[];
    SpaPricingBrakeDowns:ISpaPricing[]
}

// ─────────────────────────────────────────────────────────────────────────────
//  VOUCHER  DATA  (what generateBookingVoucherHTML receives)
// ─────────────────────────────────────────────────────────────────────────────

export interface IVoucherProperty {
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    propertyCode: string;
    description: string | null;
    image: string[] | null;
    logo: string | null;
    primaryColor: string;
    starRating: number | null;
    propertyAddress: {
        addressLine1: string;
        city: string;
        state: string;
        [key: string]: any;
    } | null;
    propertyAmenities: Array<{
        amenity: { amenityName: string; icon: string | null };
    }>;
}

export interface IVoucherReservation {
    bookingCode: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    bookingSource: BookingSource;
    bookingStatus: BookingStatus;
    amount: number;
    paidAmount: number;
    currencyCode: CurrencyCode;
    createdAt: Date;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    guests: any;
    paymentMethod: PaymentMethod;
}

export interface IVoucherRoom {
    roomName: string;
    roomType: string;
    image: string[];
    description: string | null;
    maxOccupancy: number;
    roomSize: number | null;
    roomUnit: string | null;
}

export interface IVoucherGuest {
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
    userType: string;
    userIdentityCardType: string | null;
    identityCardNumber: string | null;
}

export interface IVoucherReservationGuest {
    id: string;
    firstName: string;
    lastName: string;
    type: string;
    age: number | null;
}

export interface IVoucherAddon {
    name: string;
    quantity: number;
    totalPrice: number;
    unitPrice: number;
    date: Date | null;
    type: AddonBreakDownType;
    images: string[];
}

export interface IVoucherData {
    property: IVoucherProperty;
    room: IVoucherRoom | null;
    ratePlanName: string | null;
    reservation: IVoucherReservation;
    reservationGuests: IVoucherReservationGuest[];
    primaryGuest: IVoucherGuest | null;
    addOns: IVoucherAddon[];
    priceData: IPriceData | null;
}


export enum ReportType {
    GUEST = 'guest',
    RESERVATION = 'reservation',
    ARRIVAL = 'arrival',
    DEPARTURE = 'departure',
}

export interface IGenerateReportRequest {
    propertyId: string;
    reportType?: ReportType;
    startDate?: string;
    endDate?: string;
}

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

export interface IReservationReportData {
    id: string;
    bookingCode: string;
    bookedAt: Date;
    bookingStatus: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfNights: number;
    numberOfGuests: number;
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
    [key: string]: any;
}