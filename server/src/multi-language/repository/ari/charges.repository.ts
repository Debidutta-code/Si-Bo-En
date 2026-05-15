import {
  ChargeTranslation,
  IChargeTranslation,
  ILocaleBlock,
} from '../../models/ari/charges.model';

export class ChargeTranslationRepository {
  public async upsert(
    chargeId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IChargeTranslation> {
    try {
      return await ChargeTranslation.upsert(chargeId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert charge translation'
      );
    }
  }

  public async getTranslated(
    chargeId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await ChargeTranslation.getTranslated(chargeId, locale);
    } catch (error) {
      throw new Error('Failed to get charge translation');
    }
  }

  public async getAllTranslations(
    chargeId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await ChargeTranslation.getAllTranslations(chargeId);
    } catch (error) {
      throw new Error('Failed to get all charge translations');
    }
  }

  public async deleteLocale(
    chargeId: string,
    locale: string
  ): Promise<IChargeTranslation | null> {
    try {
      return await ChargeTranslation.deleteLocale(chargeId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete charge translation locale'
      );
    }
  }
}

