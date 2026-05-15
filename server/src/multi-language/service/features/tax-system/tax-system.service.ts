import { IApiResponse, successResponse, errorResponse } from '../../../../utils';
import {
  TaxRuleTranslationRepository,
  TaxGroupTranslationRepository,
} from '../../../repository/features/tax-system/tax-system.repository';
import {
  ITaxRuleTranslation,
  ITaxRuleLocaleBlock,
  ITaxGroupTranslation,
  ITaxGroupLocaleBlock,
} from '../../../models/features/tax-system/tax-system.model';

export class TaxRuleTranslationService {
  private taxRuleTranslationRepository: TaxRuleTranslationRepository;

  constructor() {
    this.taxRuleTranslationRepository = new TaxRuleTranslationRepository();
  }

  public async upsert(
    taxRuleId: string,
    localeData: Partial<Record<string, Partial<ITaxRuleLocaleBlock>>>
  ): Promise<IApiResponse<ITaxRuleTranslation>> {
    try {
      const data = await this.taxRuleTranslationRepository.upsert(taxRuleId, localeData);
      return successResponse('Tax rule translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert tax rule translation', error.message);
      return errorResponse('Failed to upsert tax rule translation');
    }
  }

  public async getTranslated(
    taxRuleId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ITaxRuleLocaleBlock>> {
    try {
      const data = await this.taxRuleTranslationRepository.getTranslated(taxRuleId, locale);
      if (!data) return errorResponse('Tax rule translation not found');
      return successResponse('Tax rule translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get tax rule translation', error.message);
      return errorResponse('Failed to get tax rule translation');
    }
  }

  public async getAllTranslations(
    taxRuleId: string
  ): Promise<IApiResponse<Record<string, ITaxRuleLocaleBlock>>> {
    try {
      const data = await this.taxRuleTranslationRepository.getAllTranslations(taxRuleId);
      if (!data) return errorResponse('Tax rule translations not found');
      return successResponse('All tax rule translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all tax rule translations', error.message);
      return errorResponse('Failed to get all tax rule translations');
    }
  }

  public async deleteLocale(
    taxRuleId: string,
    locale: string
  ): Promise<IApiResponse<ITaxRuleTranslation>> {
    try {
      const data = await this.taxRuleTranslationRepository.deleteLocale(taxRuleId, locale);
      if (!data) return errorResponse('Tax rule translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete tax rule translation locale', error.message);
      return errorResponse('Failed to delete tax rule translation locale');
    }
  }
}

export class TaxGroupTranslationService {
  private taxGroupTranslationRepository: TaxGroupTranslationRepository;

  constructor() {
    this.taxGroupTranslationRepository = new TaxGroupTranslationRepository();
  }

  public async upsert(
    taxGroupId: string,
    localeData: Partial<Record<string, Partial<ITaxGroupLocaleBlock>>>
  ): Promise<IApiResponse<ITaxGroupTranslation>> {
    try {
      const data = await this.taxGroupTranslationRepository.upsert(taxGroupId, localeData);
      return successResponse('Tax group translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert tax group translation', error.message);
      return errorResponse('Failed to upsert tax group translation');
    }
  }

  public async getTranslated(
    taxGroupId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ITaxGroupLocaleBlock>> {
    try {
      const data = await this.taxGroupTranslationRepository.getTranslated(taxGroupId, locale);
      if (!data) return errorResponse('Tax group translation not found');
      return successResponse('Tax group translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get tax group translation', error.message);
      return errorResponse('Failed to get tax group translation');
    }
  }

  public async getAllTranslations(
    taxGroupId: string
  ): Promise<IApiResponse<Record<string, ITaxGroupLocaleBlock>>> {
    try {
      const data = await this.taxGroupTranslationRepository.getAllTranslations(taxGroupId);
      if (!data) return errorResponse('Tax group translations not found');
      return successResponse('All tax group translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all tax group translations', error.message);
      return errorResponse('Failed to get all tax group translations');
    }
  }

  public async deleteLocale(
    taxGroupId: string,
    locale: string
  ): Promise<IApiResponse<ITaxGroupTranslation>> {
    try {
      const data = await this.taxGroupTranslationRepository.deleteLocale(taxGroupId, locale);
      if (!data) return errorResponse('Tax group translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete tax group translation locale', error.message);
      return errorResponse('Failed to delete tax group translation locale');
    }
  }
}
