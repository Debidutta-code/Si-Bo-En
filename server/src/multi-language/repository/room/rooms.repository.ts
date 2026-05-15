import {
  RoomTranslation,
  IRoomTranslation,
  ILocaleBlock,
} from '../../models/room/rooms.model';

export class RoomTranslationRepository {
  public async upsert(
    roomId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IRoomTranslation> {
    try {
      return await RoomTranslation.upsert(roomId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert room translation'
      );
    }
  }

  public async getTranslated(
    roomId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await RoomTranslation.getTranslated(roomId, locale);
    } catch (error) {
      throw new Error('Failed to get room translation');
    }
  }

  public async getAllTranslations(
    roomId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await RoomTranslation.getAllTranslations(roomId);
    } catch (error) {
      throw new Error('Failed to get all room translations');
    }
  }

  public async deleteLocale(
    roomId: string,
    locale: string
  ): Promise<IRoomTranslation | null> {
    try {
      return await RoomTranslation.deleteLocale(roomId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete room translation locale'
      );
    }
  }
}
