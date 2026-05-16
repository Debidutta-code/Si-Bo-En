export interface ITaxRuleLocaleBlock {
    name?: string;
    description?: string;
}

export type UpsertTaxRuleTranslationPayload = Record<string, Partial<ITaxRuleLocaleBlock>>;
export type TaxRuleTranslationsResponse = Record<string, ITaxRuleLocaleBlock>;

export interface ITaxGroupLocaleBlock {
    name?: string;
}

export type UpsertTaxGroupTranslationPayload = Record<string, Partial<ITaxGroupLocaleBlock>>;
export type TaxGroupTranslationsResponse = Record<string, ITaxGroupLocaleBlock>;

export interface ITouristTaxLocaleBlock {
    name?: string;
}

export type UpsertTouristTaxTranslationPayload = Record<string, Partial<ITouristTaxLocaleBlock>>;
export type TouristTaxTranslationsResponse = Record<string, ITouristTaxLocaleBlock>;
