import { errorResponse, IApiResponse, successResponse } from "../../../utils";
import { OtaReservationRepository } from "../repository";
import { IUpdateReservationPayload } from "../types";

export class OtaReservationService {
    private reservationRepository: OtaReservationRepository;

    constructor() {
        this.reservationRepository = new OtaReservationRepository();
    }

    public async getUserReservations(otaGuestId: string): Promise<IApiResponse> {
        try {
            const reservations = await this.reservationRepository.getUserReservations(otaGuestId);
            return successResponse("User reservations retrieved successfully", reservations);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to retrieve user reservations", error.message);
            }
            return errorResponse("Failed to retrieve user reservations", "Unknown error");
        }
    }

    public async editUserReservation(reservationId: string, otaGuestId: string, data: IUpdateReservationPayload): Promise<IApiResponse> {
        try {
            // Here you could add further validation if needed
            const updatedReservation = await this.reservationRepository.updateUserReservation(reservationId, otaGuestId, data);
            return successResponse("Reservation updated successfully", updatedReservation);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update reservation", error.message);
            }
            return errorResponse("Failed to update reservation", "Unknown error");
        }
    }
}
