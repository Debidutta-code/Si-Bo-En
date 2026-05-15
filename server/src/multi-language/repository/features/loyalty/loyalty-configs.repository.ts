import {
  LoyaltyConditionsTranslation,
  ILoyaltyConditionsTranslation,
  ILoyaltyConditionsLocaleBlock,
  LoyaltySpecialConditionTranslation,
  ILoyaltySpecialConditionTranslation,
  ILoyaltySpecialConditionLocaleBlock,
} from '../../../models/features/loyalty/loyalty-configs.model';

export class LoyaltyConditionsTranslationRepository {
  public async upsert(
    loyaltyConditionId: string,
    localeData: Partial<Record<string, Partial<ILoyaltyConditionsLocaleBlock>>>
  ): Promise<ILoyaltyConditionsTranslation> {
    try {
      return await LoyaltyConditionsTranslation.upsert(loyaltyConditionId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert loyalty conditions translation'
      );
    }
  }

  public async getTranslated(
    loyaltyConditionId: string,
    locale: string = 'en'
  ): Promise<ILoyaltyConditionsLocaleBlock | null> {
    try {
      return await LoyaltyConditionsTranslation.getTranslated(loyaltyConditionId, locale);
    } catch (error) {
      throw new Error('Failed to get loyalty conditions translation');
    }
  }

  public async getAllTranslations(
    loyaltyConditionId: string
  ): Promise<Record<string, ILoyaltyConditionsLocaleBlock> | null> {
    try {
      return await LoyaltyConditionsTranslation.getAllTranslations(loyaltyConditionId);
    } catch (error) {
      throw new Error('Failed to get all loyalty conditions translations');
    }
  }

  public async deleteLocale(
    loyaltyConditionId: string,
    locale: string
  ): Promise<ILoyaltyConditionsTranslation | null> {
    try {
      return await LoyaltyConditionsTranslation.deleteLocale(loyaltyConditionId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete loyalty conditions translation locale'
      );
    }
  }
}

export class LoyaltySpecialConditionTranslationRepository {
  public async upsert(
    loyaltySpecialConditionId: string,
    localeData: Partial<Record<string, Partial<ILoyaltySpecialConditionLocaleBlock>>>
  ): Promise<ILoyaltySpecialConditionTranslation> {
    try {
      return await LoyaltySpecialConditionTranslation.upsert(loyaltySpecialConditionId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert loyalty special condition translation'
      );
    }
  }

  public async getTranslated(
    loyaltySpecialConditionId: string,
    locale: string = 'en'
  ): Promise<ILoyaltySpecialConditionLocaleBlock | null> {
    try {
      return await LoyaltySpecialConditionTranslation.getTranslated(loyaltySpecialConditionId, locale);
    } catch (error) {
      throw new Error('Failed to get loyalty special condition translation');
    }
  }

  public async getAllTranslations(
    loyaltySpecialConditionId: string
  ): Promise<Record<string, ILoyaltySpecialConditionLocaleBlock> | null> {
    try {
      return await LoyaltySpecialConditionTranslation.getAllTranslations(loyaltySpecialConditionId);
    } catch (error) {
      throw new Error('Failed to get all loyalty special condition translations');
    }
  }

  public async deleteLocale(
    loyaltySpecialConditionId: string,
    locale: string
  ): Promise<ILoyaltySpecialConditionTranslation | null> {
    try {
      return await LoyaltySpecialConditionTranslation.deleteLocale(loyaltySpecialConditionId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete loyalty special condition translation locale'
      );
    }
  }
}
