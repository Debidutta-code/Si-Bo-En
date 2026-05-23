import type { ICreationLoyality } from "./creation-loyality.types";

export interface ICPropertyLoyaltyConfig {
    creationLoyaltyConfigId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    loyalityConfigLogo: string | null;

}
export interface IPropertyLoyaltyConfig extends ICPropertyLoyaltyConfig {
    id: string;
    isActive: boolean;
    _translations: {
        fieldName: string;
    }

}
export interface IPropertyLoyalityWithLoyality {
    CreationLoyaltyConfig: ICreationLoyality;
}