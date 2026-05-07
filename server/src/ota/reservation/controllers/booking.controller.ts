import { Response } from "express";
import { errorResponse, IApiResponse, IOtaCustomRequest } from "../../../utils";
import { OtaReservationService } from "../services";
import { IUpdateReservationPayload } from "../types";

export class OtaBookingController {
    private reservationService: OtaReservationService;

    constructor() {
        this.reservationService = new OtaReservationService();
    }

    public getUserReservations = async (req: IOtaCustomRequest, res: Response): Promise<Response<IApiResponse>> => {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res.status(401).json(errorResponse("Authorization failed, Login again", "User not found"));
            }

            const result = await this.reservationService.getUserReservations(otaUser.id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch user reservations", error.message));
            }
            return res.status(500).json(errorResponse("Failed to fetch user reservations", "Unknown error"));
        }
    }

    public editUserReservation = async (req: IOtaCustomRequest, res: Response): Promise<Response<IApiResponse>> => {
        try {
            const otaUser = req.otaUser;
            if (!otaUser) {
                return res.status(401).json(errorResponse("Authorization failed, Login again", "User not found"));
            }

            const reservationId = req.params.id;
            const payload: IUpdateReservationPayload = req.body;

            if (!reservationId) {
                return res.status(400).json(errorResponse("Reservation ID is required", "Missing parameter"));
            }

            const result = await this.reservationService.editUserReservation(reservationId, otaUser.id, payload);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update reservation", error.message));
            }
            return res.status(500).json(errorResponse("Failed to update reservation", "Unknown error"));
        }
    }
}
