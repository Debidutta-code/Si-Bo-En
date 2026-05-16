export interface IPromotionLocaleBlock {
    promotionName?: string;
}

export type UpsertPromotionTranslationPayload = Record<string, Partial<IPromotionLocaleBlock>>;
export type PromotionTranslationsResponse = Record<string, IPromotionLocaleBlock>;
