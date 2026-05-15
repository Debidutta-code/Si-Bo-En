import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { PropertyTranslationRepository } from '../../repository/property/property.repository';
import {
  IPropertyTranslation,
  ILocaleBlock,
} from '../../models/property/property.model';

export class PropertyTranslationService {
  private propertyTranslationRepository: PropertyTranslationRepository;

  constructor() {
    this.propertyTranslationRepository = new PropertyTranslationRepository();
  }

  public async upsert(
    propertyId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IPropertyTranslation>> {
    try {
      const data = await this.propertyTranslationRepository.upsert(propertyId, localeData);
      return successResponse('Property translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert property translation', error.message);
      return errorResponse('Failed to upsert property translation');
    }
  }

  public async getTranslated(
    propertyId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.propertyTranslationRepository.getTranslated(propertyId, locale);
      if (!data) return errorResponse('Property translation not found');
      return successResponse('Property translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get property translation', error.message);
      return errorResponse('Failed to get property translation');
    }
  }

  public async getAllTranslations(
    propertyId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.propertyTranslationRepository.getAllTranslations(propertyId);
      if (!data) return errorResponse('Property translations not found');
      return successResponse('All property translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all property translations', error.message);
      return errorResponse('Failed to get all property translations');
    }
  }

  public async deleteLocale(
    propertyId: string,
    locale: string
  ): Promise<IApiResponse<IPropertyTranslation>> {
    try {
      const data = await this.propertyTranslationRepository.deleteLocale(propertyId, locale);
      if (!data) return errorResponse('Property translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete property translation locale', error.message);
      return errorResponse('Failed to delete property translation locale');
    }
  }
}
