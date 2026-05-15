import {
  PropertyLoyaltyConfigTranslation,
  IPropertyLoyaltyConfigTranslation,
  ILocaleBlock,
} from '../../../models/features/loyalty/property-loyalty.model';

export class PropertyLoyaltyConfigTranslationRepository {
  public async upsert(
    propertyLoyaltyConfigId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IPropertyLoyaltyConfigTranslation> {
    try {
      return await PropertyLoyaltyConfigTranslation.upsert(propertyLoyaltyConfigId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert property loyalty config translation'
      );
    }
  }

  public async getTranslated(
    propertyLoyaltyConfigId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await PropertyLoyaltyConfigTranslation.getTranslated(propertyLoyaltyConfigId, locale);
    } catch (error) {
      throw new Error('Failed to get property loyalty config translation');
    }
  }

  public async getAllTranslations(
    propertyLoyaltyConfigId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await PropertyLoyaltyConfigTranslation.getAllTranslations(propertyLoyaltyConfigId);
    } catch (error) {
      throw new Error('Failed to get all property loyalty config translations');
    }
  }

  public async deleteLocale(
    propertyLoyaltyConfigId: string,
    locale: string
  ): Promise<IPropertyLoyaltyConfigTranslation | null> {
    try {
      return await PropertyLoyaltyConfigTranslation.deleteLocale(propertyLoyaltyConfigId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete property loyalty config translation locale'
      );
    }
  }
}
