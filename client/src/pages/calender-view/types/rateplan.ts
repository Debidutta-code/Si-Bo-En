// // ============================================
// // TYPES - app/inventory/types/rateplan.ts
// // ============================================

// export interface RatePlanData {
//   ratePlanCode: string;
//   minLengthOfStay: number;
//   maxLengthOfStay: number;
//   cta: boolean;
//   ctd: boolean;
//   prices: RoomTypePricing[];
// }

// export interface RoomTypePricing {
//   invTypeCode: string;
//   price?: number | string;
//   currencyCode: string;
//   sellStatus: "open" | "close";
//   cta?: boolean;
//   ctd?: boolean;
  
//   // ✅ Base guest amounts WITH COMMISSION
//   baseByGuestAmts?: {
//     numberOfGuests: number;
//     amountBeforeTax: number;
//     commissionAmount?: number;        // ✅ Added
//     amountAfterCommission?: number;   // ✅ Added
//     _id?: string;
//   }[];
  
//   // ✅ Additional guest amounts WITH COMMISSION
//   additionalGuestAmounts?: {
//     ageQualifyingCode: string;
//     amount: number;
//     commissionAmount?: number;        // ✅ Added
//     amountAfterCommission?: number;   // ✅ Added
//     _id?: string;
//   }[];
// }

// export interface RatePlanPushPayload {
//   hotelCode: string;
//   invTypeCode: string;
//   ratePlanCode: string;
//   isOccupancyBased: boolean;
//   dateDataList: {
//     date: string;
//     price?: number;
//     baseGuestAmounts?: {
//       numberOfGuests: number;
//       amountBeforeTax: number;
//       commissionAmount?: number;        // ✅ Added
//       amountAfterCommission?: number;   // ✅ Added
//     }[];
//     additionalGuestAmounts?: {
//       ageQualifyingCode: string;
//       amount: number;
//       commissionAmount?: number;        // ✅ Added
//       amountAfterCommission?: number;   // ✅ Added
//     }[];
//   }[];
// }