import {
  PromotionTranslation,
  IPromotionTranslation,
  ILocaleBlock,
} from '../../../models/features/promotions/promotion.model';

export class PromotionTranslationRepository {
  public async upsert(
    promotionId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IPromotionTranslation> {
    try {
      return await PromotionTranslation.upsert(promotionId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert promotion translation'
      );
    }
  }

  public async getTranslated(
    promotionId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await PromotionTranslation.getTranslated(promotionId, locale);
    } catch (error) {
      throw new Error('Failed to get promotion translation');
    }
  }

  public async getAllTranslations(
    promotionId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await PromotionTranslation.getAllTranslations(promotionId);
    } catch (error) {
      throw new Error('Failed to get all promotion translations');
    }
  }

  public async deleteLocale(
    promotionId: string,
    locale: string
  ): Promise<IPromotionTranslation | null> {
    try {
      return await PromotionTranslation.deleteLocale(promotionId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete promotion translation locale'
      );
    }
  }
}
