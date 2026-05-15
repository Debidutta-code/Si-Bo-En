import {
  PropertyAddressTranslation,
  IPropertyAddressTranslation,
  ILocaleBlock,
} from '../../models/property/property-address.model';

export class PropertyAddressTranslationRepository {
  public async upsert(
    propertyAddressId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IPropertyAddressTranslation> {
    try {
      return await PropertyAddressTranslation.upsert(propertyAddressId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert property address translation'
      );
    }
  }

  public async getTranslated(
    propertyAddressId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await PropertyAddressTranslation.getTranslated(propertyAddressId, locale);
    } catch (error) {
      throw new Error('Failed to get property address translation');
    }
  }

  public async getAllTranslations(
    propertyAddressId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await PropertyAddressTranslation.getAllTranslations(propertyAddressId);
    } catch (error) {
      throw new Error('Failed to get all property address translations');
    }
  }

  public async deleteLocale(
    propertyAddressId: string,
    locale: string
  ): Promise<IPropertyAddressTranslation | null> {
    try {
      return await PropertyAddressTranslation.deleteLocale(propertyAddressId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete property address translation locale'
      );
    }
  }
}
