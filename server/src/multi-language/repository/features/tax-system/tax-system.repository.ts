import {
  TaxRuleTranslation,
  ITaxRuleTranslation,
  ITaxRuleLocaleBlock,
  TaxGroupTranslation,
  ITaxGroupTranslation,
  ITaxGroupLocaleBlock,
} from '../../../models/features/tax-system/tax-system.model';

export class TaxRuleTranslationRepository {
  public async upsert(
    taxRuleId: string,
    localeData: Partial<Record<string, Partial<ITaxRuleLocaleBlock>>>
  ): Promise<ITaxRuleTranslation> {
    try {
      return await TaxRuleTranslation.upsert(taxRuleId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert tax rule translation'
      );
    }
  }

  public async getTranslated(
    taxRuleId: string,
    locale: string = 'en'
  ): Promise<ITaxRuleLocaleBlock | null> {
    try {
      return await TaxRuleTranslation.getTranslated(taxRuleId, locale);
    } catch (error) {
      throw new Error('Failed to get tax rule translation');
    }
  }

  public async getAllTranslations(
    taxRuleId: string
  ): Promise<Record<string, ITaxRuleLocaleBlock> | null> {
    try {
      return await TaxRuleTranslation.getAllTranslations(taxRuleId);
    } catch (error) {
      throw new Error('Failed to get all tax rule translations');
    }
  }

  public async deleteLocale(
    taxRuleId: string,
    locale: string
  ): Promise<ITaxRuleTranslation | null> {
    try {
      return await TaxRuleTranslation.deleteLocale(taxRuleId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete tax rule translation locale'
      );
    }
  }
}

export class TaxGroupTranslationRepository {
  public async upsert(
    taxGroupId: string,
    localeData: Partial<Record<string, Partial<ITaxGroupLocaleBlock>>>
  ): Promise<ITaxGroupTranslation> {
    try {
      return await TaxGroupTranslation.upsert(taxGroupId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert tax group translation'
      );
    }
  }

  public async getTranslated(
    taxGroupId: string,
    locale: string = 'en'
  ): Promise<ITaxGroupLocaleBlock | null> {
    try {
      return await TaxGroupTranslation.getTranslated(taxGroupId, locale);
    } catch (error) {
      throw new Error('Failed to get tax group translation');
    }
  }

  public async getAllTranslations(
    taxGroupId: string
  ): Promise<Record<string, ITaxGroupLocaleBlock> | null> {
    try {
      return await TaxGroupTranslation.getAllTranslations(taxGroupId);
    } catch (error) {
      throw new Error('Failed to get all tax group translations');
    }
  }

  public async deleteLocale(
    taxGroupId: string,
    locale: string
  ): Promise<ITaxGroupTranslation | null> {
    try {
      return await TaxGroupTranslation.deleteLocale(taxGroupId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete tax group translation locale'
      );
    }
  }
}
