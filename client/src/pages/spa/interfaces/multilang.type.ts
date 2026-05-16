// ─────────────────────────────────────────────────────────────────────────────
// Spa Translation
// ─────────────────────────────────────────────────────────────────────────────
export interface ISpaLocaleBlock {
  name?: string;
  description?: string;
  location?: string;
}
export type UpsertSpaTranslationPayload = Record<string, Partial<ISpaLocaleBlock>>;
