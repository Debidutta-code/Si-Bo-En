import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import {
  MasterPropertyCategoryTranslationService,
  MasterPropertyTypeTranslationService,
  MasterAmenityTranslationService,
  MasterRoomViewTranslationService,
} from '../../service/property/property-masters.service';

export class MasterPropertyCategoryTranslationController {
  private masterPropertyCategoryTranslationService: MasterPropertyCategoryTranslationService;

  constructor() {
    this.masterPropertyCategoryTranslationService = new MasterPropertyCategoryTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyCategoryId } = req.params;
      const localeData = req.body;

      const result = await this.masterPropertyCategoryTranslationService.upsert(masterPropertyCategoryId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert master property category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert master property category translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyCategoryId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.masterPropertyCategoryTranslationService.getTranslated(masterPropertyCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get master property category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get master property category translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyCategoryId } = req.params;

      const result = await this.masterPropertyCategoryTranslationService.getAllTranslations(masterPropertyCategoryId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all master property category translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all master property category translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyCategoryId, locale } = req.params;

      const result = await this.masterPropertyCategoryTranslationService.deleteLocale(masterPropertyCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete master property category translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete master property category translation locale'));
    }
  }
}

export class MasterPropertyTypeTranslationController {
  private masterPropertyTypeTranslationService: MasterPropertyTypeTranslationService;

  constructor() {
    this.masterPropertyTypeTranslationService = new MasterPropertyTypeTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyTypeId } = req.params;
      const localeData = req.body;

      const result = await this.masterPropertyTypeTranslationService.upsert(masterPropertyTypeId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert master property type translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert master property type translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyTypeId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.masterPropertyTypeTranslationService.getTranslated(masterPropertyTypeId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get master property type translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get master property type translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyTypeId } = req.params;

      const result = await this.masterPropertyTypeTranslationService.getAllTranslations(masterPropertyTypeId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all master property type translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all master property type translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterPropertyTypeId, locale } = req.params;

      const result = await this.masterPropertyTypeTranslationService.deleteLocale(masterPropertyTypeId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete master property type translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete master property type translation locale'));
    }
  }
}

export class MasterAmenityTranslationController {
  private masterAmenityTranslationService: MasterAmenityTranslationService;

  constructor() {
    this.masterAmenityTranslationService = new MasterAmenityTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterAmenityId } = req.params;
      const localeData = req.body;

      const result = await this.masterAmenityTranslationService.upsert(masterAmenityId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert master amenity translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert master amenity translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterAmenityId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.masterAmenityTranslationService.getTranslated(masterAmenityId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get master amenity translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get master amenity translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterAmenityId } = req.params;

      const result = await this.masterAmenityTranslationService.getAllTranslations(masterAmenityId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all master amenity translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all master amenity translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterAmenityId, locale } = req.params;

      const result = await this.masterAmenityTranslationService.deleteLocale(masterAmenityId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete master amenity translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete master amenity translation locale'));
    }
  }
}

export class MasterRoomViewTranslationController {
  private masterRoomViewTranslationService: MasterRoomViewTranslationService;

  constructor() {
    this.masterRoomViewTranslationService = new MasterRoomViewTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterRoomViewId } = req.params;
      const localeData = req.body;

      const result = await this.masterRoomViewTranslationService.upsert(masterRoomViewId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert master room view translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert master room view translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterRoomViewId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.masterRoomViewTranslationService.getTranslated(masterRoomViewId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get master room view translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get master room view translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterRoomViewId } = req.params;

      const result = await this.masterRoomViewTranslationService.getAllTranslations(masterRoomViewId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all master room view translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all master room view translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterRoomViewId, locale } = req.params;

      const result = await this.masterRoomViewTranslationService.deleteLocale(masterRoomViewId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete master room view translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete master room view translation locale'));
    }
  }
}
