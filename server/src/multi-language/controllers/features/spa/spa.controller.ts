import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { SpaTranslationService } from '../../../service/features/spa/spa.service';

export class SpaTranslationController {
  private spaTranslationService: SpaTranslationService;

  constructor() {
    this.spaTranslationService = new SpaTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaId } = req.params;
      const localeData = req.body;

      const result = await this.spaTranslationService.upsert(spaId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert spa translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert spa translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.spaTranslationService.getTranslated(spaId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get spa translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get spa translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaId } = req.params;

      const result = await this.spaTranslationService.getAllTranslations(spaId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all spa translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all spa translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { spaId, locale } = req.params;

      const result = await this.spaTranslationService.deleteLocale(spaId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete spa translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete spa translation locale'));
    }
  }
}
