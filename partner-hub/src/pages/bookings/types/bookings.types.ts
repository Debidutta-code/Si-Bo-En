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

export interface ITaxBrakeDown {
  name: string;
  taxedAmount: number;
  currencyCode: string;
}

export interface ITouristTaxDetail {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  calculatedAmount: number;
  currencyCode: string;
}

export interface IAddonBrakeDown {
  addonId: string;
  name: string;
  amount: number;
  quantity: number;
  totalAmount: number;
  currencyCode: string;
  date: string;
  type: 'included';
}

export interface IPromotionBrakeDown {
  id: string;
  promotionType: string;
  name: string;
  currencyCode: string | null;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  restrictionType: 'decrease' | 'payLater';
  type: 'auto_applied' | 'manual';
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

export interface IDailyPriceBrakeDown {
  roomNumber: string;
  guestDistribution: {
    adults: number;
    children: number;
    childAges: number[];
  };
  date: string;
  baseChargesAmount: number;
  additionalChargesAmount: number;
  addOnBrakeDown: IAddonBrakeDown[];
  totalAmount: number;
  currencyCode: string;
}

export interface IAgentFinalPriceResponse {
  currencyCode: string;
  totalAmount: number;                // currentChargeableAmount + latterpayableAmount
  amountBeforeTax: number;            // pureBase + agencyCommission (what agent pays before tax)
  taxedAmount: number;                // tax on subtotal
  totalAddonAmount: number;           // included addons total
  totalPromotionAmount: number;       // 0 for agent
  currentChargeableAmount: number;    // subtotal + taxedAmount
  latterpayableAmount: number;        // tourist tax — paid at property
  loyalityDiscount: number;           // 0 for agent
  promoCodeDiscount: number;          // 0 for agent

  agencyCommissionAmount: number;
  agencyCommission: IAgencyCommissionDetail;

  dailyPriceBrakeDown: IDailyPriceBrakeDown[];
  taxBrakeDown: ITaxBrakeDown[];
  addonBrakeDown: IAddonBrakeDown[];
  promotionBrakeDown: IPromotionBrakeDown[];
  touristTax: ITouristTaxDetail | null;

  availableRooms: number;
  requestedRooms: number;
}

// ─── Booking Payload ──────────────────────────────────────────────────────────

export interface ICreateBookingPayload {
  propertyCode: string;
  agentId: string;
  reservationStartDate: string;
  reservationEndDate: string;

  hotelName: string;
  roomTypeCode: string;
  ratePlanCode: string;
  roomName: string;
  bookingUserEmail: string;
  bookingUserPhone: string;

  numberOfRooms: number;
  finalPrice: IAgentFinalPriceResponse;
  currencyCode: string;

  guests: {
    adults: number;
    children: number;
    rooms: number;
    roomsArray: {
      adults: number;
      children: number;
      childAges: number[];
    }[];
  };

  paymentMethod: 'pay_at_hotel' | 'payment_gateway';

  selectedAddons?: ISelectedAddon[];
  selectedPromotions?: {
    discountType: string;
    discountValue: number;
    id: string;
    promotionName: string;
  }[];

  bookingSource: 'agency'|'direct';
  platforms: 'web' | 'mobile';
  agencyId: string;

  bankDetails?: any;

  guestDetails: Array<{
    type: 'adult' | 'child' | 'infant';
    firstName: string;
    lastName: string;
    dateOfBirth: string;        // made required — backend needs it
  }>;
}

export interface ISelectedAddon {
  addonCode: string;
  addonId: string;
  addonName: string;
  availabilityId: string;
  date: Date;
  price: number;
  quantity: number;
  totalPrice: number;
  type: string;
}
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