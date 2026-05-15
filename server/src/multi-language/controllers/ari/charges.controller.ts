import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { ChargeTranslationService } from '../../service/ari/charges.service';

export class ChargeTranslationController {
  private chargeTranslationService: ChargeTranslationService;

  constructor() {
    this.chargeTranslationService = new ChargeTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { chargeId } = req.params;
      const localeData = req.body;

      const result = await this.chargeTranslationService.upsert(chargeId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert charge translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert charge translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { chargeId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.chargeTranslationService.getTranslated(chargeId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get charge translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get charge translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { chargeId } = req.params;

      const result = await this.chargeTranslationService.getAllTranslations(chargeId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all charge translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all charge translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { chargeId, locale } = req.params;

      const result = await this.chargeTranslationService.deleteLocale(chargeId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete charge translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete charge translation locale'));
    }
  }
}
