import {
  PolicyTranslation,
  IPolicyTranslation,
  ILocaleBlock,
} from '../../models/ari/policy.model';


export interface IPolicyTranslationRepository {
  upsert(policyId: string, localeData: Partial<Record<string, Partial<ILocaleBlock>>>): Promise<IPolicyTranslation>;
  getTranslated(policyId: string, locale?: string): Promise<ILocaleBlock | null>;
  getAllTranslations(policyId: string): Promise<Record<string, ILocaleBlock> | null>;
  deleteLocale(policyId: string, locale: string): Promise<IPolicyTranslation | null>;
}


export class PolicyTranslationRepository implements IPolicyTranslationRepository {
  public async upsert(
    policyId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IPolicyTranslation> {
    try {
      return await PolicyTranslation.upsert(policyId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert policy translation'
      );
    }
  }

  public async getTranslated(
    policyId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await PolicyTranslation.getTranslated(policyId, locale);
    } catch (error) {
      throw new Error('Failed to get policy translation');
    }
  }

  public async getAllTranslations(
    policyId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await PolicyTranslation.getAllTranslations(policyId);
    } catch (error) {
      throw new Error('Failed to get all policy translations');
    }
  }

  public async deleteLocale(
    policyId: string,
    locale: string
  ): Promise<IPolicyTranslation | null> {
    try {
      return await PolicyTranslation.deleteLocale(policyId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete policy translation locale'
      );
    }
  }
}