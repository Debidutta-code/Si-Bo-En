import { DiscountType } from '../../promocode/types';
import {
    IAdvanceLoyaltyprogram,
    IloyaltyProgram,
} from './loyality-program.types';
import {
    ILoyalityCondition,
    ILoyalitySpecialCondition,
} from './loyality-condition.types';
import { IPropertyLoyaltyConfig } from './property-loyality.types';
import { ILoyaltyField } from './loyality-field.types';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
export interface ICCreationLoyality {
    creationId: string;
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
export interface ICreationLoyalityWithProperty extends ICreationLoyality {}
