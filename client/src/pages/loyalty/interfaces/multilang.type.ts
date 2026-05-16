// ─────────────────────────────────────────────────────────────────────────────
// Loyalty Conditions
// ─────────────────────────────────────────────────────────────────────────────
export interface ILoyaltyConditionsLocaleBlock {
  text?: string;
}
export type UpsertLoyaltyConditionsTranslationPayload = Record<string, Partial<ILoyaltyConditionsLocaleBlock>>;

// ─────────────────────────────────────────────────────────────────────────────
// Loyalty Special Conditions
// ─────────────────────────────────────────────────────────────────────────────
export interface ILoyaltySpecialConditionLocaleBlock {
  title?: string;
  subTitle?: string;
}
export type UpsertLoyaltySpecialConditionTranslationPayload = Record<string, Partial<ILoyaltySpecialConditionLocaleBlock>>;
