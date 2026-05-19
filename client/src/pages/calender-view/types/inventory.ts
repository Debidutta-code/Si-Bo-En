

import type { RatePlanData } from "../interfaces/inventory.interfaces";


export interface InventoryDay {
  date: number;
  dayOfWeek: string;
  month: string;
  year: number;
  fullDate: string;

  total: number;
  sold: number;
  available: number;
  occupancyPercent: number;

  roomTypes: RoomType[];
  ratePlans: RatePlan[];

  // CTA / CTD restrictions at DAY level (Room Type level)
  restrictions: {
    CTA: boolean;
    CTD: boolean;
  };
}

// =========================
// ROOM TYPE LEVEL
// =========================
export interface RoomType {
  invTypeCode: string;
  roomName?: string;
  available: number;
  sold: number;
  maxAdults: number;
  maxChildren: number;
  occupancy: number;
  status: "open" | "close";
  _translations?: {
    roomName: string;
    roomType: string;
    description: string;
  }
}


export interface RatePlan {
  ratePlanCode: string;
  ratePlanName?: string;

  minLengthOfStay: number;
  maxLengthOfStay: number;

  cta: boolean;
  ctd: boolean;

  prices: RoomTypePricing[];

  _translations?: {
    ratePlanName?: string;
  };
}


export interface RoomTypePricing {
  invTypeCode: string;
  price?: number | string;
  currencyCode: string;
  sellStatus: string;
  cta?: boolean;
  ctd?: boolean;

  baseByGuestAmts?: {
    numberOfGuests: number;
    amountBeforeTax: number;
    ageQualifyingCode?: string;
    commissionAmount?: number;
    amountAfterCommission?: number;
    _id?: string;
  }[];

  additionalGuestAmounts?: {
    ageQualifyingCode: string;
    amount: number;
    commissionAmount?: number;
    amountAfterCommission?: number;
    id?: string;
  }[];
}


export interface InventoryAnalysis {
  hotelCode: string;
  hotelName: string;
  summary: {
    totalRooms: number;
    totalSold: number;
    occupancy: number;
    totalRevenue: number;
  };
  days: InventoryDay[];
}


export interface FilterState {
  availability: boolean;
  occupancy: boolean;
  notes: boolean;
  events: boolean;
  rateBands: boolean;
  lowInventory: boolean;
  lengthOfStay: boolean;
  stopSell: boolean;
  lastMinute: boolean;
  earlyBooking: boolean;
  closedArrival: boolean;
  closedDeparture: boolean;

  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };

  selectedRoomTypes: string[];
}

export interface RoomTypeFilter {
  invTypeCode: string;
  ratePlanCodes: string[];
  selected: boolean;
}

export interface InventoryAnalysisResponse {
  hotelCode: string;
  hotelName: string;
  summary: {
    totalRooms: number;
    totalSold: number;
    occupancy: number;
    totalRevenue: number;
  };
  days: InventoryDayResponse[];
}

export interface InventoryDayResponse {
  date: number;
  dayOfWeek: string;
  month: string;
  year: number;
  fullDate: string;
  roomTypes: RoomTypeInventory[];
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

export interface InventoryPushPayload {
  hotelCode: string;
  invTypeCode: string;
  ratePlanCode: string[];
  dateDataList: {
    date: string;
    sold: number;
    newInventory: number;
  }[];
}

export interface RoomTypeInventory {
  invTypeCode: string;
  available: number;
  sold: number;
  occupancy: number;
  maxAdults: number;
  maxChildren: number;
  status: "open" | "close";
}

// =========================
// RATE PLAN PUSH PAYLOAD
// =========================
export interface RatePlanPushPayload {
  hotelCode: string;
  invTypeCode: string;
  ratePlanCode: string;
  isOccupancyBased: boolean;
  dateDataList: {
    date: string;
    price?: number;
    baseGuestAmounts?: {
      numberOfGuests: number;
      amountBeforeTax: number;
      commissionAmount?: number;        // ✅ Added
      amountAfterCommission?: number;   // ✅ Added
    }[];
    additionalGuestAmounts?: {
      ageQualifyingCode: string;
      amount: number;
      commissionAmount?: number;        // ✅ Added
      amountAfterCommission?: number;   // ✅ Added
    }[];
  }[];
}