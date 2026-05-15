import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { AddonCategoryTranslationService } from '../../../service/features/addons/category.service';

export class AddonCategoryTranslationController {
  private addonCategoryTranslationService: AddonCategoryTranslationService;

  constructor() {
    this.addonCategoryTranslationService = new AddonCategoryTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonCategoryId } = req.params;
      const localeData = req.body;

      const result = await this.addonCategoryTranslationService.upsert(addonCategoryId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert addon category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert addon category translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonCategoryId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.addonCategoryTranslationService.getTranslated(addonCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get addon category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get addon category translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonCategoryId } = req.params;

      const result = await this.addonCategoryTranslationService.getAllTranslations(addonCategoryId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all addon category translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all addon category translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonCategoryId, locale } = req.params;

      const result = await this.addonCategoryTranslationService.deleteLocale(addonCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete addon category translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete addon category translation locale'));
    }
  }
}
