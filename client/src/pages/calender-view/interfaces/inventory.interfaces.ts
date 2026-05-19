// interfaces/inventory.interfaces.ts

export interface InventoryAnalysisFilters {
  startDate: string;
  endDate: string;
  roomTypeCodes?: string[];
  ratePlanCodes?: string[];
}

export interface RoomTypeResponse {
  id: string;
  roomName: string;
  roomType: string;
  totalRoom: number;
}

export interface RoomTypeWithRatePlans {
  invTypeCode: string;
  name: string;
  ratePlans?: RatePlan[];
  _translations?: {
    roomName?: string,
    roomType?: string,
    description?: string

  }
}
export interface RatePlan {
  id: string;
  name: string;
  code: string;
  _translations?: {
    ratePlanName?: string
  }

}

export interface InventoryAnalysisResponse {
  success: boolean;
  message: string;
  data: {
    hotelCode: string;
    hotelName: string;
    summary: {
      totalRooms: number;
      totalSold: number;
      occupancy: number;
      totalRevenue: number;
    };
    days: DayData[];
  };
  timestamp: string;
}
export interface IRatePlanRuleUpdate {
  b2bAvailable: boolean;
  b2cAvailable: boolean;
  maximumLengthOfStay: number;
  minimumLengthOfStay: number;
  startDate?: string | null;
  endDate?: string | null;
}
export interface DayData {
  date: number;
  dayOfWeek: string;
  month: string;
  year: number;
  fullDate: string;
  roomTypes: RoomTypeData[];
  ratePlans: RatePlanData[];
  total: number;
  sold: number;
  available: number;
  occupancyPercent: number;
  restrictions: {
    CTA: boolean;
    CTD: boolean;
  };
}

export interface RoomTypeData {
  invTypeCode: string;
  roomName?: string;
  available: number;
  sold: number;
  maxAdults: number;
  maxChildren: number;
  occupancy: number;
  status: string;
}

export interface RatePlanData {
  ratePlanCode: string;
  ratePlanName: string;
  minLengthOfStay: number;
  maxLengthOfStay: number;
  cta: boolean;
  ctd: boolean;
  prices: PriceData[];
}

export interface PriceData {
  invTypeCode: string;
  currencyCode: string;
  sellStatus: 'open' | 'close';
  cta: boolean;
  ctd: boolean;
  baseByGuestAmts: GuestAmount[];
  additionalGuestAmounts: AdditionalGuestAmount[];
}

export interface GuestAmount {
  amountBeforeTax: number;
  numberOfGuests: number;
  ageQualifyingCode: string;
  id: string;
}

export interface AdditionalGuestAmount {
  ageQualifyingCode: string;
  amount: number;
  id: string;
}