import {
  AddonVariantTranslation,
  IAddonVariantTranslation,
  ILocaleBlock,
} from '../../../models/features/addons/variant.model';

export class AddonVariantTranslationRepository {
  public async upsert(
    addonVariantId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IAddonVariantTranslation> {
    try {
      return await AddonVariantTranslation.upsert(addonVariantId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert addon variant translation'
      );
    }
  }

  public async getTranslated(
    addonVariantId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await AddonVariantTranslation.getTranslated(addonVariantId, locale);
    } catch (error) {
      throw new Error('Failed to get addon variant translation');
    }
  }

  public async getAllTranslations(
    addonVariantId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await AddonVariantTranslation.getAllTranslations(addonVariantId);
    } catch (error) {
      throw new Error('Failed to get all addon variant translations');
    }
  }

  public async deleteLocale(
    addonVariantId: string,
    locale: string
  ): Promise<IAddonVariantTranslation | null> {
    try {
      return await AddonVariantTranslation.deleteLocale(addonVariantId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete addon variant translation locale'
      );
    }
  }
}
