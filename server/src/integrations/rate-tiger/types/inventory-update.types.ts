// types/inventory-update.types.ts

// ─── REQUEST ───────────────────────────────────────────

export interface RateTigerLengthOfStayUpdate {
  minMaxMessageType: 'SetMinLOS' | 'SetMaxLOS';
  time: string;
  timeUnit: 'Day';
}

export interface RateTigerRestrictionStatusUpdate {
  status?: 'Open' | 'Close';
  restriction?: 'Master' | 'Arrival' | 'Departure';
  minAdvanceBookingOffSet?: string;
  maxAdvanceBookingOffSet?: string;
}

export interface RateTigerAvailStatusMessageUpdate {
  bookingLimit?: string;
  start: string;
  end: string;
  invTypeCode: string;
  ratePlanCode?: string;
  lengthOfStay?: RateTigerLengthOfStayUpdate[];
  restrictionStatus?: RateTigerRestrictionStatusUpdate[];
}

export interface RateTigerInventoryUpdateRQ {
  otaHotelAvailNotifRQ: {
    requestId: string;
    timeStamp: string;
    hotelCode: string;
    availStatusMessages: RateTigerAvailStatusMessageUpdate[];
  };
}

// ─── RESPONSE ──────────────────────────────────────────

export interface RateTigerInventoryUpdateRS {
  otaHotelAvailNotifRS: {
    hotelCode: string;
    requestId: string;
    success: string;
    timeStamp: string;
  };
}

// ─── INTERNAL ──────────────────────────────────────────

export interface InventoryUpsertParams {
  propertyCode: string;
  roomTypeCode: string;
  ratePlanCode: string;
  date: Date;
  bookingLimit?: number;
  isSaleStopped?: boolean;
  isClosedToArrival?: boolean;
  isClosedToDeparture?: boolean;
  minAdvanceBookingDays?: number;
  maxAdvanceBookingDays?: number;
  minLos?: number;
  maxLos?: number;
}