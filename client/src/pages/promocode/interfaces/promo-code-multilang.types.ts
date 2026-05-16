export interface IPromoCodeLocaleBlock {
    name?: string;
    description?: string;
}

export type UpsertPromoCodeTranslationPayload = Record<string, Partial<IPromoCodeLocaleBlock>>;

export type PromoCodeTranslationsResponse = Record<string, IPromoCodeLocaleBlock>;
