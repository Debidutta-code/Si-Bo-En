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