import {
  SpaCategoryTranslation,
  ISpaCategoryTranslation,
  ISpaCategoryLocaleBlock,
  SpaSubCategoryTranslation,
  ISpaSubCategoryTranslation,
  ISpaSubCategoryLocaleBlock,
} from '../../models/masters/spa-type.model';

export class SpaCategoryTranslationRepository {
  public async upsert(
    spaCategoryId: string,
    localeData: Partial<Record<string, Partial<ISpaCategoryLocaleBlock>>>
  ): Promise<ISpaCategoryTranslation> {
    try {
      return await SpaCategoryTranslation.upsert(spaCategoryId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert spa category translation'
      );
    }
  }

  public async getTranslated(
    spaCategoryId: string,
    locale: string = 'en'
  ): Promise<ISpaCategoryLocaleBlock | null> {
    try {
      return await SpaCategoryTranslation.getTranslated(spaCategoryId, locale);
    } catch (error) {
      throw new Error('Failed to get spa category translation');
    }
  }

  public async getAllTranslations(
    spaCategoryId: string
  ): Promise<Record<string, ISpaCategoryLocaleBlock> | null> {
    try {
      return await SpaCategoryTranslation.getAllTranslations(spaCategoryId);
    } catch (error) {
      throw new Error('Failed to get all spa category translations');
    }
  }

  public async deleteLocale(
    spaCategoryId: string,
    locale: string
  ): Promise<ISpaCategoryTranslation | null> {
    try {
      return await SpaCategoryTranslation.deleteLocale(spaCategoryId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete spa category translation locale'
      );
    }
  }
}

export class SpaSubCategoryTranslationRepository {
  public async upsert(
    spaSubCategoryId: string,
    localeData: Partial<Record<string, Partial<ISpaSubCategoryLocaleBlock>>>
  ): Promise<ISpaSubCategoryTranslation> {
    try {
      return await SpaSubCategoryTranslation.upsert(spaSubCategoryId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert spa sub-category translation'
      );
    }
  }

  public async getTranslated(
    spaSubCategoryId: string,
    locale: string = 'en'
  ): Promise<ISpaSubCategoryLocaleBlock | null> {
    try {
      return await SpaSubCategoryTranslation.getTranslated(spaSubCategoryId, locale);
    } catch (error) {
      throw new Error('Failed to get spa sub-category translation');
    }
  }

  public async getAllTranslations(
    spaSubCategoryId: string
  ): Promise<Record<string, ISpaSubCategoryLocaleBlock> | null> {
    try {
      return await SpaSubCategoryTranslation.getAllTranslations(spaSubCategoryId);
    } catch (error) {
      throw new Error('Failed to get all spa sub-category translations');
    }
  }

  public async deleteLocale(
    spaSubCategoryId: string,
    locale: string
  ): Promise<ISpaSubCategoryTranslation | null> {
    try {
      return await SpaSubCategoryTranslation.deleteLocale(spaSubCategoryId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete spa sub-category translation locale'
      );
    }
  }
}
