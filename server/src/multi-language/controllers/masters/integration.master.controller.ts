import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { MasterIntegrationTranslationService } from '../../service/masters/integration.master.service';

export class MasterIntegrationTranslationController {
  private masterIntegrationTranslationService: MasterIntegrationTranslationService;

  constructor() {
    this.masterIntegrationTranslationService = new MasterIntegrationTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterIntegrationId } = req.params;
      const localeData = req.body;

      const result = await this.masterIntegrationTranslationService.upsert(masterIntegrationId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert master integration translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert master integration translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterIntegrationId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.masterIntegrationTranslationService.getTranslated(masterIntegrationId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get master integration translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get master integration translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterIntegrationId } = req.params;

      const result = await this.masterIntegrationTranslationService.getAllTranslations(masterIntegrationId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all master integration translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all master integration translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterIntegrationId, locale } = req.params;

      const result = await this.masterIntegrationTranslationService.deleteLocale(masterIntegrationId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete master integration translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete master integration translation locale'));
    }
  }
}
