import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { AddonSubCategoryTranslationRepository } from '../../../repository/features/addons/sub-catrgory.repository';
import {
  IAddonSubCategoryTranslation,
  ILocaleBlock,
} from '../../../models/features/addons/sub-catrgory.model';

export class AddonSubCategoryTranslationService {
  private addonSubCategoryTranslationRepository: AddonSubCategoryTranslationRepository;

  constructor() {
    this.addonSubCategoryTranslationRepository = new AddonSubCategoryTranslationRepository();
  }

 public async upsert(
    addonSubCategoryId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IAddonSubCategoryTranslation>> {
    try {
      const data = await this.addonSubCategoryTranslationRepository.upsert(addonSubCategoryId, localeData);
      return successResponse('Addon sub-category translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert addon sub-category translation', error.message);
      return errorResponse('Failed to upsert addon sub-category translation');
    }
  }

  public async getTranslated(
    addonSubCategoryId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.addonSubCategoryTranslationRepository.getTranslated(addonSubCategoryId, locale);
      if (!data) return errorResponse('Addon sub-category translation not found');
      return successResponse('Addon sub-category translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get addon sub-category translation', error.message);
      return errorResponse('Failed to get addon sub-category translation');
    }
  }

public  async getAllTranslations(
    addonSubCategoryId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.addonSubCategoryTranslationRepository.getAllTranslations(addonSubCategoryId);
      if (!data) return errorResponse('Addon sub-category translations not found');
      return successResponse('All addon sub-category translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all addon sub-category translations', error.message);
      return errorResponse('Failed to get all addon sub-category translations');
    }
  }

public  async deleteLocale(
    addonSubCategoryId: string,
    locale: string
  ): Promise<IApiResponse<IAddonSubCategoryTranslation>> {
    try {
      const data = await this.addonSubCategoryTranslationRepository.deleteLocale(addonSubCategoryId, locale);
      if (!data) return errorResponse('Addon sub-category translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete addon sub-category translation locale', error.message);
      return errorResponse('Failed to delete addon sub-category translation locale');
    }
  }
}

