import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { PropertyLoyaltyConfigTranslationRepository } from '../../../repository/features/loyalty/property-loyalty.repository';
import {
  IPropertyLoyaltyConfigTranslation,
  ILocaleBlock,
} from '../../../models/features/loyalty/property-loyalty.model';

export class PropertyLoyaltyConfigTranslationService {
  private propertyLoyaltyConfigTranslationRepository: PropertyLoyaltyConfigTranslationRepository;

  constructor() {
    this.propertyLoyaltyConfigTranslationRepository = new PropertyLoyaltyConfigTranslationRepository();
  }

  public async upsert(
    propertyLoyaltyConfigId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IPropertyLoyaltyConfigTranslation>> {
    try {
      const data = await this.propertyLoyaltyConfigTranslationRepository.upsert(propertyLoyaltyConfigId, localeData);
      return successResponse('Property loyalty config translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert property loyalty config translation', error.message);
      return errorResponse('Failed to upsert property loyalty config translation');
    }
  }

  public async getTranslated(
    propertyLoyaltyConfigId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.propertyLoyaltyConfigTranslationRepository.getTranslated(propertyLoyaltyConfigId, locale);
      if (!data) return errorResponse('Property loyalty config translation not found');
      return successResponse('Property loyalty config translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get property loyalty config translation', error.message);
      return errorResponse('Failed to get property loyalty config translation');
    }
  }

  public async getAllTranslations(
    propertyLoyaltyConfigId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.propertyLoyaltyConfigTranslationRepository.getAllTranslations(propertyLoyaltyConfigId);
      if (!data) return errorResponse('Property loyalty config translations not found');
      return successResponse('All property loyalty config translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all property loyalty config translations', error.message);
      return errorResponse('Failed to get all property loyalty config translations');
    }
  }

  public async deleteLocale(
    propertyLoyaltyConfigId: string,
    locale: string
  ): Promise<IApiResponse<IPropertyLoyaltyConfigTranslation>> {
    try {
      const data = await this.propertyLoyaltyConfigTranslationRepository.deleteLocale(propertyLoyaltyConfigId, locale);
      if (!data) return errorResponse('Property loyalty config translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete property loyalty config translation locale', error.message);
      return errorResponse('Failed to delete property loyalty config translation locale');
    }
  }
}

