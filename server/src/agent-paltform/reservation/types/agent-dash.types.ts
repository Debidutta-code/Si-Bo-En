import {
    BookingSource,
    BookingStatus,
    PaymentMethod,
} from '../../../reservation/types/reservation.type';
import { CurrencyCode } from '../../../tax-system/interfaces';
import {
    AddonBreakDownType,
    ReservationPromotionType,
} from '../../../reservation/types/reservation.type';
import { RestrictionType } from '../../../../prisma/generated/prisma/enums';
import { DiscountType } from '../../../promocode/types';
import { AgentCommissionType } from '../../../agency/types';

// ─── Filters ────────────────────────────────────────────────────────────────

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

// ─── Nested Types ────────────────────────────────────────────────────────────

export interface IReservationPrimaryGuest {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phoneNumber: string | null;
}

export interface IReservationProperty {
    id: string;
    propertyName: string;
    propertyCode: string;
    propertyEmail: string;
    propertyContact: string;
    propertyAddress?: string;
}

export interface IReservationDailyPriceBreakdown {
    id: string;
    pricingBrakeDownId: string;
    roomNumber: string;
    guestDistribution: any;
    date: Date;
    baseChargesAmount: number;
    additionalChargesAmount: number;
    totalAmount: number;
    currencyCode: CurrencyCode;
}

export interface IReservationTaxBreakdown {
    id: string;
    pricingBrakeDownId: string;
    name: string;
    taxedAmount: number;
    currencyCode: CurrencyCode;
}

export interface IReservationAddonBreakdown {
    id: string;
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

export interface IReservationPromotionBreakdown {
    id: string;
    pricingBrakedownId: string;
    promotionId:string |null;
    promotionType: ReservationPromotionType;
    name: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
    discountAmount: number;
    restrictionType: RestrictionType;
    type: 'auto_applied' | 'user_applied';
}
export interface IReservationPricingBreakdown {
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
    DailyPriceBrakeDown?: IReservationDailyPriceBreakdown[];
    taxBrakeDown?: IReservationTaxBreakdown[];
    AddonBrakeDowns?: IReservationAddonBreakdown[];
    promotionBrakeDown?: IReservationPromotionBreakdown[];
}

export interface IReservationAgencyCommission {
    id: string;
    reservationId: string;
    agencyId: string;
    agentId: string | null;
    commissionType: AgentCommissionType;
    commissionValue: number;
    commissionAmount: number;
    currencyCode: CurrencyCode;
}

export interface IReservationPromo {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode;
}

export interface IReservationAddon {
    id: string;
    reservationId: string;
    addonId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    currencyCode: string;
    specialInstructions: string | null;
    type: 'included' | 'selected';
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGuestDistribution {
    adults: number;
    children: number;
    rooms: number;
}

// ─── Main Response ───────────────────────────────────────────────────────────

export interface IReservationResponse {
    id: string;
    bookingCode: string;
    propertyId: string;
    propertyCode: string | null;
    hotelName: string | null;
    roomTypeCode: string | null;
    ratePlanCode: string | null;
    checkInDate: Date | null;
    checkOutDate: Date | null;
    reservationStartDate: Date;
    reservationEndDate: Date;
    bookingStatus: BookingStatus;
    bookingSource: BookingSource;
    amount: number;
    currencyCode: CurrencyCode;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    bookingUserEmail: string;
    bookingUserPhone: string | null;
    bookedAt: Date;
    cancelledAt: Date | null;
    cancellationReason: string | null;
    guests: any;
    finalPrice: any;
    primaryGuest?: IReservationPrimaryGuest;
    property?: IReservationProperty;
    PricingBrakeDown?: IReservationPricingBreakdown | null;
    AgencyCommission?: IReservationAgencyCommission | null;
    addOns?: IReservationAddon[];
    promo?: IReservationPromo | null;
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

export interface ICancelReservationPayload {
    cancellationReason: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface IReservationStats {
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    pendingReservations: number;
    totalRevenue: number;
    averageBookingValue: number;
}
