import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import {
  SpaCategoryTranslationRepository,
  SpaSubCategoryTranslationRepository,
} from '../../repository/masters/spa-type.repository';
import {
  ISpaCategoryTranslation,
  ISpaCategoryLocaleBlock,
  ISpaSubCategoryTranslation,
  ISpaSubCategoryLocaleBlock,
} from '../../models/masters/spa-type.model';

export class SpaCategoryTranslationService {
  private spaCategoryTranslationRepository: SpaCategoryTranslationRepository;

  constructor() {
    this.spaCategoryTranslationRepository = new SpaCategoryTranslationRepository();
  }

  public async upsert(
    spaCategoryId: string,
    localeData: Partial<Record<string, Partial<ISpaCategoryLocaleBlock>>>
  ): Promise<IApiResponse<ISpaCategoryTranslation>> {
    try {
      const data = await this.spaCategoryTranslationRepository.upsert(spaCategoryId, localeData);
      return successResponse('Spa category translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert spa category translation', error.message);
      return errorResponse('Failed to upsert spa category translation');
    }
  }

  public async getTranslated(
    spaCategoryId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ISpaCategoryLocaleBlock>> {
    try {
      const data = await this.spaCategoryTranslationRepository.getTranslated(spaCategoryId, locale);
      if (!data) return errorResponse('Spa category translation not found');
      return successResponse('Spa category translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get spa category translation', error.message);
      return errorResponse('Failed to get spa category translation');
    }
  }

  public async getAllTranslations(
    spaCategoryId: string
  ): Promise<IApiResponse<Record<string, ISpaCategoryLocaleBlock>>> {
    try {
      const data = await this.spaCategoryTranslationRepository.getAllTranslations(spaCategoryId);
      if (!data) return errorResponse('Spa category translations not found');
      return successResponse('All spa category translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all spa category translations', error.message);
      return errorResponse('Failed to get all spa category translations');
    }
  }

  public async deleteLocale(
    spaCategoryId: string,
    locale: string
  ): Promise<IApiResponse<ISpaCategoryTranslation>> {
    try {
      const data = await this.spaCategoryTranslationRepository.deleteLocale(spaCategoryId, locale);
      if (!data) return errorResponse('Spa category translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete spa category translation locale', error.message);
      return errorResponse('Failed to delete spa category translation locale');
    }
  }
}

export class SpaSubCategoryTranslationService {
  private spaSubCategoryTranslationRepository: SpaSubCategoryTranslationRepository;

  constructor() {
    this.spaSubCategoryTranslationRepository = new SpaSubCategoryTranslationRepository();
  }

  public async upsert(
    spaSubCategoryId: string,
    localeData: Partial<Record<string, Partial<ISpaSubCategoryLocaleBlock>>>
  ): Promise<IApiResponse<ISpaSubCategoryTranslation>> {
    try {
      const data = await this.spaSubCategoryTranslationRepository.upsert(spaSubCategoryId, localeData);
      return successResponse('Spa sub-category translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert spa sub-category translation', error.message);
      return errorResponse('Failed to upsert spa sub-category translation');
    }
  }

  public async getTranslated(
    spaSubCategoryId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ISpaSubCategoryLocaleBlock>> {
    try {
      const data = await this.spaSubCategoryTranslationRepository.getTranslated(spaSubCategoryId, locale);
      if (!data) return errorResponse('Spa sub-category translation not found');
      return successResponse('Spa sub-category translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get spa sub-category translation', error.message);
      return errorResponse('Failed to get spa sub-category translation');
    }
  }

  public async getAllTranslations(
    spaSubCategoryId: string
  ): Promise<IApiResponse<Record<string, ISpaSubCategoryLocaleBlock>>> {
    try {
      const data = await this.spaSubCategoryTranslationRepository.getAllTranslations(spaSubCategoryId);
      if (!data) return errorResponse('Spa sub-category translations not found');
      return successResponse('All spa sub-category translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all spa sub-category translations', error.message);
      return errorResponse('Failed to get all spa sub-category translations');
    }
  }

  public async deleteLocale(
    spaSubCategoryId: string,
    locale: string
  ): Promise<IApiResponse<ISpaSubCategoryTranslation>> {
    try {
      const data = await this.spaSubCategoryTranslationRepository.deleteLocale(spaSubCategoryId, locale);
      if (!data) return errorResponse('Spa sub-category translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete spa sub-category translation locale', error.message);
      return errorResponse('Failed to delete spa sub-category translation locale');
    }
  }
}
