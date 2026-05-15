import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { SpaTranslationRepository } from '../../../repository/features/spa/spa.repository';
import {
  ISpaTranslation,
  ILocaleBlock,
} from '../../../models/features/spa/spa.model';

export class SpaTranslationService {
  private spaTranslationRepository: SpaTranslationRepository;

  constructor() {
    this.spaTranslationRepository = new SpaTranslationRepository();
  }

  public async upsert(
    spaId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<ISpaTranslation>> {
    try {
      const data = await this.spaTranslationRepository.upsert(spaId, localeData);
      return successResponse('Spa translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to upsert spa translation', error.message);
      }
      return errorResponse('Failed to upsert spa translation');
    }
  }

  public async getTranslated(
    spaId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.spaTranslationRepository.getTranslated(spaId, locale);
      if (!data) return errorResponse('Spa translation not found');
      return successResponse('Spa translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to get spa translation', error.message);
      }
      return errorResponse('Failed to get spa translation');
    }
  }

  public async getAllTranslations(
    spaId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.spaTranslationRepository.getAllTranslations(spaId);
      if (!data) return errorResponse('Spa translations not found');
      return successResponse('All spa translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to get all spa translations', error.message);
      }
      return errorResponse('Failed to get all spa translations');
    }
  }

  public async deleteLocale(
    spaId: string,
    locale: string
  ): Promise<IApiResponse<ISpaTranslation>> {
    try {
      const data = await this.spaTranslationRepository.deleteLocale(spaId, locale);
      if (!data) return errorResponse('Spa translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) {
        return errorResponse('Failed to delete spa translation locale', error.message);
      }
      return errorResponse('Failed to delete spa translation locale');
    }
  }
}
