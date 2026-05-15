import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { MasterLoyaltyRegistrationFieldTranslationRepository } from '../../repository/masters/loyalty.master.repository';
import {
  IMasterLoyaltyRegistrationFieldTranslation,
  IMasterLoyaltyRegistrationFieldLocaleBlock,
} from '../../models/masters/loyalty.master.model';

export class MasterLoyaltyRegistrationFieldTranslationService {
  private masterLoyaltyRegistrationFieldTranslationRepository: MasterLoyaltyRegistrationFieldTranslationRepository;

  constructor() {
    this.masterLoyaltyRegistrationFieldTranslationRepository = new MasterLoyaltyRegistrationFieldTranslationRepository();
  }

  public async upsert(
    masterLoyaltyRegistrationFieldId: string,
    localeData: Partial<Record<string, Partial<IMasterLoyaltyRegistrationFieldLocaleBlock>>>
  ): Promise<IApiResponse<IMasterLoyaltyRegistrationFieldTranslation>> {
    try {
      const data = await this.masterLoyaltyRegistrationFieldTranslationRepository.upsert(masterLoyaltyRegistrationFieldId, localeData);
      return successResponse('Master loyalty registration field translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert master loyalty registration field translation', error.message);
      return errorResponse('Failed to upsert master loyalty registration field translation');
    }
  }

  public async getTranslated(
    masterLoyaltyRegistrationFieldId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<IMasterLoyaltyRegistrationFieldLocaleBlock>> {
    try {
      const data = await this.masterLoyaltyRegistrationFieldTranslationRepository.getTranslated(masterLoyaltyRegistrationFieldId, locale);
      if (!data) return errorResponse('Master loyalty registration field translation not found');
      return successResponse('Master loyalty registration field translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get master loyalty registration field translation', error.message);
      return errorResponse('Failed to get master loyalty registration field translation');
    }
  }

  public async getAllTranslations(
    masterLoyaltyRegistrationFieldId: string
  ): Promise<IApiResponse<Record<string, IMasterLoyaltyRegistrationFieldLocaleBlock>>> {
    try {
      const data = await this.masterLoyaltyRegistrationFieldTranslationRepository.getAllTranslations(masterLoyaltyRegistrationFieldId);
      if (!data) return errorResponse('Master loyalty registration field translations not found');
      return successResponse('All master loyalty registration field translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all master loyalty registration field translations', error.message);
      return errorResponse('Failed to get all master loyalty registration field translations');
    }
  }

  public async deleteLocale(
    masterLoyaltyRegistrationFieldId: string,
    locale: string
  ): Promise<IApiResponse<IMasterLoyaltyRegistrationFieldTranslation>> {
    try {
      const data = await this.masterLoyaltyRegistrationFieldTranslationRepository.deleteLocale(masterLoyaltyRegistrationFieldId, locale);
      if (!data) return errorResponse('Master loyalty registration field translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete master loyalty registration field translation locale', error.message);
      return errorResponse('Failed to delete master loyalty registration field translation locale');
    }
  }
}
