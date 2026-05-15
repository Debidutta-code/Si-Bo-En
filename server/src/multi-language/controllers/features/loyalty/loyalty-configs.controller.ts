import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import {
  LoyaltyConditionsTranslationService,
  LoyaltySpecialConditionTranslationService,
} from '../../../service/features/loyalty/loyalty-configs.service';

export class LoyaltyConditionsTranslationController {
  private loyaltyConditionsTranslationService: LoyaltyConditionsTranslationService;

  constructor() {
    this.loyaltyConditionsTranslationService = new LoyaltyConditionsTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltyConditionId } = req.params;
      const localeData = req.body;

      const result = await this.loyaltyConditionsTranslationService.upsert(loyaltyConditionId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert loyalty condition translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert loyalty condition translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltyConditionId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.loyaltyConditionsTranslationService.getTranslated(loyaltyConditionId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get loyalty condition translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get loyalty condition translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltyConditionId } = req.params;

      const result = await this.loyaltyConditionsTranslationService.getAllTranslations(loyaltyConditionId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all loyalty condition translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all loyalty condition translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltyConditionId, locale } = req.params;

      const result = await this.loyaltyConditionsTranslationService.deleteLocale(loyaltyConditionId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete loyalty condition translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete loyalty condition translation locale'));
    }
  }
}

export class LoyaltySpecialConditionTranslationController {
  private loyaltySpecialConditionTranslationService: LoyaltySpecialConditionTranslationService;

  constructor() {
    this.loyaltySpecialConditionTranslationService = new LoyaltySpecialConditionTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltySpecialConditionId } = req.params;
      const localeData = req.body;

      const result = await this.loyaltySpecialConditionTranslationService.upsert(loyaltySpecialConditionId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert loyalty special condition translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert loyalty special condition translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltySpecialConditionId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.loyaltySpecialConditionTranslationService.getTranslated(loyaltySpecialConditionId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get loyalty special condition translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get loyalty special condition translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltySpecialConditionId } = req.params;

      const result = await this.loyaltySpecialConditionTranslationService.getAllTranslations(loyaltySpecialConditionId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all loyalty special condition translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all loyalty special condition translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { loyaltySpecialConditionId, locale } = req.params;

      const result = await this.loyaltySpecialConditionTranslationService.deleteLocale(loyaltySpecialConditionId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete loyalty special condition translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete loyalty special condition translation locale'));
    }
  }
}
