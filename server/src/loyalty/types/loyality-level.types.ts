export interface ICLoyalityLevels {
    level: number;
    discountPercentage: number;
    creationLoyaltyConfigId: string;
}
export interface ILoyalityLevels extends ICLoyalityLevels {
    id: string;
}
