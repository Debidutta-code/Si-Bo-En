

import type { IAdvanceLoyaltyprogram, IloyaltyProgram } from "./loyality-program.interface";
import type { ILoyalityCondition, ILoyalitySpecialCondition } from "./loyality-condition.interface";
import type { IPropertyLoyaltyConfig } from "./property-loyality.interface";
import type { ILoyaltyField } from "./loyality-field.interface";
import type { CurrencyCode } from "@/pages/agency/interfaces";
import type { DiscountType } from "@/pages/promocode/interfaces";
export interface ICCreationLoyality {
      creationId: string
      loyaltyDiscountType: DiscountType;
      discountValue: number;
      currencyCode: CurrencyCode | null;
}
export interface IUCreationLoyalty {
      loyaltyDiscountType: DiscountType;
      discountValue: number;
      currencyCode: CurrencyCode | null;
}
export interface ICreationLoyality extends ICCreationLoyality {
      id: string;
      BasicLoyaltyProgram: IloyaltyProgram|null;
      AdvanceLoyaltyProgram: IAdvanceLoyaltyprogram|null;
      loyaltyAdvanceProgram: ILoyalityCondition|null;
      loyaltySpecialCondition: ILoyalitySpecialCondition|null;
      LoyaltyProgramFieldConfig: ILoyaltyField[];
}
export interface ICreationLoyalityWithProperty{
      PropertyLoyaltyConfig: IPropertyLoyaltyConfig[]|null;
}