import {
  PropertyTranslation,
  IPropertyTranslation,
  ILocaleBlock,
} from '../../models/property/property.model';

export class PropertyTranslationRepository {
  public async upsert(
    propertyId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IPropertyTranslation> {
    try {
      return await PropertyTranslation.upsert(propertyId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert property translation'
      );
    }
  }

  public async getTranslated(
    propertyId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await PropertyTranslation.getTranslated(propertyId, locale);
    } catch (error) {
      throw new Error('Failed to get property translation');
    }
  }

  public async getAllTranslations(
    propertyId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await PropertyTranslation.getAllTranslations(propertyId);
    } catch (error) {
      throw new Error('Failed to get all property translations');
    }
  }

  public async deleteLocale(
    propertyId: string,
    locale: string
  ): Promise<IPropertyTranslation | null> {
    try {
      return await PropertyTranslation.deleteLocale(propertyId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete property translation locale'
      );
    }
  }
}
