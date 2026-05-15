import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { PolicyTranslationRepository } from '../../repository/ari';
import {
  IPolicyTranslation,
  ILocaleBlock,
} from '../../models/ari/policy.model';


export class PolicyTranslationService {
    private policyTranslationRepository: PolicyTranslationRepository;

    constructor() {
        this.policyTranslationRepository = new PolicyTranslationRepository();
    }

  async upsert(
    policyId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IPolicyTranslation>> {
    try {
      const data = await this.policyTranslationRepository.upsert(policyId, localeData);
      return successResponse('Policy translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert policy translation', error.message);
      return errorResponse('Failed to upsert policy translation');
    }
  }

  async getTranslated(
    policyId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.policyTranslationRepository.getTranslated(policyId, locale);
      if (!data) return errorResponse('Policy translation not found');
      return successResponse('Policy translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get policy translation', error.message);
      return errorResponse('Failed to get policy translation');
    }
  }

  async getAllTranslations(
    policyId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.policyTranslationRepository.getAllTranslations(policyId);
      if (!data) return errorResponse('Policy translations not found');
      return successResponse('All policy translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all policy translations', error.message);
      return errorResponse('Failed to get all policy translations');
    }
  }

  async deleteLocale(
    policyId: string,
    locale: string
  ): Promise<IApiResponse<IPolicyTranslation>> {
    try {
      const data = await this.policyTranslationRepository.deleteLocale(policyId, locale);
      if (!data) return errorResponse('Policy translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete policy translation locale', error.message);
      return errorResponse('Failed to delete policy translation locale');
    }
  }
}

