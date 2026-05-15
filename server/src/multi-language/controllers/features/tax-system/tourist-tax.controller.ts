import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../../utils';
import { TouristTaxTranslationService } from '../../../service/features/tax-system/tourist-tax.service';

export class TouristTaxTranslationController {
  private touristTaxTranslationService: TouristTaxTranslationService;

  constructor() {
    this.touristTaxTranslationService = new TouristTaxTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { touristTaxId } = req.params;
      const localeData = req.body;

      const result = await this.touristTaxTranslationService.upsert(touristTaxId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert tourist tax translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert tourist tax translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { touristTaxId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.touristTaxTranslationService.getTranslated(touristTaxId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get tourist tax translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get tourist tax translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { touristTaxId } = req.params;

      const result = await this.touristTaxTranslationService.getAllTranslations(touristTaxId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all tourist tax translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all tourist tax translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { touristTaxId, locale } = req.params;

      const result = await this.touristTaxTranslationService.deleteLocale(touristTaxId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete tourist tax translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete tourist tax translation locale'));
    }
  }
}
