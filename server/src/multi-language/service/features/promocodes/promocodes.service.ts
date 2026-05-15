import { IApiResponse ,successResponse,errorResponse} from '../../../../utils';

import { PromotionTranslationRepository } from '../../../repository/features/promotions/promotion.repository';
import {
  IPromotionTranslation,
  ILocaleBlock,
} from '../../../models/features/promotions/promotion.model';

export class PromotionTranslationService {
  private promotionTranslationRepository: PromotionTranslationRepository;

  constructor() {
    this.promotionTranslationRepository = new PromotionTranslationRepository();
  }

  public async upsert(
    promotionId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IPromotionTranslation>> {
    try {
      const data = await this.promotionTranslationRepository.upsert(
        promotionId,
        localeData
      );
      return successResponse('Promotion translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to upsert promotion translation', error.message);
      }
      return errorResponse('Failed to upsert promotion translation');
    }
  }

  public async getTranslated(
    promotionId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.promotionTranslationRepository.getTranslated(
        promotionId,
        locale
      );
      if (!data) return errorResponse('Promotion translation not found');
      return successResponse('Promotion translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to get promotion translation', error.message);
      }
      return errorResponse('Failed to get promotion translation');
    }
  }

  public async getAllTranslations(
    promotionId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.promotionTranslationRepository.getAllTranslations(
        promotionId
      );
      if (!data) return errorResponse('Promotion translations not found');
      return successResponse('All promotion translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to get all promotion translations', error.message);
      }
      return errorResponse('Failed to get all promotion translations');
    }
  }

  public async deleteLocale(
    promotionId: string,
    locale: string
  ): Promise<IApiResponse<IPromotionTranslation>> {
    try {
      const data = await this.promotionTranslationRepository.deleteLocale(
        promotionId,
        locale
      );
      if (!data) return errorResponse('Promotion translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to delete promotion translation locale', error.message);
      }
      return errorResponse('Failed to delete promotion translation locale');
    }
  }
}

