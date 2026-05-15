import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { CreationTranslationService } from '../../service/core/creation.model.service';

export class CreationTranslationController {
  private creationTranslationService: CreationTranslationService;

  constructor() {
    this.creationTranslationService = new CreationTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { creationId } = req.params;
      const localeData = req.body;

      const result = await this.creationTranslationService.upsert(creationId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert creation translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert creation translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { creationId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.creationTranslationService.getTranslated(creationId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get creation translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get creation translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { creationId } = req.params;

      const result = await this.creationTranslationService.getAllTranslations(creationId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all creation translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all creation translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { creationId, locale } = req.params;

      const result = await this.creationTranslationService.deleteLocale(creationId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete creation translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete creation translation locale'));
    }
  }
}
