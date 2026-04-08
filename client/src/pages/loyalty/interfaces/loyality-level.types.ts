export interface ICLoyalityLevels{
    level:number;
    discountPercentage:number;
    loyaltyProgramId:string;
}
export interface ILoyalityLevels extends ICLoyalityLevels {
    id:string;
}