import { CurrencyCode } from '../../tax-system/interfaces';
import { ILoyalityLevels } from './loyality-level.types';

export interface ICPropertyLoyaltyConfig {
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    loyalityConfigLogo: string | null;
}
export interface ICreationLoyalityConfig {
    id: string;
    creationId: string;
    loyaltyDiscountType: 'percentage' | 'flat';
    discountValue: number;
    currencyCode: CurrencyCode | null;
    LoyalityLevels?: ILoyalityLevels[];
}

export interface IPropertyLoyaltyConfig extends ICPropertyLoyaltyConfig {
    id: string;
    isActive: boolean;
    CreationLoyaltyConfig?: ICreationLoyalityConfig;
}
export interface IPropertyLoyalityGuest {
    id: string;
    propertyLoyalityId: string;
    customerId: string|null;
}
export interface IPropertyLoyalityWithLoyality extends IPropertyLoyaltyConfig { }

export interface ILoyaltyDiscountData {
    guestLevel: number | null;
    loyalityLevels: ILoyalityLevels[];
    fallback: { value: number; type: 'percentage' | 'flat' } | null;
}
