import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { PropertyAddressTranslationService } from '../../service/property/property-address.service';

export class PropertyAddressTranslationController {
  private propertyAddressTranslationService: PropertyAddressTranslationService;

  constructor() {
    this.propertyAddressTranslationService = new PropertyAddressTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyAddressId } = req.params;
      const localeData = req.body;

      const result = await this.propertyAddressTranslationService.upsert(propertyAddressId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert property address translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert property address translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyAddressId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.propertyAddressTranslationService.getTranslated(propertyAddressId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get property address translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get property address translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyAddressId } = req.params;

      const result = await this.propertyAddressTranslationService.getAllTranslations(propertyAddressId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all property address translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all property address translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyAddressId, locale } = req.params;

      const result = await this.propertyAddressTranslationService.deleteLocale(propertyAddressId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete property address translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete property address translation locale'));
    }
  }
}
