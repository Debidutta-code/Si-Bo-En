import {
  AddonTranslation,
  IAddonTranslation,
  ILocaleBlock,
} from '../../../models/features/addons/addon.model';

export class AddonTranslationRepository {
  public async upsert(
    addonId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IAddonTranslation> {
    try {
      return await AddonTranslation.upsert(addonId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert addon translation'
      );
    }
  }

  public async getTranslated(
    addonId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await AddonTranslation.getTranslated(addonId, locale);
    } catch (error) {
      throw new Error('Failed to get addon translation');
    }
  }

  public async getAllTranslations(
    addonId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await AddonTranslation.getAllTranslations(addonId);
    } catch (error) {
      throw new Error('Failed to get all addon translations');
    }
  }

  public async deleteLocale(
    addonId: string,
    locale: string
  ): Promise<IAddonTranslation | null> {
    try {
      return await AddonTranslation.deleteLocale(addonId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete addon translation locale'
      );
    }
  }
}
