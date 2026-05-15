import {
  SpaTranslation,
  ISpaTranslation,
  ILocaleBlock,
} from '../../../models/features/spa/spa.model';

export class SpaTranslationRepository {
  public async upsert(
    spaId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<ISpaTranslation> {
    try {
      return await SpaTranslation.upsert(spaId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert spa translation'
      );
    }
  }

  public async getTranslated(
    spaId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await SpaTranslation.getTranslated(spaId, locale);
    } catch (error) {
      throw new Error('Failed to get spa translation');
    }
  }

  public async getAllTranslations(
    spaId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await SpaTranslation.getAllTranslations(spaId);
    } catch (error) {
      throw new Error('Failed to get all spa translations');
    }
  }

  public async deleteLocale(
    spaId: string,
    locale: string
  ): Promise<ISpaTranslation | null> {
    try {
      return await SpaTranslation.deleteLocale(spaId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete spa translation locale'
      );
    }
  }
}
