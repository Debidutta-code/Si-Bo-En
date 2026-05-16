export interface IPropertyLocaleBlock {
  propertyName?: string;
  description?: string;
}
export type UpsertPropertyTranslationPayload = Record<string, Partial<IPropertyLocaleBlock>>;
