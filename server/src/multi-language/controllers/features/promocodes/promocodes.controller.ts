import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { PromocodeTranslationService } from '../../../service/features/promocodes/promocodes.service';

export class PromocodeTranslationController {
  private promocodeTranslationService: PromocodeTranslationService;

  constructor() {
    this.promocodeTranslationService = new PromocodeTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promocodeId } = req.params;
      const localeData = req.body;

      const result = await this.promocodeTranslationService.upsert(promocodeId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert promocode translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert promocode translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promocodeId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.promocodeTranslationService.getTranslated(promocodeId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get promocode translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get promocode translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promocodeId } = req.params;

      const result = await this.promocodeTranslationService.getAllTranslations(promocodeId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all promocode translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all promocode translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { promocodeId, locale } = req.params;

      const result = await this.promocodeTranslationService.deleteLocale(promocodeId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete promocode translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete promocode translation locale'));
    }
  }
}
