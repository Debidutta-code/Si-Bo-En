// export interface RestrictionPayload {
//   propertyCode: string;
//   restrictionType: 'CTA' | 'CTD';
//   dates: string[]; // Array of dates in YYYY-MM-DD format
//   notes: string;
//   isActive: boolean;
//   roomRestrictions: {
//     roomTypeCode: string;
//     ratePlanCodes: string[]; // Empty array = all rate plans
//   }[];
//   globalRatePlans: string[]; // For property-wide restrictions
// }
// export interface LengthOfStayPayload {
//   hotelCode: string;
//   roomTypeCode: string;
//   ratePlanCode?: string; // Optional - if not provided, it's room type level
//   startDate: string;
//   endDate: string;
//   minLengthOfStay?: number;
//   maxLengthOfStay?: number;
// }

// export interface RemoveRestrictionPayload {
//   propertyCode: string;
//   restrictionType: 'CTA' | 'CTD';
//   dates: string[]; // ✅ Array of dates to remove
//   roomRestrictions?: { // ✅ Optional - for room-specific removal
//     roomTypeCode: string;
//     ratePlanCodes: string[];
//   }[];
//   globalRatePlans?: string[]; // ✅ Optional - for property-wide removal
//   isActive: boolean; // Should be false when removing
//   notes: string;
// }
// export interface UpdateRestrictionPayload {
//   hotelCode: string;
//   invTypeCode: string[];
//   dateRestrictionList: {
//     date: string;
//     cta?: boolean;
//     ctd?: boolean;
//     minLengthOfStay?: number;
//     maxLengthOfStay?: number;
//   }[];
// }