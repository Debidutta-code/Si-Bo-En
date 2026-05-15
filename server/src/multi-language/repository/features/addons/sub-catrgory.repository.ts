import {
  AddonSubCategoryTranslation,
  IAddonSubCategoryTranslation,
  ILocaleBlock,
} from '../../../models/features/addons/sub-catrgory.model';

export class AddonSubCategoryTranslationRepository {
  public async upsert(
    addonSubCategoryId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IAddonSubCategoryTranslation> {
    try {
      return await AddonSubCategoryTranslation.upsert(addonSubCategoryId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert addon sub-category translation'
      );
    }
  }

  public async getTranslated(
    addonSubCategoryId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await AddonSubCategoryTranslation.getTranslated(addonSubCategoryId, locale);
    } catch (error) {
      throw new Error('Failed to get addon sub-category translation');
    }
  }

  public async getAllTranslations(
    addonSubCategoryId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await AddonSubCategoryTranslation.getAllTranslations(addonSubCategoryId);
    } catch (error) {
      throw new Error('Failed to get all addon sub-category translations');
    }
  }

  public async deleteLocale(
    addonSubCategoryId: string,
    locale: string
  ): Promise<IAddonSubCategoryTranslation | null> {
    try {
      return await AddonSubCategoryTranslation.deleteLocale(addonSubCategoryId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete addon sub-category translation locale'
      );
    }
  }
}
