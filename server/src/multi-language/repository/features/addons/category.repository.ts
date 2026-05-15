import {
  AddonCategoryTranslation,
  IAddonCategoryTranslation,
  ILocaleBlock,
} from '../../../models/features/addons/category.model';

export class AddonCategoryTranslationRepository {
  public async upsert(
    addonCategoryId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IAddonCategoryTranslation> {
    try {
      return await AddonCategoryTranslation.upsert(addonCategoryId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert addon category translation'
      );
    }
  }

  public async getTranslated(
    addonCategoryId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await AddonCategoryTranslation.getTranslated(addonCategoryId, locale);
    } catch (error) {
      throw new Error('Failed to get addon category translation');
    }
  }

  public async getAllTranslations(
    addonCategoryId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await AddonCategoryTranslation.getAllTranslations(addonCategoryId);
    } catch (error) {
      throw new Error('Failed to get all addon category translations');
    }
  }

  public async deleteLocale(
    addonCategoryId: string,
    locale: string
  ): Promise<IAddonCategoryTranslation | null> {
    try {
      return await AddonCategoryTranslation.deleteLocale(addonCategoryId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete addon category translation locale'
      );
    }
  }
}
