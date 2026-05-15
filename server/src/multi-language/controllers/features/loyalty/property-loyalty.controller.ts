import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { PropertyLoyaltyConfigTranslationService } from '../../../service/features/loyalty/property-loyalty.service';

export class PropertyLoyaltyConfigTranslationController {
  private propertyLoyaltyConfigTranslationService: PropertyLoyaltyConfigTranslationService;

  constructor() {
    this.propertyLoyaltyConfigTranslationService = new PropertyLoyaltyConfigTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyLoyaltyConfigId } = req.params;
      const localeData = req.body;

      const result = await this.propertyLoyaltyConfigTranslationService.upsert(propertyLoyaltyConfigId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert property loyalty config translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert property loyalty config translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyLoyaltyConfigId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.propertyLoyaltyConfigTranslationService.getTranslated(propertyLoyaltyConfigId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get property loyalty config translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get property loyalty config translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyLoyaltyConfigId } = req.params;

      const result = await this.propertyLoyaltyConfigTranslationService.getAllTranslations(propertyLoyaltyConfigId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all property loyalty config translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all property loyalty config translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { propertyLoyaltyConfigId, locale } = req.params;

      const result = await this.propertyLoyaltyConfigTranslationService.deleteLocale(propertyLoyaltyConfigId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete property loyalty config translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete property loyalty config translation locale'));
    }
  }
}
