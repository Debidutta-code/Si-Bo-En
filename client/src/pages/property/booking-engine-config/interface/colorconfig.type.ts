// interfaces/types.ts

export interface BookingEngineConfig {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bannerImage: string;
  logo: string;
}

export interface BookingEngineData {
  id: string;
  propertyId: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  buttonTextColor: string;
  bannerImage: string;
  logo: string;
}

export interface BookingEngineResponse {
  success: boolean;
  message: string;
  data?: BookingEngineData;
  timestamp: string;
}