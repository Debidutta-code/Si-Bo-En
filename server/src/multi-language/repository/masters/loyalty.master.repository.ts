import {
  MasterLoyaltyRegistrationFieldTranslation,
  IMasterLoyaltyRegistrationFieldTranslation,
  IMasterLoyaltyRegistrationFieldLocaleBlock,
} from '../../models/masters/loyalty.master.model';

export class MasterLoyaltyRegistrationFieldTranslationRepository {
  public async upsert(
    masterLoyaltyRegistrationFieldId: string,
    localeData: Partial<Record<string, Partial<IMasterLoyaltyRegistrationFieldLocaleBlock>>>
  ): Promise<IMasterLoyaltyRegistrationFieldTranslation> {
    try {
      return await MasterLoyaltyRegistrationFieldTranslation.upsert(masterLoyaltyRegistrationFieldId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert master loyalty registration field translation'
      );
    }
  }

  public async getTranslated(
    masterLoyaltyRegistrationFieldId: string,
    locale: string = 'en'
  ): Promise<IMasterLoyaltyRegistrationFieldLocaleBlock | null> {
    try {
      return await MasterLoyaltyRegistrationFieldTranslation.getTranslated(masterLoyaltyRegistrationFieldId, locale);
    } catch (error) {
      throw new Error('Failed to get master loyalty registration field translation');
    }
  }

  public async getAllTranslations(
    masterLoyaltyRegistrationFieldId: string
  ): Promise<Record<string, IMasterLoyaltyRegistrationFieldLocaleBlock> | null> {
    try {
      return await MasterLoyaltyRegistrationFieldTranslation.getAllTranslations(masterLoyaltyRegistrationFieldId);
    } catch (error) {
      throw new Error('Failed to get all master loyalty registration field translations');
    }
  }

  public async deleteLocale(
    masterLoyaltyRegistrationFieldId: string,
    locale: string
  ): Promise<IMasterLoyaltyRegistrationFieldTranslation | null> {
    try {
      return await MasterLoyaltyRegistrationFieldTranslation.deleteLocale(masterLoyaltyRegistrationFieldId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete master loyalty registration field translation locale'
      );
    }
  }
}
