import { IApiResponse ,successResponse,errorResponse} from '../../../../utils';

import { PromoCodeTranslationRepository } from '../../../repository/features/promocodes';
import {
  IPromoCodeTranslation,
  ILocaleBlock,
} from '../../../models/features/promocodes/promocodes.model';

export class PromocodeTranslationService {
  private promocodeTranslationRepository: PromoCodeTranslationRepository;

  constructor() {
    this.promocodeTranslationRepository = new PromoCodeTranslationRepository();
  }

  public async upsert(
    promocodeId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IPromoCodeTranslation>> {
    try {
      const data = await this.promocodeTranslationRepository.upsert(
        promocodeId,
        localeData
      );
      return successResponse('PromoCode translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to upsert promocode translation', error.message);
      }
      return errorResponse('Failed to upsert promocode translation');
    }
  }

  public async getTranslated(
    promocodeId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.promocodeTranslationRepository.getTranslated(
        promocodeId,
        locale
      );
      if (!data) return errorResponse('promocode translation not found');
      return successResponse('promocode translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to get promocode translation', error.message);
      }
      return errorResponse('Failed to get promocode translation');
    }
  }

  public async getAllTranslations(
    promocodeId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.promocodeTranslationRepository.getAllTranslations(
        promocodeId
      );
      if (!data) return errorResponse('promocode translations not found');
      return successResponse('All promocode translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to get all promocode translations', error.message);
      }
      return errorResponse('Failed to get all promocode translations');
    }
  }

  public async deleteLocale(
    promocodeId: string,
    locale: string
  ): Promise<IApiResponse<IPromoCodeTranslation>> {
    try {
      const data = await this.promocodeTranslationRepository.deleteLocale(
        promocodeId,
        locale
      );
      if (!data) return errorResponse('promocode translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to delete promocode translation locale', error.message);
      }
      return errorResponse('Failed to delete promocode translation locale');
    }
  }
}

