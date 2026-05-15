import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import {
  TaxRuleTranslationService,
  TaxGroupTranslationService,
} from '../../../service/features/tax-system/tax-system.service';

export class TaxRuleTranslationController {
  private taxRuleTranslationService: TaxRuleTranslationService;

  constructor() {
    this.taxRuleTranslationService = new TaxRuleTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxRuleId } = req.params;
      const localeData = req.body;

      const result = await this.taxRuleTranslationService.upsert(taxRuleId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert tax rule translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert tax rule translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxRuleId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.taxRuleTranslationService.getTranslated(taxRuleId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get tax rule translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get tax rule translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxRuleId } = req.params;

      const result = await this.taxRuleTranslationService.getAllTranslations(taxRuleId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all tax rule translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all tax rule translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxRuleId, locale } = req.params;

      const result = await this.taxRuleTranslationService.deleteLocale(taxRuleId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete tax rule translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete tax rule translation locale'));
    }
  }
}

export class TaxGroupTranslationController {
  private taxGroupTranslationService: TaxGroupTranslationService;

  constructor() {
    this.taxGroupTranslationService = new TaxGroupTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxGroupId } = req.params;
      const localeData = req.body;

      const result = await this.taxGroupTranslationService.upsert(taxGroupId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert tax group translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert tax group translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxGroupId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.taxGroupTranslationService.getTranslated(taxGroupId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get tax group translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get tax group translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxGroupId } = req.params;

      const result = await this.taxGroupTranslationService.getAllTranslations(taxGroupId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all tax group translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all tax group translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { taxGroupId, locale } = req.params;

      const result = await this.taxGroupTranslationService.deleteLocale(taxGroupId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete tax group translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete tax group translation locale'));
    }
  }
}
