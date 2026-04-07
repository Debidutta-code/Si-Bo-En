// ─── Payment ──────────────────────────────────────────────────────────────────

export interface IPaymentDetails {
  id: string;
  payAtHotel: boolean;
  paymentGateway: boolean;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethodType = 'payAtHotel' | 'paymentGateway';

// ─── Guest Form ───────────────────────────────────────────────────────────────

export type GuestType = 'adult' | 'child';

export interface IGuestEntry {
  type: GuestType;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface IGuestFormData {
  primaryEmail: string;
  primaryPhone: string;
  guests: IGuestEntry[];
}

export interface IGuestFormErrors {
  primaryEmail?: string;
  primaryPhone?: string;
  guests: Partial<IGuestEntry>[];
}

// ─── Pricing Response ─────────────────────────────────────────────────────────

export interface IAgencyCommissionDetail {
  commissionType: 'percentage' | 'fixed';
  commissionValue: number;
  commissionAmount: number;
  commissionCurrency: string;
}

export interface ITaxDetail {
  name: string;
  amount: number;
  type: 'percentage' | 'fixed';
}

export interface ITouristTaxDetail {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  calculatedAmount: number;
  currencyCode: string;
}

export interface IIncludedAddonDetail {
  addonId: string;
  addonName: string;
  addonCode: string;
  postingRhythm: string;
  totalAmount: number;
  currencyCode: string;
  description: string;
}

export interface IPerRoomBreakdown {
  roomNumber: number;
  adults: number;
  children: number;
  adultBaseAmount: number;
  childBaseAmount: number;
  additionalAdultCharges: number;
  additionalChildCharges: number;
  roomTotal: number;
}

export interface IDailyBreakdown {
  date: string;
  dayOfWeek: string;
  baseAmount: number;
  additionalCharges: number;
  totalForAllRooms: number;
  currencyCode: string;
  perRoomBreakdown: IPerRoomBreakdown[];
}

export interface IAgentPricingBreakdown {
  amountBeforeTax: number;
  totalAddonAmount: number;
  subtotal: number;
  agencyCommissionAmount: number;
  totalAfterCommission: number;
  taxedAmount: number;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  totalAmount: number;
  averagePerNight: number;
}

export interface IAgentFinalPriceResponse {
  numberOfNights: number;
  currencyCode: string;
  currentChargeableAmount: number;
  latterpayableAmount: number;
  totalAmount: number;
  breakdown: IAgentPricingBreakdown;
  dailyBreakdown: IDailyBreakdown[];
  includedAddons: IIncludedAddonDetail[];
  agencyCommission: IAgencyCommissionDetail;
  taxes: ITaxDetail[];
  touristTax: ITouristTaxDetail | null;
  availableRooms: number;
  requestedRooms: number;
}

// ─── Booking Payload ──────────────────────────────────────────────────────────

export interface ICreateBookingPayload {
  data: {
    bookingDetails: {
      startDate: string;
      endDate: string;
      propertyCode: string;
      hotelName: string;
      roomTypeCode: string;
      ratePlanCode: string;
      numberOfRooms: number;
      finalPrice: IAgentFinalPriceResponse;
      promoCode?: string | null;
      currency: string;
      email: string;
      phone: string;
      guests: {
        adults: number;
        children: number;
        rooms: number;
      };
      paymentMethod: string;
      selectedAddons?: string[];
      selectedPromotions?: string[];
    };
    guestDetails: Array<{
      type: 'adult' | 'child' | 'infant';
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      email?: string;
      phone?: string;
    }>;
  };
}

// ─── Booking Response ─────────────────────────────────────────────────────────

export interface IBookingData {
  id: string;
  bookingCode: string;
  propertyId: string;
  propertyCode: string;
  hotelName: string;
  roomTypeCode: string;
  ratePlanCode: string;
  checkInDate: string;
  checkOutDate: string;
  bookedAt: string;
  primaryGuestId: string;
  bookingUserEmail: string;
  bookingUserPhone: string;
  amount: number;
  currencyCode: string;
  finalPrice: IAgentFinalPriceResponse;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: string;
  bookingStatus: string;
  cancellationReason: string | null;
  bookingSource: string;
  agencyId: string;
  createdAt: string;
  updatedAt: string;
  primaryGuest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface ICreateBookingResponse {
  success: boolean;
  message: string;
  data: IBookingData;
  timestamp?: string;
}