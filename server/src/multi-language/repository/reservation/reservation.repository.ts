import {
  ReservationTranslation,
  IReservationTranslation,
  ILocaleBlock,
} from '../../models/reservation/reservation.model';

export class ReservationTranslationRepository {
  public async upsert(
    reservationId: string,
    localeData: Partial<Record<string, Partial<ILocaleBlock>>>
  ): Promise<IReservationTranslation> {
    try {
      return await ReservationTranslation.upsert(reservationId, localeData);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to upsert reservation translation'
      );
    }
  }

  public async getTranslated(
    reservationId: string,
    locale: string = 'en'
  ): Promise<ILocaleBlock | null> {
    try {
      return await ReservationTranslation.getTranslated(reservationId, locale);
    } catch (error) {
      throw new Error('Failed to get reservation translation');
    }
  }

  public async getAllTranslations(
    reservationId: string
  ): Promise<Record<string, ILocaleBlock> | null> {
    try {
      return await ReservationTranslation.getAllTranslations(reservationId);
    } catch (error) {
      throw new Error('Failed to get all reservation translations');
    }
  }

  public async deleteLocale(
    reservationId: string,
    locale: string
  ): Promise<IReservationTranslation | null> {
    try {
      return await ReservationTranslation.deleteLocale(reservationId, locale);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to delete reservation translation locale'
      );
    }
  }
}
