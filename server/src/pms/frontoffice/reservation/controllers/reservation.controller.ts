import { errorResponse } from "../../../../utils/return";
import { Response } from "express";
import { CustomRequest } from "../../../../utils/customRequest";
import { ReservationService } from "../services";

export class ReservationController {
    private reservationService: ReservationService;
    
    constructor() {
        this.reservationService = new ReservationService();
    }

    public async createReservation(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const body = req.body;

            if (!body?.data?.bookingDetails) {
                return res.status(400).json(errorResponse("Invalid payload - missing bookingDetails"));
            }

            if (!body?.data?.guestDetails || body.data.guestDetails.length === 0) {
                return res.status(400).json(errorResponse("Invalid payload - at least one guest is required"));
            }

            console.log("Creating reservation with data:", JSON.stringify(body.data, null, 2));

            const serviceRes = await this.reservationService.createReservation(body.data);

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error) {
            console.error("Controller error:", error);
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create reservation", error.message));
            }
            return res.status(500).json(errorResponse("Failed to create reservation"));
        }
    }

    public async getReservationByCode(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const reservationCode = req.params.reservationCode;
            
            if (!reservationCode) {
                return res.status(400).json(errorResponse("Reservation code is required"));
            }

            const serRes = await this.reservationService.getReservaltionByCode(reservationCode);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Reservation", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async getReservationsForADate(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;
            const date = req.query.date as string;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property id is required"));
            }
            if (!date) {
                return res.status(400).json(errorResponse("Date is required"));
            }

            const serRes = await this.reservationService.getReservationsForADate(propertyId, new Date(date));
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Reservations", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async getArrivalsForADate(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId as string;
            const date = req.query.date as string;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property id is required"));
            }
            if (!date) {
                return res.status(400).json(errorResponse("Date is required"));
            }

            const serRes = await this.reservationService.getArrivals(propertyId, new Date(date));
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Arrivals", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async getDeparturesForADate(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;
            const date = req.query.date as string;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property id is required"));
            }
            if (!date) {
                return res.status(400).json(errorResponse("Date is required"));
            }

            const serRes = await this.reservationService.getDepartures(propertyId, new Date(date));
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Departures", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async getCheckInsForADate(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId as string;
            const date = req.query.date as string;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property id is required"));
            }
            if (!date) {
                return res.status(400).json(errorResponse("Date is required"));
            }

            const serRes = await this.reservationService.getCheckedInReservations(propertyId, new Date(date));
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Check-Ins", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async getCheckOutsForADate(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId as string;
            const date = req.query.date as string;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property id is required"));
            }
            if (!date) {
                return res.status(400).json(errorResponse("Date is required"));
            }

            const serRes = await this.reservationService.getCheckedOutReservations(propertyId, new Date(date));
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch Check-Outs", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async amendReservation(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const reservationId = req.params.reservationId;
            
            if (!reservationId) {
                return res.status(400).json(errorResponse("Reservation id is required"));
            }

            const newCheckoutDate = req.body.newCheckoutDate;
            if (!newCheckoutDate) {
                return res.status(400).json(errorResponse("New checkout date is required"));
            }

            const serRes = await this.reservationService.amendReservation(reservationId, new Date(newCheckoutDate));
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to amend Reservation", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }

    public async cancelReservation(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const reservationId = req.params.reservationId;
            
            if (!reservationId) {
                return res.status(400).json(errorResponse("Reservation id is required"));
            }

            const serRes = await this.reservationService.deleteReservation(reservationId);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to cancel Reservation", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }
}