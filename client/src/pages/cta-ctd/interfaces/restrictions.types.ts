// interfaces/restrictions.types.ts

export type RestrictionType = 'CTA' | 'CTD';

export interface RoomRestriction {
  roomTypeCode: string;
  ratePlanCodes: string[];
}

export interface CreateRestrictionPayload {
  propertyCode: string;
  restrictionType: RestrictionType;
  dates: string[];
  notes?: string;
  isActive: boolean;
  roomRestrictions: RoomRestriction[];
  globalRatePlans: string[];
}

export interface Restriction {
  id: string;
  propertyCode: string;
  ratePlanCode: string;
  ratePlanName: string;
  roomTypeCode: string;
  roomTypeName: string;
  date: string;
  isClosedToArrival: boolean;
  isClosedToDeparture: boolean;
  restrictionNotes: string | null;
}

export interface RoomType {
  id: string;
  roomName: string;
  roomType: string;
  totalRoom: number;
}

export interface RatePlan {
  id: string;
  ratePlanCode: string;
  ratePlanName: string;
  propertyId: string;
  b2bAvailable: boolean;
  b2cAvailable: boolean;
}

export interface RestrictionFilters {
  restrictionType?: RestrictionType|null;
  startDate?: string;
  endDate?: string;
  roomTypeCode?: string|null;
  ratePlanCode?: string|null;
}

export interface LoaderProps {
  isLoading: boolean;
  text: string;
}

