import { Response } from "express";
import { AgentRequest } from "../../utils";
import { errorResponse } from "../../../utils";
import { ReservationService } from "../services";
import { IReservationFilters, ICancelReservationPayload } from "../types";
import { BookingSource, BookingStatus } from "../../../reservation/types/reservation.type";

export class ReservationController {
    private reservationService: ReservationService;

    constructor() {
        this.reservationService = new ReservationService();
    }

    public async getReservations(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const {
                bookingStatus,
                bookingSource,
                propertyId,
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                checkInDateFrom,
                checkInDateTo,
                checkOutDateFrom,
                checkOutDateTo,
                bookingCode,
                guestEmail,
                guestPhone,
                page,
                limit,
                sortBy,
                sortOrder
            } = req.query;

            const filters: IReservationFilters = {
                ...(bookingStatus && { bookingStatus: bookingStatus as BookingStatus }),
                ...(bookingSource && { bookingSource: bookingSource as BookingSource }),
                ...(propertyId && { propertyId: propertyId as string }),
                ...(propertyCode && { propertyCode: propertyCode as string }),
                ...(roomTypeCode && { roomTypeCode: roomTypeCode as string }),
                ...(ratePlanCode && { ratePlanCode: ratePlanCode as string }),
                ...(checkInDateFrom && { checkInDateFrom: new Date(checkInDateFrom as string) }),
                ...(checkInDateTo && { checkInDateTo: new Date(checkInDateTo as string) }),
                ...(checkOutDateFrom && { checkOutDateFrom: new Date(checkOutDateFrom as string) }),
                ...(checkOutDateTo && { checkOutDateTo: new Date(checkOutDateTo as string) }),
                ...(bookingCode && { bookingCode: bookingCode as string }),
                ...(guestEmail && { guestEmail: guestEmail as string }),
                ...(guestPhone && { guestPhone: guestPhone as string }),
                ...(page && { page: parseInt(page as string) }),
                ...(limit && { limit: parseInt(limit as string) }),
                ...(sortBy && { sortBy: sortBy as string }),
                ...(sortOrder && { sortOrder: sortOrder as 'asc' | 'desc' })
            };

            const result = await this.reservationService.getReservations(agencyId, filters);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }

    public async getReservationById(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const { reservationId } = req.params;
            if (!reservationId) {
                return res.status(400).json(errorResponse("Bad Request", "Reservation ID is required"));
            }

            const result = await this.reservationService.getReservationById(reservationId, agencyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }

    public async getReservationByBookingCode(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const { bookingCode } = req.params;
            if (!bookingCode) {
                return res.status(400).json(errorResponse("Bad Request", "Booking code is required"));
            }

            const result = await this.reservationService.getReservationByBookingCode(bookingCode, agencyId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }

    public async cancelReservation(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const { reservationId } = req.params;
            if (!reservationId) {
                return res.status(400).json(errorResponse("Bad Request", "Reservation ID is required"));
            }

            const payload: ICancelReservationPayload = req.body;

            const result = await this.reservationService.cancelReservation(reservationId, agencyId, payload);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }

    public async getReservationStats(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const result = await this.reservationService.getReservationStats(agencyId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }

    public async getUpcomingArrivals(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const { days } = req.query;
            const daysNumber = days ? parseInt(days as string) : 7;

            if (isNaN(daysNumber) || daysNumber < 1) {
                return res.status(400).json(errorResponse("Bad Request", "Days must be a positive number"));
            }

            const result = await this.reservationService.getUpcomingArrivals(agencyId, daysNumber);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }

    public async getUpcomingDepartures(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agencyId = req.agent?.agencyId;
            if (!agencyId) {
                return res.status(401).json(errorResponse("Unauthorized", "Agency ID not found"));
            }

            const { days } = req.query;
            const daysNumber = days ? parseInt(days as string) : 7;

            if (isNaN(daysNumber) || daysNumber < 1) {
                return res.status(400).json(errorResponse("Bad Request", "Days must be a positive number"));
            }

            const result = await this.reservationService.getUpcomingDepartures(agencyId, daysNumber);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Internal Server Error", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error", "An unexpected error occurred"));
        }
    }
}
