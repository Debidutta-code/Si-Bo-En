import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { MasterIntegrationTranslationRepository } from '../../repository/masters/integration-master.repository';
import {
  IMasterIntegrationTranslation,
  IMasterIntegrationLocaleBlock,
} from '../../models/masters/integration-master.model';

export class MasterIntegrationTranslationService {
  private masterIntegrationTranslationRepository: MasterIntegrationTranslationRepository;

  constructor() {
    this.masterIntegrationTranslationRepository = new MasterIntegrationTranslationRepository();
  }

  public async upsert(
    masterIntegrationId: string,
    localeData: Partial<Record<string, Partial<IMasterIntegrationLocaleBlock>>>
  ): Promise<IApiResponse<IMasterIntegrationTranslation>> {
    try {
      const data = await this.masterIntegrationTranslationRepository.upsert(masterIntegrationId, localeData);
      return successResponse('Master integration translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert master integration translation', error.message);
      return errorResponse('Failed to upsert master integration translation');
    }
  }

  public async getTranslated(
    masterIntegrationId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<IMasterIntegrationLocaleBlock>> {
    try {
      const data = await this.masterIntegrationTranslationRepository.getTranslated(masterIntegrationId, locale);
      if (!data) return errorResponse('Master integration translation not found');
      return successResponse('Master integration translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get master integration translation', error.message);
      return errorResponse('Failed to get master integration translation');
    }
  }

  public async getAllTranslations(
    masterIntegrationId: string
  ): Promise<IApiResponse<Record<string, IMasterIntegrationLocaleBlock>>> {
    try {
      const data = await this.masterIntegrationTranslationRepository.getAllTranslations(masterIntegrationId);
      if (!data) return errorResponse('Master integration translations not found');
      return successResponse('All master integration translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all master integration translations', error.message);
      return errorResponse('Failed to get all master integration translations');
    }
  }

  public async deleteLocale(
    masterIntegrationId: string,
    locale: string
  ): Promise<IApiResponse<IMasterIntegrationTranslation>> {
    try {
      const data = await this.masterIntegrationTranslationRepository.deleteLocale(masterIntegrationId, locale);
      if (!data) return errorResponse('Master integration translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete master integration translation locale', error.message);
      return errorResponse('Failed to delete master integration translation locale');
    }
  }
}
