import { IGuests } from "../../pms/frontoffice/reservation/types";

export interface ICloyalityGuests{
    creationLoyaltyConfigId:string;
    propertyId:string;
    propertyCode:string;
    guestId:string|null;
    guestEmail:string;
    metaData:any;
}
export interface ILoyalityGuests extends ICloyalityGuests{
id:string;
createdAt:Date;
}
export interface ILoyalityGuestsWDP extends ILoyalityGuests{
    property:{
        id:string;
        propertyName:string;
        propertyCode:string;
    };
    guest:IGuests|null;
    
}