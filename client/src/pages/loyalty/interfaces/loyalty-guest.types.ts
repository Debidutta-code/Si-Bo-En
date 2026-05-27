import type { ILoyalityLevels } from ".";



export interface IGetLoyaltyGuestsForCreation{
    CreationLoyaltyConfig:{
        LoyalityLevels:ILoyalityLevels[]
    }
        metaData:any;
    guestLevel:number;
    Customer:{
        id:string
        firstName:string;
        lastName:string;
        email:string
    }

}