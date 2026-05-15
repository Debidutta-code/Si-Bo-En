import {
  PromoCodeTranslation,
  IPromoCodeTranslation,
  ILocaleBlock,
} from '../../../models/features/promocodes/promocodes.model';

export class PromoCodeTranslationRepository {
  public async upsert(
    promoCodeId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IPromoCodeTranslation> {
    try {
      return await PromoCodeTranslation.upsert(promoCodeId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert promo code translation'
      );
    }
  }

  public async getTranslated(
    promoCodeId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await PromoCodeTranslation.getTranslated(promoCodeId, locale);
    } catch (error) {
      throw new Error('Failed to get promo code translation');
    }
  }

  public async getAllTranslations(
    promoCodeId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await PromoCodeTranslation.getAllTranslations(promoCodeId);
    } catch (error) {
      throw new Error('Failed to get all promo code translations');
    }
  }

  public async deleteLocale(
    promoCodeId: string,
    locale: string
  ): Promise<IPromoCodeTranslation | null> {
    try {
      return await PromoCodeTranslation.deleteLocale(promoCodeId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete promo code translation locale'
      );
    }
  }
}
