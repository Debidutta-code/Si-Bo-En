import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import {
  MasterPropertyCategoryTranslationRepository,
  MasterPropertyTypeTranslationRepository,
  MasterAmenityTranslationRepository,
  MasterRoomViewTranslationRepository,
} from '../../repository/property/property-masters.repository';
import {
  IMasterPropertyCategoryTranslation,
  IMasterPropertyCategoryLocaleBlock,
  IMasterPropertyTypeTranslation,
  IMasterPropertyTypeLocaleBlock,
  IMasterAmenityTranslation,
  IMasterAmenityLocaleBlock,
  IMasterRoomViewTranslation,
  IMasterRoomViewLocaleBlock,
} from '../../models/property/property-masters.model';

export class MasterPropertyCategoryTranslationService {
  private masterPropertyCategoryTranslationRepository: MasterPropertyCategoryTranslationRepository;

  constructor() {
    this.masterPropertyCategoryTranslationRepository = new MasterPropertyCategoryTranslationRepository();
  }

  public async upsert(
    masterPropertyCategoryId: string,
    localeData: Partial<Record<string, Partial<IMasterPropertyCategoryLocaleBlock>>>
  ): Promise<IApiResponse<IMasterPropertyCategoryTranslation>> {
    try {
      const data = await this.masterPropertyCategoryTranslationRepository.upsert(masterPropertyCategoryId, localeData);
      return successResponse('Master property category translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert master property category translation', error.message);
      return errorResponse('Failed to upsert master property category translation');
    }
  }

  public async getTranslated(
    masterPropertyCategoryId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<IMasterPropertyCategoryLocaleBlock>> {
    try {
      const data = await this.masterPropertyCategoryTranslationRepository.getTranslated(masterPropertyCategoryId, locale);
      if (!data) return errorResponse('Master property category translation not found');
      return successResponse('Master property category translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get master property category translation', error.message);
      return errorResponse('Failed to get master property category translation');
    }
  }

  public async getAllTranslations(
    masterPropertyCategoryId: string
  ): Promise<IApiResponse<Record<string, IMasterPropertyCategoryLocaleBlock>>> {
    try {
      const data = await this.masterPropertyCategoryTranslationRepository.getAllTranslations(masterPropertyCategoryId);
      if (!data) return errorResponse('Master property category translations not found');
      return successResponse('All master property category translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all master property category translations', error.message);
      return errorResponse('Failed to get all master property category translations');
    }
  }

  public async deleteLocale(
    masterPropertyCategoryId: string,
    locale: string
  ): Promise<IApiResponse<IMasterPropertyCategoryTranslation>> {
    try {
      const data = await this.masterPropertyCategoryTranslationRepository.deleteLocale(masterPropertyCategoryId, locale);
      if (!data) return errorResponse('Master property category translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete master property category translation locale', error.message);
      return errorResponse('Failed to delete master property category translation locale');
    }
  }
}

export class MasterPropertyTypeTranslationService {
  private masterPropertyTypeTranslationRepository: MasterPropertyTypeTranslationRepository;

  constructor() {
    this.masterPropertyTypeTranslationRepository = new MasterPropertyTypeTranslationRepository();
  }

  public async upsert(
    masterPropertyTypeId: string,
    localeData: Partial<Record<string, Partial<IMasterPropertyTypeLocaleBlock>>>
  ): Promise<IApiResponse<IMasterPropertyTypeTranslation>> {
    try {
      const data = await this.masterPropertyTypeTranslationRepository.upsert(masterPropertyTypeId, localeData);
      return successResponse('Master property type translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert master property type translation', error.message);
      return errorResponse('Failed to upsert master property type translation');
    }
  }

  public async getTranslated(
    masterPropertyTypeId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<IMasterPropertyTypeLocaleBlock>> {
    try {
      const data = await this.masterPropertyTypeTranslationRepository.getTranslated(masterPropertyTypeId, locale);
      if (!data) return errorResponse('Master property type translation not found');
      return successResponse('Master property type translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get master property type translation', error.message);
      return errorResponse('Failed to get master property type translation');
    }
  }

  public async getAllTranslations(
    masterPropertyTypeId: string
  ): Promise<IApiResponse<Record<string, IMasterPropertyTypeLocaleBlock>>> {
    try {
      const data = await this.masterPropertyTypeTranslationRepository.getAllTranslations(masterPropertyTypeId);
      if (!data) return errorResponse('Master property type translations not found');
      return successResponse('All master property type translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all master property type translations', error.message);
      return errorResponse('Failed to get all master property type translations');
    }
  }

  public async deleteLocale(
    masterPropertyTypeId: string,
    locale: string
  ): Promise<IApiResponse<IMasterPropertyTypeTranslation>> {
    try {
      const data = await this.masterPropertyTypeTranslationRepository.deleteLocale(masterPropertyTypeId, locale);
      if (!data) return errorResponse('Master property type translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete master property type translation locale', error.message);
      return errorResponse('Failed to delete master property type translation locale');
    }
  }
}

export class MasterAmenityTranslationService {
  private masterAmenityTranslationRepository: MasterAmenityTranslationRepository;

