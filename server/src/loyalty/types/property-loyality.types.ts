import { ILoyalityLevels } from "./loyality-level.types";

export interface ICPropertyLoyaltyConfig {
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    discountPercentage: number | null;
    loyalityConfigLogo: string | null;
}
export interface IPropertyLoyaltyConfig extends ICPropertyLoyaltyConfig {
    id: string;
    isActive: boolean;
    loyalityLevels?: ILoyalityLevels[];
}
export interface IPropertyLoyalityWithLoyality extends IPropertyLoyaltyConfig {}