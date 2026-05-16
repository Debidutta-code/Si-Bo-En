export interface IAddonLocaleBlock {
    name?: string;
    description?: string;
}

export type UpsertAddonTranslationPayload = Record<string, Partial<IAddonLocaleBlock>>;
export type AddonTranslationsResponse = Record<string, IAddonLocaleBlock>;

export interface IAddonCategoryLocaleBlock {
    name?: string;
}
export type UpsertAddonCategoryTranslationPayload = Record<string, Partial<IAddonCategoryLocaleBlock>>;
export type AddonCategoryTranslationsResponse = Record<string, IAddonCategoryLocaleBlock>;

export interface IAddonSubCategoryLocaleBlock {
    name?: string;
}
export type UpsertAddonSubCategoryTranslationPayload = Record<string, Partial<IAddonSubCategoryLocaleBlock>>;
export type AddonSubCategoryTranslationsResponse = Record<string, IAddonSubCategoryLocaleBlock>;

export interface IAddonVariantLocaleBlock {
    name?: string;
}
export type UpsertAddonVariantTranslationPayload = Record<string, Partial<IAddonVariantLocaleBlock>>;
export type AddonVariantTranslationsResponse = Record<string, IAddonVariantLocaleBlock>;

// export default IAddonLocaleBlock;
