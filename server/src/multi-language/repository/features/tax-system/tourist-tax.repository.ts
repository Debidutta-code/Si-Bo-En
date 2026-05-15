import {
  TouristTaxTranslation,
  ITouristTaxTranslation,
  ITouristTaxLocaleBlock,
} from '../../../models/features/tax-system/tourist-tax.model';

export class TouristTaxTranslationRepository {
  public async upsert(
    touristTaxId: string,
    localeData: Partial<Record<string, Partial<ITouristTaxLocaleBlock>>>
  ): Promise<ITouristTaxTranslation> {
    try {
      return await TouristTaxTranslation.upsert(touristTaxId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert tourist tax translation'
      );
    }
  }

  public async getTranslated(
    touristTaxId: string,
    locale: string = 'en'
  ): Promise<ITouristTaxLocaleBlock | null> {
    try {
      return await TouristTaxTranslation.getTranslated(touristTaxId, locale);
    } catch (error) {
      throw new Error('Failed to get tourist tax translation');
    }
  }

  public async getAllTranslations(
    touristTaxId: string
  ): Promise<Record<string, ITouristTaxLocaleBlock> | null> {
    try {
      return await TouristTaxTranslation.getAllTranslations(touristTaxId);
    } catch (error) {
      throw new Error('Failed to get all tourist tax translations');
    }
  }

  public async deleteLocale(
    touristTaxId: string,
    locale: string
  ): Promise<ITouristTaxTranslation | null> {
    try {
      return await TouristTaxTranslation.deleteLocale(touristTaxId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete tourist tax translation locale'
      );
    }
  }
}
