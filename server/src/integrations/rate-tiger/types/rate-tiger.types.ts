// types/ratetiger.types.ts

export interface RateTigerAuthRequest {
  "API-Key": string;
  partner_id: string;
}

export interface RateTigerAuthResponse {
  access_token: string;
  expires_in: string; // ISO 8601 timestamp
}

export interface RateTigerOTAHotelAvailRQ {
  otaHotelAvailRQ: {
    hotelCode: string;
    requestId: string;
    timeStamp: string;
  };
}

export interface RateTigerRatePlan {
  effectiveDate: string;
  expireDate: string;
  ratePlanCode: string;
  ratePlanName: string;
  ratePlanType?: string;
  roomPricingType?: string;
}

export interface RateTigerRoomType {
  defaultOccupancy: string;
  maxAdultOccupancy: string;
  minAdultOccupancy: string;
  roomName: string;
  roomTypeCode: string;
}

export interface RateTigerRoomRate {
  ratePlanCode: string;
  roomTypeCode: string;
  status: "Active" | "inActive";
}

export interface RateTigerOTAHotelAvailRS {
  otaHotelAvailRS: {
    hotelCode: string;
    requestId: string;
    roomStays: {
      ratePlans: RateTigerRatePlan[];
      roomRates: RateTigerRoomRate[];
      roomTypes: RateTigerRoomType[];
    };
    success: string;
    timeStamp: string;
  };
}

// Internal mapping types
export interface RateTigerMappingData {
  propertyCode: string;
  ratePlans: Array<{
    ratePlanCode: string;
    ratePlanName: string;
    effectiveDate: Date | null;
    expireDate: Date | null;
  }>;
  roomTypes: Array<{
    roomTypeCode: string;
    roomTypeName: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
  }>;
  roomRates: Array<{
    ratePlanCode: string;
    roomTypeCode: string;
    status: "Active" | "inActive";
  }>;
}

export interface RateTigerTokenPayload {
  partnerId: string;
  apiKey: string;
  exp: number;
  iat: number;
}