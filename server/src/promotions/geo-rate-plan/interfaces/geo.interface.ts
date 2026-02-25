import { Decimal } from "@prisma/client/runtime/library";
import { IProperty } from "../../../agency/types";
import { IRatePlan, IRoom } from "../../customizable-deal/interfaces";

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
  restrictionValue: Decimal | null;
  currencyCode: CurrencyCode;
  countryCode: string[];
  isActive: boolean;
  isAutoApplied: boolean;
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
  restrictionValue: Decimal | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  isAutoApplied: boolean;
  restrictionTypeAction?:restrictionTypeAction


}
export interface IGeoRatePlanWithoutRatePlan{
  id: string;
  propertyId: string;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue: Decimal | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  createdAt: Date;
  isAutoApplied: boolean;
  restrictionTypeAction:restrictionTypeAction
}


export interface IGeoRatePlan {
  id: string;
  propertyId: string;
  roomId: string | null;
  roomType: string | null;
  ratePlanId: string;
  ratePlanCode: string;
  restrictionType: geoRestrictionType;
  restrictionValue: Decimal | null;
  currencyCode: CurrencyCode | null;
  countryCode: string[];
  isActive: boolean;
  createdAt: Date;
  isAutoApplied: boolean;
  property:IProperty;
  room:IRoom|null;
  ratePlan:IRatePlan;
  restrictionTypeAction:restrictionTypeAction


}

export type geoRestrictionType = "percentage" | "fixed" | "restricted";
export type CurrencyCode = "USD" | "EUR" | "INR";

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