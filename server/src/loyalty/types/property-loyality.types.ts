import { ICreationLoyality } from "./creation-loyality.types";

export interface ICPropertyLoyaltyConfig {
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
}
export interface IPropertyLoyaltyConfig extends ICPropertyLoyaltyConfig {
    id: string;
    isActive: boolean;
}
export interface IPropertyLoyalityWithLoyality{
    CreationLoyaltyConfig:ICreationLoyality;
}