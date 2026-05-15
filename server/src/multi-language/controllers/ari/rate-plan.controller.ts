import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { RatePlanTranslationService } from '../../service/ari/rate-plan.service';

export class RatePlanTranslationController {
  private ratePlanTranslationService: RatePlanTranslationService;

  constructor() {
    this.ratePlanTranslationService = new RatePlanTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { ratePlanId } = req.params;
      const localeData = req.body;

      const result = await this.ratePlanTranslationService.upsert(ratePlanId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert rate plan translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert rate plan translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { ratePlanId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.ratePlanTranslationService.getTranslated(ratePlanId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get rate plan translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get rate plan translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { ratePlanId } = req.params;

      const result = await this.ratePlanTranslationService.getAllTranslations(ratePlanId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all rate plan translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all rate plan translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { ratePlanId, locale } = req.params;

      const result = await this.ratePlanTranslationService.deleteLocale(ratePlanId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete rate plan translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete rate plan translation locale'));
    }
  }
}
