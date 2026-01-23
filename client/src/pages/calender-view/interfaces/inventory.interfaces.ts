// interfaces/inventory.interfaces.ts

export interface InventoryAnalysisFilters {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  roomTypeCode?: string; // Optional - specific room type
}

export interface RoomTypeResponse {
  id: string;
  roomName: string;
  roomType: string;  // ← This is what the API returns
  totalRoom: number;
}

export interface RoomTypeWithRatePlans {
  invTypeCode: string;
  name: string;
  ratePlans?: RatePlan[];
}
export interface RatePlan {
  id: string;
  name: string;
  code: string;
}

// API Response structure
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
  available: number;
  sold: number;
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
  sellStatus: 'open' | 'close'; // ✅ Strict type to match your existing types
  cta: boolean;
  ctd: boolean;
  baseByGuestAmts: GuestAmount[];
  additionalGuestAmounts: AdditionalGuestAmount[];
}

export interface GuestAmount {
  amountBeforeTax: number;
  numberOfGuests: number;
  _id: string;
}

export interface AdditionalGuestAmount {
  ageQualifyingCode: string;
  amount: number;
  _id: string;
}