  constructor() {
    this.masterAmenityTranslationRepository = new MasterAmenityTranslationRepository();
  }

  public async upsert(
    masterAmenityId: string,
    localeData: Partial<Record<string, Partial<IMasterAmenityLocaleBlock>>>
  ): Promise<IApiResponse<IMasterAmenityTranslation>> {
    try {
      const data = await this.masterAmenityTranslationRepository.upsert(masterAmenityId, localeData);
      return successResponse('Master amenity translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert master amenity translation', error.message);
      return errorResponse('Failed to upsert master amenity translation');
    }
  }

  public async getTranslated(
    masterAmenityId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<IMasterAmenityLocaleBlock>> {
    try {
      const data = await this.masterAmenityTranslationRepository.getTranslated(masterAmenityId, locale);
      if (!data) return errorResponse('Master amenity translation not found');
      return successResponse('Master amenity translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get master amenity translation', error.message);
      return errorResponse('Failed to get master amenity translation');
    }
  }

  public async getAllTranslations(
    masterAmenityId: string
  ): Promise<IApiResponse<Record<string, IMasterAmenityLocaleBlock>>> {
    try {
      const data = await this.masterAmenityTranslationRepository.getAllTranslations(masterAmenityId);
      if (!data) return errorResponse('Master amenity translations not found');
      return successResponse('All master amenity translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all master amenity translations', error.message);
      return errorResponse('Failed to get all master amenity translations');
    }
  }

  public async deleteLocale(
    masterAmenityId: string,
    locale: string
  ): Promise<IApiResponse<IMasterAmenityTranslation>> {
    try {
      const data = await this.masterAmenityTranslationRepository.deleteLocale(masterAmenityId, locale);
      if (!data) return errorResponse('Master amenity translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete master amenity translation locale', error.message);
      return errorResponse('Failed to delete master amenity translation locale');
    }
  }
}

export class MasterRoomViewTranslationService {
  private masterRoomViewTranslationRepository: MasterRoomViewTranslationRepository;

  constructor() {
    this.masterRoomViewTranslationRepository = new MasterRoomViewTranslationRepository();
  }

  public async upsert(
    masterRoomViewId: string,
    localeData: Partial<Record<string, Partial<IMasterRoomViewLocaleBlock>>>
  ): Promise<IApiResponse<IMasterRoomViewTranslation>> {
    try {
      const data = await this.masterRoomViewTranslationRepository.upsert(masterRoomViewId, localeData);
      return successResponse('Master room view translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert master room view translation', error.message);
      return errorResponse('Failed to upsert master room view translation');
    }
  }

  public async getTranslated(
    masterRoomViewId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<IMasterRoomViewLocaleBlock>> {
    try {
      const data = await this.masterRoomViewTranslationRepository.getTranslated(masterRoomViewId, locale);
      if (!data) return errorResponse('Master room view translation not found');
      return successResponse('Master room view translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get master room view translation', error.message);
      return errorResponse('Failed to get master room view translation');
    }
  }

  public async getAllTranslations(
    masterRoomViewId: string
  ): Promise<IApiResponse<Record<string, IMasterRoomViewLocaleBlock>>> {
    try {
      const data = await this.masterRoomViewTranslationRepository.getAllTranslations(masterRoomViewId);
      if (!data) return errorResponse('Master room view translations not found');
      return successResponse('All master room view translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all master room view translations', error.message);
      return errorResponse('Failed to get all master room view translations');
    }
  }

  public async deleteLocale(
    masterRoomViewId: string,
    locale: string
  ): Promise<IApiResponse<IMasterRoomViewTranslation>> {
    try {
      const data = await this.masterRoomViewTranslationRepository.deleteLocale(masterRoomViewId, locale);
      if (!data) return errorResponse('Master room view translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete master room view translation locale', error.message);
      return errorResponse('Failed to delete master room view translation locale');
    }
  }
}
