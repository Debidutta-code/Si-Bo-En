// ============================================
// 1. TYPES (types/availability.types.ts)
// ============================================
export interface ICalendarRequest {
  propertyCode: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface IBaseGuestAmount {
  amountBeforeTax: number;
  numberOfGuests: number;
  ageQualifyingCode: string;
  id: string;
}

export interface IAdditionalGuestAmount {
  ageQualifyingCode: string;
  amount: number;
  id: string;
}

export interface IRoomTypePrice {
  invTypeCode: string;
  currencyCode: string;
  sellStatus: 'open' | 'close';
  cta?: boolean;
  ctd?: boolean;
  baseByGuestAmts: IBaseGuestAmount[];
  additionalGuestAmounts: IAdditionalGuestAmount[];
}

export interface IRatePlanDay {
  ratePlanCode: string;
  minLengthOfStay: number;
  maxLengthOfStay: number;
  cta: boolean;
  ctd: boolean;
  prices: IRoomTypePrice[];
}

export interface IRoomTypeDay {
  invTypeCode: string;
  available: number;
  sold: number;
  occupancy: number;
  status: 'open' | 'close';
}

export interface ICalendarDay {
  date: number;
  dayOfWeek: string;
  month: string;
  year: number;
  fullDate: string;
  roomTypes: IRoomTypeDay[];
  ratePlans: IRatePlanDay[];
  total: number;
  sold: number;
  available: number;
  occupancyPercent: number;
  restrictions: {
    CTA: boolean;
    CTD: boolean;
  };
}

export interface ICalendarResponse {
  hotelCode: string;
  hotelName: string;
  summary: {
    totalRooms: number;
    totalSold: number;
    occupancy: number;
    totalRevenue: number;
  };
  days: ICalendarDay[];
}



