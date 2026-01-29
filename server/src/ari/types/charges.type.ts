export interface maxOccupancy {
  total: number;
  adults: number;
  children: number;
}
export type qualifyingAgeCode="10"|"8"|"5"

export interface IBaseGuestAmounts{
    noOfGuests: number;
    amount: number;
}
export interface IAdditionalGuestAmount{
    ageCode: qualifyingAgeCode;
    amount: number;
}
export interface ICharges {
  propertyCode: string;
  ratePlanCode: string;
  roomTypeCode: string;
  ratePlanName:string;
  roomTypeName:string;
  baseGuestAmounts: IBaseGuestAmounts[];
  additionalGuestAmounts: IAdditionalGuestAmount[];
  currencyCode: string;
  date: Date;
  
}
