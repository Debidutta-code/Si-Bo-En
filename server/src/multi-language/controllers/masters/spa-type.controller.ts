import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import {
  SpaCategoryTranslationService,
  SpaSubCategoryTranslationService,
} from '../../service/masters/spa-type.service';

export class SpaCategoryTranslationController {
  private spaCategoryTranslationService: SpaCategoryTranslationService;

  constructor() {
    this.spaCategoryTranslationService = new SpaCategoryTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaCategoryId } = req.params;
      const localeData = req.body;

      const result = await this.spaCategoryTranslationService.upsert(spaCategoryId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert spa category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert spa category translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaCategoryId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.spaCategoryTranslationService.getTranslated(spaCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get spa category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get spa category translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaCategoryId } = req.params;

      const result = await this.spaCategoryTranslationService.getAllTranslations(spaCategoryId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all spa category translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all spa category translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaCategoryId, locale } = req.params;

      const result = await this.spaCategoryTranslationService.deleteLocale(spaCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete spa category translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete spa category translation locale'));
    }
  }
}

export class SpaSubCategoryTranslationController {
  private spaSubCategoryTranslationService: SpaSubCategoryTranslationService;

  constructor() {
    this.spaSubCategoryTranslationService = new SpaSubCategoryTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaSubCategoryId } = req.params;
      const localeData = req.body;

      const result = await this.spaSubCategoryTranslationService.upsert(spaSubCategoryId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert spa sub-category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert spa sub-category translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaSubCategoryId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.spaSubCategoryTranslationService.getTranslated(spaSubCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get spa sub-category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get spa sub-category translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaSubCategoryId } = req.params;

      const result = await this.spaSubCategoryTranslationService.getAllTranslations(spaSubCategoryId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all spa sub-category translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all spa sub-category translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaSubCategoryId, locale } = req.params;

      const result = await this.spaSubCategoryTranslationService.deleteLocale(spaSubCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete spa sub-category translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete spa sub-category translation locale'));
    }
  }
}
