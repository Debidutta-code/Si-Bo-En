import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { PropertyAddressTranslationRepository } from '../../repository/property/property-address.repository';
import {
  IPropertyAddressTranslation,
  ILocaleBlock,
} from '../../models/property/property-address.model';

export class PropertyAddressTranslationService {
  private propertyAddressTranslationRepository: PropertyAddressTranslationRepository;

  constructor() {
    this.propertyAddressTranslationRepository = new PropertyAddressTranslationRepository();
  }

  public async upsert(
    propertyAddressId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IPropertyAddressTranslation>> {
    try {
      const data = await this.propertyAddressTranslationRepository.upsert(propertyAddressId, localeData);
      return successResponse('Property address translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert property address translation', error.message);
      return errorResponse('Failed to upsert property address translation');
    }
  }

  public async getTranslated(
    propertyAddressId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.propertyAddressTranslationRepository.getTranslated(propertyAddressId, locale);
      if (!data) return errorResponse('Property address translation not found');
      return successResponse('Property address translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get property address translation', error.message);
      return errorResponse('Failed to get property address translation');
    }
  }

  public async getAllTranslations(
    propertyAddressId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.propertyAddressTranslationRepository.getAllTranslations(propertyAddressId);
      if (!data) return errorResponse('Property address translations not found');
      return successResponse('All property address translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all property address translations', error.message);
      return errorResponse('Failed to get all property address translations');
    }
  }

  public async deleteLocale(
    propertyAddressId: string,
    locale: string
  ): Promise<IApiResponse<IPropertyAddressTranslation>> {
    try {
      const data = await this.propertyAddressTranslationRepository.deleteLocale(propertyAddressId, locale);
      if (!data) return errorResponse('Property address translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete property address translation locale', error.message);
      return errorResponse('Failed to delete property address translation locale');
    }
  }
}
