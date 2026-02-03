import { CurrencyCode } from "../../pms/frontoffice/payment/types"
import { DiscountType } from "../../promocode/types"

import { IProperty } from "../../agency/types";
import { IAdvanceLoyaltyprogram, IloyaltyProgram } from "./loyality-program.types";
import { ILoyalityCondition, ILoyalitySpecialCondition } from "./loyality-condition.types";
import { IPropertyLoyaltyConfig } from "./property-loyality.types";
import { ILoyaltyField } from "./loyality-field.types";
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