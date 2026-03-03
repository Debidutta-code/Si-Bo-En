import { ICreationLoyality } from "./creation-loyality.types";

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
}
export interface IPropertyLoyalityWithLoyality{
    CreationLoyaltyConfig:ICreationLoyality;
}