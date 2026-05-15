import {
  MasterPropertyCategoryTranslation,
  IMasterPropertyCategoryTranslation,
  IMasterPropertyCategoryLocaleBlock,
  MasterPropertyTypeTranslation,
  IMasterPropertyTypeTranslation,
  IMasterPropertyTypeLocaleBlock,
  MasterAmenityTranslation,
  IMasterAmenityTranslation,
  IMasterAmenityLocaleBlock,
  MasterRoomViewTranslation,
  IMasterRoomViewTranslation,
  IMasterRoomViewLocaleBlock,
} from '../../models/property/property-masters.model';

export class MasterPropertyCategoryTranslationRepository {
  public async upsert(
    masterPropertyCategoryId: string,
    localeData: Partial<Record<string, Partial<IMasterPropertyCategoryLocaleBlock>>>
  ): Promise<IMasterPropertyCategoryTranslation> {
    try {
      return await MasterPropertyCategoryTranslation.upsert(masterPropertyCategoryId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert master property category translation'
      );
    }
  }

  public async getTranslated(
    masterPropertyCategoryId: string,
    locale: string = 'en'
  ): Promise<IMasterPropertyCategoryLocaleBlock | null> {
    try {
      return await MasterPropertyCategoryTranslation.getTranslated(masterPropertyCategoryId, locale);
    } catch (error) {
      throw new Error('Failed to get master property category translation');
    }
  }

  public async getAllTranslations(
    masterPropertyCategoryId: string
  ): Promise<Record<string, IMasterPropertyCategoryLocaleBlock> | null> {
    try {
      return await MasterPropertyCategoryTranslation.getAllTranslations(masterPropertyCategoryId);
    } catch (error) {
      throw new Error('Failed to get all master property category translations');
    }
  }

  public async deleteLocale(
    masterPropertyCategoryId: string,
    locale: string
  ): Promise<IMasterPropertyCategoryTranslation | null> {
    try {
      return await MasterPropertyCategoryTranslation.deleteLocale(masterPropertyCategoryId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete master property category translation locale'
      );
    }
  }
}

export class MasterPropertyTypeTranslationRepository {
  public async upsert(
    masterPropertyTypeId: string,
    localeData: Partial<Record<string, Partial<IMasterPropertyTypeLocaleBlock>>>
  ): Promise<IMasterPropertyTypeTranslation> {
    try {
      return await MasterPropertyTypeTranslation.upsert(masterPropertyTypeId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert master property type translation'
      );
    }
  }

  public async getTranslated(
    masterPropertyTypeId: string,
    locale: string = 'en'
  ): Promise<IMasterPropertyTypeLocaleBlock | null> {
    try {
      return await MasterPropertyTypeTranslation.getTranslated(masterPropertyTypeId, locale);
    } catch (error) {
      throw new Error('Failed to get master property type translation');
    }
  }

  public async getAllTranslations(
    masterPropertyTypeId: string
  ): Promise<Record<string, IMasterPropertyTypeLocaleBlock> | null> {
    try {
      return await MasterPropertyTypeTranslation.getAllTranslations(masterPropertyTypeId);
    } catch (error) {
      throw new Error('Failed to get all master property type translations');
    }
  }

  public async deleteLocale(
    masterPropertyTypeId: string,
    locale: string
  ): Promise<IMasterPropertyTypeTranslation | null> {
    try {
      return await MasterPropertyTypeTranslation.deleteLocale(masterPropertyTypeId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete master property type translation locale'
      );
    }
  }
}

export class MasterAmenityTranslationRepository {
  public async upsert(
    masterAmenityId: string,
    localeData: Partial<Record<string, Partial<IMasterAmenityLocaleBlock>>>
  ): Promise<IMasterAmenityTranslation> {
    try {
      return await MasterAmenityTranslation.upsert(masterAmenityId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert master amenity translation'
      );
    }
  }

  public async getTranslated(
    masterAmenityId: string,
    locale: string = 'en'
  ): Promise<IMasterAmenityLocaleBlock | null> {
    try {
      return await MasterAmenityTranslation.getTranslated(masterAmenityId, locale);
    } catch (error) {
      throw new Error('Failed to get master amenity translation');
    }
  }

  public async getAllTranslations(
    masterAmenityId: string
  ): Promise<Record<string, IMasterAmenityLocaleBlock> | null> {
    try {
      return await MasterAmenityTranslation.getAllTranslations(masterAmenityId);
    } catch (error) {
      throw new Error('Failed to get all master amenity translations');
    }
  }

  public async deleteLocale(
    masterAmenityId: string,
    locale: string
  ): Promise<IMasterAmenityTranslation | null> {
    try {
      return await MasterAmenityTranslation.deleteLocale(masterAmenityId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete master amenity translation locale'
      );
    }
  }
}

export class MasterRoomViewTranslationRepository {
  public async upsert(
    masterRoomViewId: string,
    localeData: Partial<Record<string, Partial<IMasterRoomViewLocaleBlock>>>
  ): Promise<IMasterRoomViewTranslation> {
    try {
      return await MasterRoomViewTranslation.upsert(masterRoomViewId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert master room view translation'
      );
    }
  }

  public async getTranslated(
    masterRoomViewId: string,
    locale: string = 'en'
  ): Promise<IMasterRoomViewLocaleBlock | null> {
    try {
      return await MasterRoomViewTranslation.getTranslated(masterRoomViewId, locale);
    } catch (error) {
      throw new Error('Failed to get master room view translation');
    }
  }

  public async getAllTranslations(
    masterRoomViewId: string
  ): Promise<Record<string, IMasterRoomViewLocaleBlock> | null> {
    try {
      return await MasterRoomViewTranslation.getAllTranslations(masterRoomViewId);
    } catch (error) {
      throw new Error('Failed to get all master room view translations');
    }
  }

  public async deleteLocale(
    masterRoomViewId: string,
    locale: string
  ): Promise<IMasterRoomViewTranslation | null> {
    try {
      return await MasterRoomViewTranslation.deleteLocale(masterRoomViewId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete master room view translation locale'
      );
    }
  }
}
