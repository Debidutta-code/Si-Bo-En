export interface ICLoyalityLevels{
    level:number;
    discountPercentage:number;
    creationLoyaltyConfigId:string;
    noOfReservations:number;
}
export interface ILoyalityLevels extends ICLoyalityLevels {
    id:string;
}