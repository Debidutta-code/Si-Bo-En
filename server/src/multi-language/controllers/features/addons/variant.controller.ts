import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { AddonVariantTranslationService } from '../../../service/features/addons/variant.service';

export class AddonVariantTranslationController {
  private addonVariantTranslationService: AddonVariantTranslationService;

  constructor() {
    this.addonVariantTranslationService = new AddonVariantTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonVariantId } = req.params;
      const localeData = req.body;

      const result = await this.addonVariantTranslationService.upsert(addonVariantId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert addon variant translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert addon variant translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonVariantId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.addonVariantTranslationService.getTranslated(addonVariantId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get addon variant translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get addon variant translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonVariantId } = req.params;

      const result = await this.addonVariantTranslationService.getAllTranslations(addonVariantId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all addon variant translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all addon variant translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { addonVariantId, locale } = req.params;

      const result = await this.addonVariantTranslationService.deleteLocale(addonVariantId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete addon variant translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete addon variant translation locale'));
    }
  }
}
