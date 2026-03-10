import { IRatePlan, IRoom } from "../../customizable-deal/interfaces";
import { CurrencyCode } from "../../../tax-system/interfaces/tourist-tax.type";

export interface IRoomInput {
  id: string;
  type: string;
}

export interface IRatePlanInput {
  id: string;
  code: string;
}
export type restrictionTypeAction= "increase" | "decrease";
export interface IGeoRatePlanInput {
  propertyId: string;
  rooms: IRoomInput[];
  ratePlans: IRatePlanInput[];
  restrictionType: geoRestrictionType;
  restrictionValue: number | null;
  currencyCode: CurrencyCode;
  countryCode: string[];
  isActive: boolean;
restrictionTypeAction:restrictionTypeAction
}

// This is for INDIVIDUAL record creation (used internally)
export interface IGeoRatePlanCreate {
  propertyId: string;
  roomId: string|null;
  roomType: string|null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue: number | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  restrictionTypeAction:restrictionTypeAction|null


}
export interface IGeoRatePlanWithoutRatePlan{
  id: string;
  propertyId: string;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue: number | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  createdAt: Date;
  restrictionTypeAction:restrictionTypeAction|null
}


export interface IGeoRatePlan {
  id: string;
  propertyId: string;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue: number | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  createdAt: Date;
  room:IRoom|null;
  ratePlan:IRatePlan;
  restrictionTypeAction:restrictionTypeAction|null


}

export type geoRestrictionType = "percentage" | "fixed" | "restricted";

export interface IGeoRatePlanFilter {
  propertyId?: string;
  roomTypeCode?: string;
  ratePlanCode?: string;
  countryCode?: string;
  isActive?: boolean;
}

// export interface IBulkCreateResponse {
//   totalCreated: number;
//   createdRecords: any[];
//   summary: {
//     totalRooms: number;
//     totalRatePlans: number;
//     totalCombinations: number;
//   };
// }