import {
  CreationTranslation,
  ICreationTranslation,
  ILocaleBlock,
} from '../../models/core/creation.model';

export class CreationTranslationRepository {
  public async upsert(
    creationId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<ICreationTranslation> {
    try {
      return await CreationTranslation.upsert(creationId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert creation translation'
      );
    }
  }

  public async getTranslated(
    creationId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await CreationTranslation.getTranslated(creationId, locale);
    } catch (error) {
      throw new Error('Failed to get creation translation');
    }
  }

  public async getAllTranslations(
    creationId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await CreationTranslation.getAllTranslations(creationId);
    } catch (error) {
      throw new Error('Failed to get all creation translations');
    }
  }

  public async deleteLocale(
    creationId: string,
    locale: string
  ): Promise<ICreationTranslation | null> {
    try {
      return await CreationTranslation.deleteLocale(creationId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete creation translation locale'
      );
    }
  }
}
