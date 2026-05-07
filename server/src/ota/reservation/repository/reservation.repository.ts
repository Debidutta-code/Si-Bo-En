import { prisma } from "../../../config";
import { IUpdateReservationPayload } from "../types";

export class OtaReservationRepository {
    public async getUserReservations(otaGuestId: string) {
        try {
            return await prisma.reservation.findMany({
                where: {
                    otaGuestId: otaGuestId,
                },
                orderBy: {
                    checkInDate: 'desc',
                },
            });
        } catch (error) {
            throw new Error(`Failed to retrieve OTA user reservations for guest: ${otaGuestId}`);
        }
    }

    public async updateUserReservation(reservationId: string, otaGuestId: string, data: IUpdateReservationPayload) {
        try {
            return await prisma.reservation.update({
                where: {
                    id: reservationId,
                    otaGuestId: otaGuestId, // Ensure the reservation belongs to this guest
                },
                data: {
                    ...(data.bookingStatus && { bookingStatus: data.bookingStatus }),
                    ...(data.cancellationReason && { cancellationReason: data.cancellationReason }),
                    ...(data.guests && { guests: data.guests }),
                    ...(data.bookingUserPhone && { bookingUserPhone: data.bookingUserPhone }),
                    ...(data.bookingUserEmail && { bookingUserEmail: data.bookingUserEmail }),
                },
            });
        } catch (error) {
            throw new Error(`Failed to update OTA user reservation with id: ${reservationId}`);
        }
    }
}
