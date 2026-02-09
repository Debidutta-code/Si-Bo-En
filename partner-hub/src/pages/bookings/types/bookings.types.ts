// Payment Details Interface
export interface IPaymentDetails {
  id: string;
  payAtHotel: boolean;
  paymentGateway: boolean;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentDetailsResponse {
  success: boolean;
  message: string;
  data: IPaymentDetails;
  timestamp: string;
}

// Guest Form Interface
export interface IGuestFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
}

// Payment Method Type
export type PaymentMethodType = 'payAtHotel' | 'paymentGateway';

// Daily Breakdown
export interface IDailyBreakdown {
  date: string;
  dayOfWeek: string;
  ratePlanCode: string;
  baseRate: number;
  additionalCharges: number;
  totalPerRoom: number;
  totalForAllRooms: number;
  currencyCode: string;
  breakdown: {
    baseAmount: number;
    additionalAdultCharges: number;
    additionalChildrenCharges: number;
    totalAdditionalCharges: number;
    baseGuestsIncluded: number;
    adultsInBaseRate: number;
    childrenInBaseRate: number;
    adultsNotInBaseRate: number;
    childrenNotInBaseRate: number;
  };
}

// Included Addon
export interface IIncludedAddon {
  addonId: string;
  addonName: string;
  addonCode: string;
  postingRhythm: string;
  amount: number;
  currencyCode: string;
  description: string;
}

// Tax
export interface ITax {
  name: string;
  amount: number;
  type: string;
}

// Agency Commission
export interface IAgencyCommission {
  commissionType: string;
  commissionValue: number;
  commissionAmount: number;
  commissionCurrency: string;
}

// Pricing Breakdown
export interface IPricingBreakdown {
  totalBaseAmount: number;
  totalAdditionalCharges: number;
  totalIncludedAddons: number;
  subtotal: number;
  agencyCommission: number;
  totalBeforeTax: number;
  totalTax: number;
  totalAmount: number;
  averagePerNight: number;
}

// Main Pricing Response
export interface IAgentPricingResponse {
  totalAmount: number;
  numberOfNights: number;
  baseRatePerNight: number;
  additionalGuestCharges: number;
  breakdown: IPricingBreakdown;
  dailyBreakdown: IDailyBreakdown[];
  availableRooms: number;
  requestedRooms: number;
  includedAddons: IIncludedAddon[];
  agencyCommission: IAgencyCommission;
  tax: ITax[];
  totalTax: number;
  priceAfterTax: number;
}

// Booking Payload
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
      finalPrice: IAgentPricingResponse;
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
      selectedAddons?: any[];
      selectedPromotions?: any[];
    };
    guestDetails: Array<{
      type: "adult" | "child" | "infant";
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      email?: string;
      phone?: string;
    }>;
  };
}

// Booking Response Data
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
  guests: any;
  bookingUserEmail: string;
  bookingUserPhone: string;
  amount: number;
  currencyCode: string;
  finalPrice: IAgentPricingResponse;
  paidAmount: number;
  extraAmountToPay: number;
  refundAmount: number;
  paymentMethod: string;
  paymentImages: any;
  bookingStatus: string;
  cancellationReason: string | null;
  bookingSource: string;
  isPromoUsed: boolean;
  promoId: string | null;
  countryCode: string;
  timezone: string;
  deviceTypes: string;
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
  priceBreakdowns?: any[];
}

export interface ICreateBookingResponse {
  success: boolean;
  message: string;
  data: IBookingData;
  timestamp?: string;
}