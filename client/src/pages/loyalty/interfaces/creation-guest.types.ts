import type { ILoyalityGuests, ILoyalityGuestsWDP } from ".";

export interface ICCreationLoyaltyGuest {
    loyalityGuestId: string;
    propertyId: string;
    creationLoyaltyConfigId: string;
    propertyCode: string;
}
export interface ICreationLoyaltyGuest extends ICCreationLoyaltyGuest {
    id:string;
}
export interface ICreationLoyaltyGuestWG extends ICreationLoyaltyGuest {
    LoyalityGuest:ILoyalityGuests
}
export interface ICreationLoyaltyGuestWDP extends ICreationLoyaltyGuest {
    LoyalityGuest:ILoyalityGuestsWDP;
    Property:{
        id:string;
        propertyName:string;
        propertyCode:string;
    };
}