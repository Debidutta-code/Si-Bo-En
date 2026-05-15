import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { TouristTaxTranslationRepository } from '../../../repository/features/tax-system/tourist-tax.repository';
import {
  ITouristTaxTranslation,
  ITouristTaxLocaleBlock,
} from '../../../models/features/tax-system/tourist-tax.model';

export class TouristTaxTranslationService {
  private touristTaxTranslationRepository: TouristTaxTranslationRepository;

  constructor() {
    this.touristTaxTranslationRepository = new TouristTaxTranslationRepository();
  }

  public async upsert(
    touristTaxId: string,
    localeData: Partial<Record<string, Partial<ITouristTaxLocaleBlock>>>
  ): Promise<IApiResponse<ITouristTaxTranslation>> {
    try {
      const data = await this.touristTaxTranslationRepository.upsert(touristTaxId, localeData);
      return successResponse('Tourist tax translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert tourist tax translation', error.message);
      return errorResponse('Failed to upsert tourist tax translation');
    }
  }

  public async getTranslated(
    touristTaxId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ITouristTaxLocaleBlock>> {
    try {
      const data = await this.touristTaxTranslationRepository.getTranslated(touristTaxId, locale);
      if (!data) return errorResponse('Tourist tax translation not found');
      return successResponse('Tourist tax translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get tourist tax translation', error.message);
      return errorResponse('Failed to get tourist tax translation');
    }
  }

  public async getAllTranslations(
    touristTaxId: string
  ): Promise<IApiResponse<Record<string, ITouristTaxLocaleBlock>>> {
    try {
      const data = await this.touristTaxTranslationRepository.getAllTranslations(touristTaxId);
      if (!data) return errorResponse('Tourist tax translations not found');
      return successResponse('All tourist tax translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all tourist tax translations', error.message);
      return errorResponse('Failed to get all tourist tax translations');
    }
  }

  public async deleteLocale(
    touristTaxId: string,
    locale: string
  ): Promise<IApiResponse<ITouristTaxTranslation>> {
    try {
      const data = await this.touristTaxTranslationRepository.deleteLocale(touristTaxId, locale);
      if (!data) return errorResponse('Tourist tax translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete tourist tax translation locale', error.message);
      return errorResponse('Failed to delete tourist tax translation locale');
    }
  }
}
