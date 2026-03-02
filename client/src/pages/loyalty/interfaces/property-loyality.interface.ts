import type { ICreationLoyality } from "./creation-loyality.interface";

export interface ICPropertyLoyaltyConfig {
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    // loyalityConfigLogo: string | null;
    // discountPercentage: number | null;
}
export interface IPropertyLoyaltyConfig extends ICPropertyLoyaltyConfig {
    id: string;
    isActive: boolean;
}
export interface IPropertyLoyalityWithLoyality{
    CreationLoyaltyConfig:ICreationLoyality;
}