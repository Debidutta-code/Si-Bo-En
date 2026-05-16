export interface ILoyaltyConditionLocaleBlock {
    text?: string;
}

export type UpsertLoyaltyConditionTranslationPayload = Record<string, Partial<ILoyaltyConditionLocaleBlock>>;

export type LoyaltyConditionTranslationsResponse = Record<string, ILoyaltyConditionLocaleBlock>;

export interface ILoyaltySpecialConditionLocaleBlock {
    title?: string;
    subTitle?: string;
}

export type UpsertLoyaltySpecialConditionTranslationPayload = Record<string, Partial<ILoyaltySpecialConditionLocaleBlock>>;

export type LoyaltySpecialConditionTranslationsResponse = Record<string, ILoyaltySpecialConditionLocaleBlock>;
