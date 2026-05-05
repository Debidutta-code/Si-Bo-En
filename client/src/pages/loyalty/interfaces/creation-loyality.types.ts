import type { IAdvanceLoyaltyprogram, IloyaltyProgram } from "./loyality-program.types";
import type { ILoyalityCondition, ILoyalitySpecialCondition } from "./loyality-condition.types";
import type { IPropertyLoyaltyConfig } from "./property-loyality.types";
import type { ILoyaltyField } from "./loyality-field.types";
import type { DiscountType } from "@/pages/tax-system/interface";
import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
export interface ICCreationLoyality {
      creationId: string
      loyaltyDiscountType: DiscountType;
      discountValue: number;
      currencyCode: CurrencyCode | null;
}
export interface ITCreationLoyality extends ICCreationLoyality {
      id: string;
}
export interface IUCreationLoyalty {
      loyaltyDiscountType: DiscountType;
      discountValue: number;
      currencyCode: CurrencyCode | null;
}
export interface ICreationLoyality extends ICCreationLoyality {
      id: string;
      AdvanceLoyaltyProgram: IAdvanceLoyaltyprogram | null;
      BasicLoyaltyProgram: IloyaltyProgram | null;
      loyaltyConditions: ILoyalityCondition[] | null;
      LoyaltyProgramFieldConfig: ILoyaltyField[] | null;
      loyaltySpecialConditions: ILoyalitySpecialCondition[] | null;
}
export interface ICreationLoyalityWithProperty{
      PropertyLoyaltyConfig: IPropertyLoyaltyConfig[]|null;
}