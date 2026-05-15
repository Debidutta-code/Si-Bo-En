import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { PromotionTranslationService } from '../../../service/features/promocodes/promocodes.service';

export class PromotionTranslationController {
  private promotionTranslationService: PromotionTranslationService;

  constructor() {
    this.promotionTranslationService = new PromotionTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promotionId } = req.params;
      const localeData = req.body;

      const result = await this.promotionTranslationService.upsert(promotionId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert promotion translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert promotion translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promotionId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.promotionTranslationService.getTranslated(promotionId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get promotion translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get promotion translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promotionId } = req.params;

      const result = await this.promotionTranslationService.getAllTranslations(promotionId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all promotion translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all promotion translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promotionId, locale } = req.params;

      const result = await this.promotionTranslationService.deleteLocale(promotionId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete promotion translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete promotion translation locale'));
    }
  }
}
