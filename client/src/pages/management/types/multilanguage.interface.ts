// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyCategory
// ─────────────────────────────────────────────────────────────────────────────
export interface IMasterPropertyCategoryLocaleBlock {
  categoryName?: string;
  categoryDescription?: string;
}
export type UpsertMasterPropertyCategoryTranslationPayload = Record<string, Partial<IMasterPropertyCategoryLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// MasterPropertyType
// ─────────────────────────────────────────────────────────────────────────────
export interface IMasterPropertyTypeLocaleBlock {
  propertyTypeName?: string;
  propertyTypeDescription?: string;
}
export type UpsertMasterPropertyTypeTranslationPayload = Record<string, Partial<IMasterPropertyTypeLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// MasterAmenity
// ─────────────────────────────────────────────────────────────────────────────
export interface IMasterAmenityLocaleBlock {
  amenityName?: string;
  description?: string;
}
export type UpsertMasterAmenityTranslationPayload = Record<string, Partial<IMasterAmenityLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// MasterRoomView
// ─────────────────────────────────────────────────────────────────────────────
export interface IMasterRoomViewLocaleBlock {
  viewName?: string;
}
export type UpsertMasterRoomViewTranslationPayload = Record<string, Partial<IMasterRoomViewLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// MasterIntegration
// ─────────────────────────────────────────────────────────────────────────────
export interface IMasterIntegrationLocaleBlock {
  name?: string;
}
export type UpsertMasterIntegrationTranslationPayload = Record<string, Partial<IMasterIntegrationLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// MasterLoyaltyRegistrationField
// ─────────────────────────────────────────────────────────────────────────────
export interface IMasterLoyaltyRegistrationFieldLocaleBlock {
  fieldName?: string;
}
export type UpsertMasterLoyaltyRegistrationFieldTranslationPayload = Record<string, Partial<IMasterLoyaltyRegistrationFieldLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// SpaCategory
// ─────────────────────────────────────────────────────────────────────────────
export interface ISpaCategoryLocaleBlock {
  name?: string;
}
export type UpsertSpaCategoryTranslationPayload = Record<string, Partial<ISpaCategoryLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// SpaSubCategory
// ─────────────────────────────────────────────────────────────────────────────
export interface ISpaSubCategoryLocaleBlock {
  name?: string;
}
export type UpsertSpaSubCategoryTranslationPayload = Record<string, Partial<ISpaSubCategoryLocaleBlock>>;
