import {
  RatePlanTranslation,
  IRatePlanTranslation,
  ILocaleBlock,
} from '../../models/ari/rate-plan.model';

export class RatePlanTranslationRepository {
  public async upsert(
    ratePlanId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IRatePlanTranslation> {
    try {
      return await RatePlanTranslation.upsert(ratePlanId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert rate plan translation'
      );
    }
  }

  public async getTranslated(
    ratePlanId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await RatePlanTranslation.getTranslated(ratePlanId, locale);
    } catch (error) {
      throw new Error('Failed to get rate plan translation');
    }
  }

  public async getAllTranslations(
    ratePlanId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await RatePlanTranslation.getAllTranslations(ratePlanId);
    } catch (error) {
      console.log(error);
      throw new Error('Failed to get all rate plan translations');
    }
  }

  public async deleteLocale(
    ratePlanId: string,
    locale: string
  ): Promise<IRatePlanTranslation | null> {
    try {
      return await RatePlanTranslation.deleteLocale(ratePlanId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete rate plan translation locale'
      );
    }
  }
}
