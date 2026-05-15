import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { AddonSubCategoryTranslationService } from '../../../service/features/addons/sub-catrgory.service';

export class AddonSubCategoryTranslationController {
  private addonSubCategoryTranslationService: AddonSubCategoryTranslationService;

  constructor() {
    this.addonSubCategoryTranslationService = new AddonSubCategoryTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonSubCategoryId } = req.params;
      const localeData = req.body;

      const result = await this.addonSubCategoryTranslationService.upsert(addonSubCategoryId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert addon sub-category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert addon sub-category translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonSubCategoryId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.addonSubCategoryTranslationService.getTranslated(addonSubCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get addon sub-category translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get addon sub-category translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonSubCategoryId } = req.params;

      const result = await this.addonSubCategoryTranslationService.getAllTranslations(addonSubCategoryId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all addon sub-category translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all addon sub-category translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonSubCategoryId, locale } = req.params;

      const result = await this.addonSubCategoryTranslationService.deleteLocale(addonSubCategoryId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete addon sub-category translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete addon sub-category translation locale'));
    }
  }
}
