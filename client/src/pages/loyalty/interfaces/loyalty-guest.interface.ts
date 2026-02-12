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
  userIdentityCardType?: string | null;
  identityCardNumber?: string | null;
  identityCardImage?: string | null;
}

export interface IGuests extends ICGuest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICloyalityGuests{
    creationLoyaltyConfigId:string;
    propertyId:string;
    propertyCode:string;
    guestId:string;
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
    guest?:IGuests;
    metaData:JSON
    
}