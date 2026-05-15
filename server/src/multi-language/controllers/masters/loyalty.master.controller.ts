import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { MasterLoyaltyRegistrationFieldTranslationService } from '../../service/masters/loyalty.master.service';

export class MasterLoyaltyRegistrationFieldTranslationController {
  private masterLoyaltyRegistrationFieldTranslationService: MasterLoyaltyRegistrationFieldTranslationService;

  constructor() {
    this.masterLoyaltyRegistrationFieldTranslationService = new MasterLoyaltyRegistrationFieldTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterLoyaltyRegistrationFieldId } = req.params;
      const localeData = req.body;

      const result = await this.masterLoyaltyRegistrationFieldTranslationService.upsert(masterLoyaltyRegistrationFieldId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert loyalty master translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert loyalty master translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterLoyaltyRegistrationFieldId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.masterLoyaltyRegistrationFieldTranslationService.getTranslated(masterLoyaltyRegistrationFieldId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get loyalty master translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get loyalty master translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterLoyaltyRegistrationFieldId } = req.params;

      const result = await this.masterLoyaltyRegistrationFieldTranslationService.getAllTranslations(masterLoyaltyRegistrationFieldId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all loyalty master translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all loyalty master translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { masterLoyaltyRegistrationFieldId, locale } = req.params;

      const result = await this.masterLoyaltyRegistrationFieldTranslationService.deleteLocale(masterLoyaltyRegistrationFieldId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete loyalty master translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete loyalty master translation locale'));
    }
  }
}
