export interface ICLoyalityLevels {
    level: number;
    discountPercentage: number;
    noOfReservations: number;
    creationLoyaltyConfigId: string;
}
export interface ILoyalityLevels extends ICLoyalityLevels {
    id: string;
}