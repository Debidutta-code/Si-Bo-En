import { IGuests } from "../../pms/frontoffice/reservation/types";
import { ILoyalityLevels } from "./loyality-level.types";

export interface ICloyalityGuests{
    guestId:string|null;
    guestEmail:string;
    password:string;
    metaData:any;
    guestLevel?:number;
}
export interface ICCloyalityGuests{
    guestId:string|null;
    guestEmail:string;
    password:string;
    metaData:any;
    
}
export interface ILoyalityGuests extends ICloyalityGuests{
id:string;
createdAt:Date;
}
export interface ILoyalityGuestsWDP extends ILoyalityGuests{
    
    guest:IGuests|null;
    
}
export interface IGetLoyaltyGuestsForCreation{
    LoyalityGuest:ILoyalityGuestsWDP|null
    CreationLoyaltyConfig:{
        LoyalityLevels:ILoyalityLevels[]
    }
}