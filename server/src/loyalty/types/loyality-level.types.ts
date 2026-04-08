export interface ICLoyalityLevels {
    level: number;
    discountPercentage: number;
    noOfReservations: number;
    propertyLoyaltyConfigId: string;
}
export interface ILoyalityLevels extends ICLoyalityLevels {
    id: string;
}