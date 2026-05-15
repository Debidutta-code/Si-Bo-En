import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { PolicyTranslationService } from '../../service/ari/policy.service';

export class PolicyTranslationController {
  private policyTranslationService: PolicyTranslationService;

  constructor() {
    this.policyTranslationService = new PolicyTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { policyId } = req.params;
      const localeData = req.body;

      const result = await this.policyTranslationService.upsert(policyId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert policy translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert policy translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { policyId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.policyTranslationService.getTranslated(policyId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get policy translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get policy translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { policyId } = req.params;

      const result = await this.policyTranslationService.getAllTranslations(policyId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all policy translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all policy translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { policyId, locale } = req.params;

      const result = await this.policyTranslationService.deleteLocale(policyId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete policy translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete policy translation locale'));
    }
  }
}
