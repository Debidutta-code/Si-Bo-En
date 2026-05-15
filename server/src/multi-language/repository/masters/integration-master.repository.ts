import {
  MasterIntegrationTranslation,
  IMasterIntegrationTranslation,
  IMasterIntegrationLocaleBlock,
} from '../../models/masters/integration-master.model';

export class MasterIntegrationTranslationRepository {
  public async upsert(
    masterIntegrationId: string,
    localeData: Partial<Record<string, Partial<IMasterIntegrationLocaleBlock>>>
  ): Promise<IMasterIntegrationTranslation> {
    try {
      return await MasterIntegrationTranslation.upsert(masterIntegrationId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert master integration translation'
      );
    }
  }

  public async getTranslated(
    masterIntegrationId: string,
    locale: string = 'en'
  ): Promise<IMasterIntegrationLocaleBlock | null> {
    try {
      return await MasterIntegrationTranslation.getTranslated(masterIntegrationId, locale);
    } catch (error) {
      throw new Error('Failed to get master integration translation');
    }
  }

  public async getAllTranslations(
    masterIntegrationId: string
  ): Promise<Record<string, IMasterIntegrationLocaleBlock> | null> {
    try {
      return await MasterIntegrationTranslation.getAllTranslations(masterIntegrationId);
    } catch (error) {
      throw new Error('Failed to get all master integration translations');
    }
  }

  public async deleteLocale(
    masterIntegrationId: string,
    locale: string
  ): Promise<IMasterIntegrationTranslation | null> {
    try {
      return await MasterIntegrationTranslation.deleteLocale(masterIntegrationId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete master integration translation locale'
      );
    }
  }
}
