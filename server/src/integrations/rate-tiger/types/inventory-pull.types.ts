
// Add to types/ratetiger.types.ts

// ─── REQUEST ───────────────────────────────────────────

export interface RateTigerHotelAvailRequest {
  start: string;
  end: string;
  roomTypeCode: string;
  ratePlanCode?: string;
  sendBookingLimit?: boolean;
  sendAllRestrictions?: boolean;
  sendLengthsOfStay?: boolean;
}

export interface RateTigerOTAHotelAvailGetRQ {
  otaHotelAvailGetRQ: {
    requestId: string;
    timeStamp: string;
    hotelCode: string;
    hotelAvailRequest: RateTigerHotelAvailRequest[];
  };
}

// ─── RESPONSE ──────────────────────────────────────────

export interface RateTigerLengthOfStay {
  minMaxMessageType: 'SetMinLOS' | 'SetMaxLOS';
  time: string;
  timeUnit: 'Day';
}

export interface RateTigerRestrictionStatus {
  status?: 'Open' | 'Close';
  restriction?: 'Master' | 'Arrival' | 'Departure';
  minAdvanceBookingOffSet?: string;
  maxAdvanceBookingOffSet?: string;
}

export interface RateTigerAvailStatusMessage {
  bookingLimit?: string;
  start: string;
  end: string;
  invTypeCode: string;
  ratePlanCode?: string;
  lengthOfStay?: RateTigerLengthOfStay[];
  restrictionStatus?: RateTigerRestrictionStatus[];
}

export interface RateTigerOTAHotelAvailGetRS {
  otaHotelAvailGetRS: {
    requestId: string;
    timeStamp: string;
    hotelCode: string;
    success: string;
    availStatusMessages: RateTigerAvailStatusMessage[];
  };
}

// ─── INTERNAL DAO TYPES ────────────────────────────────

export interface InventoryQueryResult {
  roomTypeCode: string;
  date: Date;
  availability: number;
}

export interface ChargeQueryResult {
  roomTypeCode: string;
  ratePlanCode: string;
  date: Date;
  isClosedToArrival: boolean;
  isClosedToDeparture: boolean;
  isSaleStopped: boolean;
  // minAdvanceBookingDays: number | null;
  // maxAdvanceBookingDays: number | null;
}

export interface RatePlanRuleQueryResult {
  ratePlanCode: string;
  minLos: number;
  maxLos: number | null;
  startDate: Date | null;
  endDate: Date | null;
}