import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import {
  LoyaltyConditionsTranslationRepository,
  LoyaltySpecialConditionTranslationRepository,
} from '../../../repository/features/loyalty/loyalty-configs.repository';
import {
  ILoyaltyConditionsTranslation,
  ILoyaltyConditionsLocaleBlock,
  ILoyaltySpecialConditionTranslation,
  ILoyaltySpecialConditionLocaleBlock,
} from '../../../models/features/loyalty/loyalty-configs.model';

export class LoyaltyConditionsTranslationService {
  private loyaltyConditionsTranslationRepository: LoyaltyConditionsTranslationRepository;

  constructor() {
    this.loyaltyConditionsTranslationRepository = new LoyaltyConditionsTranslationRepository();
  }

  public async upsert(
    loyaltyConditionId: string,
    localeData: Partial<Record<string, Partial<ILoyaltyConditionsLocaleBlock>>>
  ): Promise<IApiResponse<ILoyaltyConditionsTranslation>> {
    try {
      const data = await this.loyaltyConditionsTranslationRepository.upsert(loyaltyConditionId, localeData);
      return successResponse('Loyalty conditions translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert loyalty conditions translation', error.message);
      return errorResponse('Failed to upsert loyalty conditions translation');
    }
  }

  public async getTranslated(
    loyaltyConditionId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILoyaltyConditionsLocaleBlock>> {
    try {
      const data = await this.loyaltyConditionsTranslationRepository.getTranslated(loyaltyConditionId, locale);
      if (!data) return errorResponse('Loyalty conditions translation not found');
      return successResponse('Loyalty conditions translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get loyalty conditions translation', error.message);
      return errorResponse('Failed to get loyalty conditions translation');
    }
  }

  public async getAllTranslations(
    loyaltyConditionId: string
  ): Promise<IApiResponse<Record<string, ILoyaltyConditionsLocaleBlock>>> {
    try {
      const data = await this.loyaltyConditionsTranslationRepository.getAllTranslations(loyaltyConditionId);
      if (!data) return errorResponse('Loyalty conditions translations not found');
      return successResponse('All loyalty conditions translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all loyalty conditions translations', error.message);
      return errorResponse('Failed to get all loyalty conditions translations');
    }
  }

  public async deleteLocale(
    loyaltyConditionId: string,
    locale: string
  ): Promise<IApiResponse<ILoyaltyConditionsTranslation>> {
    try {
      const data = await this.loyaltyConditionsTranslationRepository.deleteLocale(loyaltyConditionId, locale);
      if (!data) return errorResponse('Loyalty conditions translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete loyalty conditions translation locale', error.message);
      return errorResponse('Failed to delete loyalty conditions translation locale');
    }
  }
}

export class LoyaltySpecialConditionTranslationService {
  private loyaltySpecialConditionTranslationRepository: LoyaltySpecialConditionTranslationRepository;

  constructor() {
    this.loyaltySpecialConditionTranslationRepository = new LoyaltySpecialConditionTranslationRepository();
  }

  public async upsert(
    loyaltySpecialConditionId: string,
    localeData: Partial<Record<string, Partial<ILoyaltySpecialConditionLocaleBlock>>>
  ): Promise<IApiResponse<ILoyaltySpecialConditionTranslation>> {
    try {
      const data = await this.loyaltySpecialConditionTranslationRepository.upsert(loyaltySpecialConditionId, localeData);
      return successResponse('Loyalty special condition translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert loyalty special condition translation', error.message);
      return errorResponse('Failed to upsert loyalty special condition translation');
    }
  }

  public async getTranslated(
    loyaltySpecialConditionId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILoyaltySpecialConditionLocaleBlock>> {
    try {
      const data = await this.loyaltySpecialConditionTranslationRepository.getTranslated(loyaltySpecialConditionId, locale);
      if (!data) return errorResponse('Loyalty special condition translation not found');
      return successResponse('Loyalty special condition translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get loyalty special condition translation', error.message);
      return errorResponse('Failed to get loyalty special condition translation');
    }
  }

  public async getAllTranslations(
    loyaltySpecialConditionId: string
  ): Promise<IApiResponse<Record<string, ILoyaltySpecialConditionLocaleBlock>>> {
    try {
      const data = await this.loyaltySpecialConditionTranslationRepository.getAllTranslations(loyaltySpecialConditionId);
      if (!data) return errorResponse('Loyalty special condition translations not found');
      return successResponse('All loyalty special condition translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all loyalty special condition translations', error.message);
      return errorResponse('Failed to get all loyalty special condition translations');
    }
  }

  public async deleteLocale(
    loyaltySpecialConditionId: string,
    locale: string
  ): Promise<IApiResponse<ILoyaltySpecialConditionTranslation>> {
    try {
      const data = await this.loyaltySpecialConditionTranslationRepository.deleteLocale(loyaltySpecialConditionId, locale);
      if (!data) return errorResponse('Loyalty special condition translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete loyalty special condition translation locale', error.message);
      return errorResponse('Failed to delete loyalty special condition translation locale');
    }
  }
}
