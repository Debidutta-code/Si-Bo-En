import { IApiResponse ,successResponse,errorResponse} from '../../../utils';
import { ChargeTranslationRepository } from '../../repository/ari';
import {
  IChargeTranslation,
  ILocaleBlock,
} from '../../models/ari/charges.model';


export class ChargeTranslationService {
    private chargeTranslationRepository: ChargeTranslationRepository;

    constructor() {
        this.chargeTranslationRepository = new ChargeTranslationRepository();
    }

  async upsert(
    chargeId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IChargeTranslation>> {
    try {
      const data = await this.chargeTranslationRepository.upsert(chargeId, localeData);
      return successResponse('Charge translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert charge translation', error.message);
      return errorResponse('Failed to upsert charge translation');
    }
  }

  async getTranslated(
    chargeId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.chargeTranslationRepository.getTranslated(chargeId, locale);
      if (!data) return errorResponse('Charge translation not found');
      return successResponse('Charge translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get charge translation', error.message);
      return errorResponse('Failed to get charge translation');
    }
  }

  async getAllTranslations(
    chargeId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.chargeTranslationRepository.getAllTranslations(chargeId);
      if (!data) return errorResponse('Charge translations not found');
      return successResponse('All charge translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all charge translations', error.message);
      return errorResponse('Failed to get all charge translations');
    }
  }

  async deleteLocale(
    chargeId: string,
    locale: string
  ): Promise<IApiResponse<IChargeTranslation>> {
    try {
      const data = await this.chargeTranslationRepository.deleteLocale(chargeId, locale);
      if (!data) return errorResponse('Charge translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete charge translation locale', error.message);
      return errorResponse('Failed to delete charge translation locale');
    }
  }
}

export const chargeTranslationService = new ChargeTranslationService();