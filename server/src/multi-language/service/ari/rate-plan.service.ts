import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { RatePlanTranslationRepository } from '../../repository/ari';
import {
  IRatePlanTranslation,
  ILocaleBlock,
} from '../../models/ari/rate-plan.model';

export class RatePlanTranslationService {
  private ratePlanTranslationRepository: RatePlanTranslationRepository;

  constructor() {
    this.ratePlanTranslationRepository = new RatePlanTranslationRepository();
  }

  async upsert(
    ratePlanId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IRatePlanTranslation>> {
    try {
      const data = await this.ratePlanTranslationRepository.upsert(ratePlanId, localeData);
      return successResponse('Rate plan translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert rate plan translation', error.message);
      return errorResponse('Failed to upsert rate plan translation');
    }
  }

  async getTranslated(
    ratePlanId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.ratePlanTranslationRepository.getTranslated(ratePlanId, locale);
      if (!data) return errorResponse('Rate plan translation not found');
      return successResponse('Rate plan translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get rate plan translation', error.message);
      return errorResponse('Failed to get rate plan translation');
    }
  }

  async getAllTranslations(
    ratePlanId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.ratePlanTranslationRepository.getAllTranslations(ratePlanId);
      if (!data) return errorResponse('Rate plan translations not found');
      return successResponse('All rate plan translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all rate plan translations', error.message);
      return errorResponse('Failed to get all rate plan translations');
    }
  }

  async deleteLocale(
    ratePlanId: string,
    locale: string
  ): Promise<IApiResponse<IRatePlanTranslation>> {
    try {
      const data = await this.ratePlanTranslationRepository.deleteLocale(ratePlanId, locale);
      if (!data) return errorResponse('Rate plan translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete rate plan translation locale', error.message);
      return errorResponse('Failed to delete rate plan translation locale');
    }
  }
}

