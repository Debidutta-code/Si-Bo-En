import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { AddonTranslationService } from '../../../service/features/addons/addon.service';

export class AddonTranslationController {
  private addonTranslationService: AddonTranslationService;

  constructor() {
    this.addonTranslationService = new AddonTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonId } = req.params;
      const localeData = req.body;

      const result = await this.addonTranslationService.upsert(addonId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert addon translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert addon translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.addonTranslationService.getTranslated(addonId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get addon translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get addon translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonId } = req.params;

      const result = await this.addonTranslationService.getAllTranslations(addonId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all addon translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all addon translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonId, locale } = req.params;

      const result = await this.addonTranslationService.deleteLocale(addonId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete addon translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete addon translation locale'));
    }
  }
}
