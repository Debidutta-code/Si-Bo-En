import { Response } from 'express';
import { CustomRequest, errorResponse } from '../../../utils';
import { RoomTranslationService } from '../../service/room/rooms.service';

export class RoomTranslationController {
  private roomTranslationService: RoomTranslationService;

  constructor() {
    this.roomTranslationService = new RoomTranslationService();
  }

  public async upsert(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { roomId } = req.params;
      const localeData = req.body;

      const result = await this.roomTranslationService.upsert(roomId, localeData);
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to upsert room translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to upsert room translation'));
    }
  }

  public async getTranslated(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { roomId } = req.params;
      const locale =
        (req.query.locale as string) ??
        req.headers['accept-language']?.slice(0, 2) ??
        'en';

      const result = await this.roomTranslationService.getTranslated(roomId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get room translation', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get room translation'));
    }
  }

  public async getAllTranslations(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { roomId } = req.params;

      const result = await this.roomTranslationService.getAllTranslations(roomId);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to get all room translations', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to get all room translations'));
    }
  }

  public async deleteLocale(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { roomId, locale } = req.params;

      const result = await this.roomTranslationService.deleteLocale(roomId, locale);
      return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json(errorResponse('Failed to delete room translation locale', error.message));
      }
      return res.status(500).json(errorResponse('Internal Server Error', 'Failed to delete room translation locale'));
    }
  }
}
