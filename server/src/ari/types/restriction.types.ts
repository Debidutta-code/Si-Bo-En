// src/modules/restrictions/types/restriction.types.ts

export type RestrictionType = 'CTA' | 'CTD';

export interface RoomRestriction {
    roomTypeCode: string;
    ratePlanCodes: string[];
}

export interface IRestrictionRequest {
    propertyCode: string;
    restrictionType: RestrictionType;
    dates: string[];
    notes?: string;
    isActive: boolean;
    roomRestrictions: RoomRestriction[];
    globalRatePlans: string[];
}
