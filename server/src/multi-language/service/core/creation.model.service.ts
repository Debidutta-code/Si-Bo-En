import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { CreationTranslationRepository } from '../../repository/core';
import {
  ICreationTranslation,
  ILocaleBlock,
} from '../../models/core/creation.model';

export class CreationTranslationService {
  private creationTranslationRepository: CreationTranslationRepository;

  constructor() {
    this.creationTranslationRepository = new CreationTranslationRepository();
  }

  async upsert(
    creationId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<ICreationTranslation>> {
    try {
      const data = await this.creationTranslationRepository.upsert(creationId, localeData);
      return successResponse('Creation translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert creation translation', error.message);
      return errorResponse('Failed to upsert creation translation');
    }
  }

  async getTranslated(
    creationId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.creationTranslationRepository.getTranslated(creationId, locale);
      if (!data) return errorResponse('Creation translation not found');
      return successResponse('Creation translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get creation translation', error.message);
      return errorResponse('Failed to get creation translation');
    }
  }

  async getAllTranslations(
    creationId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.creationTranslationRepository.getAllTranslations(creationId);
      if (!data) return errorResponse('Creation translations not found');
      return successResponse('All creation translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all creation translations', error.message);
      return errorResponse('Failed to get all creation translations');
    }
  }

  async deleteLocale(
    creationId: string,
    locale: string
  ): Promise<IApiResponse<ICreationTranslation>> {
    try {
      const data = await this.creationTranslationRepository.deleteLocale(creationId, locale);
      if (!data) return errorResponse('Creation translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete creation translation locale', error.message);
      return errorResponse('Failed to delete creation translation locale');
    }
  }
}

