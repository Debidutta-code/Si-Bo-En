import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import { AddonTranslationRepository } from '../../../repository/features/addons';
import {
  IAddonTranslation,
  ILocaleBlock,
} from '../../../models/features/addons/addon.model';

export class AddonTranslationService {
  private addonTranslationRepository: AddonTranslationRepository;

  constructor() {
    this.addonTranslationRepository = new AddonTranslationRepository();
  }

  public async upsert(
    addonId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IAddonTranslation>> {
    try {
      const data = await this.addonTranslationRepository.upsert(addonId, localeData);
      return successResponse('Addon translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert addon translation', error.message);
      return errorResponse('Failed to upsert addon translation');
    }
  }

public  async getTranslated(
    addonId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.addonTranslationRepository.getTranslated(addonId, locale);
      if (!data) return errorResponse('Addon translation not found');
      return successResponse('Addon translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get addon translation', error.message);
      return errorResponse('Failed to get addon translation');
    }
  }

public  async getAllTranslations(
    addonId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.addonTranslationRepository.getAllTranslations(addonId);
      if (!data) return errorResponse('Addon translations not found');
      return successResponse('All addon translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all addon translations', error.message);
      return errorResponse('Failed to get all addon translations');
    }
  }

public  async deleteLocale(
    addonId: string,
    locale: string
  ): Promise<IApiResponse<IAddonTranslation>> {
    try {
      const data = await this.addonTranslationRepository.deleteLocale(addonId, locale);
      if (!data) return errorResponse('Addon translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete addon translation locale', error.message);
      return errorResponse('Failed to delete addon translation locale');
    }
  }
}