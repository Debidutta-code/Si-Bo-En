import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { PropertyTranslationService } from '../../service/property/property.service';

export class PropertyTranslationController {
  private propertyTranslationService: PropertyTranslationService;

  constructor() {
    this.propertyTranslationService = new PropertyTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyId } = req.params;
      const localeData = req.body;

      const result = await this.propertyTranslationService.upsert(propertyId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert property translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert property translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.propertyTranslationService.getTranslated(propertyId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get property translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get property translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyId } = req.params;

      const result = await this.propertyTranslationService.getAllTranslations(propertyId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all property translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all property translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyId, locale } = req.params;

      const result = await this.propertyTranslationService.deleteLocale(propertyId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete property translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete property translation locale'));
    }
  }
}
