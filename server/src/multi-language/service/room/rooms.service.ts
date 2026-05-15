import { IApiResponse, successResponse, errorResponse } from '../../../utils';
import { RoomTranslationRepository } from '../../repository/room/rooms.repository';
import {
  IRoomTranslation,
  ILocaleBlock,
} from '../../models/room/rooms.model';

export class RoomTranslationService {
  private roomTranslationRepository: RoomTranslationRepository;

  constructor() {
    this.roomTranslationRepository = new RoomTranslationRepository();
  }

  public async upsert(
    roomId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IApiResponse<IRoomTranslation>> {
    try {
      const data = await this.roomTranslationRepository.upsert(roomId, localeData);
      return successResponse('Room translation upserted successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to upsert room translation', error.message);
      return errorResponse('Failed to upsert room translation');
    }
  }

  public async getTranslated(
    roomId: string,
    locale: string = 'en'
  ): Promise<IApiResponse<ILocaleBlock>> {
    try {
      const data = await this.roomTranslationRepository.getTranslated(roomId, locale);
      if (!data) return errorResponse('Room translation not found');
      return successResponse('Room translation fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get room translation', error.message);
      return errorResponse('Failed to get room translation');
    }
  }

  public async getAllTranslations(
    roomId: string
  ): Promise<IApiResponse<Record<string, ILocaleBlock>>> {
    try {
      const data = await this.roomTranslationRepository.getAllTranslations(roomId);
      if (!data) return errorResponse('Room translations not found');
      return successResponse('All room translations fetched successfully', data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to get all room translations', error.message);
      return errorResponse('Failed to get all room translations');
    }
  }

  public async deleteLocale(
    roomId: string,
    locale: string
  ): Promise<IApiResponse<IRoomTranslation>> {
    try {
      const data = await this.roomTranslationRepository.deleteLocale(roomId, locale);
      if (!data) return errorResponse('Room translation not found');
      return successResponse(`Locale '${locale}' deleted successfully`, data);
    } catch (error) {
      if (error instanceof Error) return errorResponse('Failed to delete room translation locale', error.message);
      return errorResponse('Failed to delete room translation locale');
    }
  }
}
