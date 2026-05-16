export interface IPropertyAddressLocaleBlock {
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  state?: string;
  city?: string;
  location?: string;
  landmark?: string;
}
export type UpsertPropertyAddressTranslationPayload = Record<string, Partial<IPropertyAddressLocaleBlock>>;
