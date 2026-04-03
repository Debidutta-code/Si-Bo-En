import type { ILoyalityLevels } from ".";

export interface ICGuest {
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  propertyId: string;
  userType: "adult" | "child" | "infant";
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  userIdentityCardType: string | null;
  identityCardNumber: string | null;
  identityCardImage: string | null;
}

export interface IGuests extends ICGuest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
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