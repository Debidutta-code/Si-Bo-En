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

   public async updateReservation(req: CustomRequest, res: Response): Promise<Response> {
    try {
        const reservationCode = req.params.reservationCode;
        const updateData = req.body;

        if (!reservationCode) {
            return res.status(400).json(errorResponse("Reservation code is required"));
        }

        if (!updateData) {
            return res.status(400).json(errorResponse("Update data is required"));
        }

        // Validate required fields
        if (!updateData.propertyCode || !updateData.checkInDate || !updateData.checkOutDate) {
            return res.status(400).json(errorResponse("Missing required fields: propertyCode, checkInDate, checkOutDate"));
        }

        console.log("Updating reservation:", reservationCode, "with data:", JSON.stringify(updateData, null, 2));

        const serviceRes = await this.reservationService.updateReservation(reservationCode, updateData);

        return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
    } catch (error) {
        console.error("Controller error updating reservation:", error);
        if (error instanceof Error) {
            return res.status(500).json(errorResponse("Failed to update reservation", error.message));
        }
        return res.status(500).json(errorResponse("Failed to update reservation"));
    }
} 

public async getReservationsForADate(req: CustomRequest, res: Response): Promise<Response> {
    try {
        // Check user authentication and creation assignment
        if (!req.user?.creationId || req.user.level === undefined) {
            return res.status(400).json(errorResponse("User is not assigned to any creation", "Creation ID not found"));
        }

        const { startDate, endDate, page = '1', limit = '10', propertyId, propertyCode, bookingStatus } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(errorResponse("Start date and end date are required"));
        }

        // Validate dates
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json(errorResponse("Invalid date format"));
        }
        
        if (start > end) {
            return res.status(400).json(errorResponse("Start date must be before end date"));
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json(errorResponse("Page and limit must be positive numbers"));
        }

        const serRes = await this.reservationService.getReservationsForDateRange(
            req.user.creationId,
            req.user.level,
            start, 
            end,
            pageNum,
            limitNum,
            propertyId?.toString(),
            propertyCode?.toString(),
            bookingStatus?.toString() // <-- Add this parameter
        );
        
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
        if (!req.user?.creationId || req.user.level === undefined) {
            return res.status(400).json(errorResponse("User is not assigned to any creation"));
        }

        const { startDate, endDate, page = '1', limit = '10', propertyId, propertyCode ,bookingStatus } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(errorResponse("Start date and end date are required"));
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json(errorResponse("Invalid date format"));
        }
        
        if (start > end) {
            return res.status(400).json(errorResponse("Start date must be before end date"));
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const serRes = await this.reservationService.getArrivals(
            req.user.creationId,
            req.user.level,
            start,
            end,
            pageNum,
            limitNum,
            propertyId?.toString(),
            propertyCode?.toString(),
            bookingStatus?.toString(),
        );
        
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
        if (!req.user?.creationId || req.user.level === undefined) {
            return res.status(400).json(errorResponse("User is not assigned to any creation"));
        }

        const { startDate, endDate, page = '1', limit = '10', propertyId, propertyCode,bookingStatus } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(errorResponse("Start date and end date are required"));
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json(errorResponse("Invalid date format"));
        }
        
        if (start > end) {
            return res.status(400).json(errorResponse("Start date must be before end date"));
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const serRes = await this.reservationService.getDepartures(
            req.user.creationId,
            req.user.level,
            start,
            end,
            pageNum,
            limitNum,
            propertyId?.toString(),
            propertyCode?.toString(),
            bookingStatus?.toString()
        );
        
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
        if (!req.user?.creationId || req.user.level === undefined) {
            return res.status(400).json(errorResponse("User is not assigned to any creation"));
        }

        const { startDate, endDate, page = '1', limit = '10', propertyId, propertyCode } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(errorResponse("Start date and end date are required"));
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json(errorResponse("Invalid date format"));
        }
        
        if (start > end) {
            return res.status(400).json(errorResponse("Start date must be before end date"));
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const serRes = await this.reservationService.getCheckedInReservations(
            req.user.creationId,
            req.user.level,
            start,
            end,
            pageNum,
            limitNum,
            propertyId?.toString(),
            propertyCode?.toString()
        );
        
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
        if (!req.user?.creationId || req.user.level === undefined) {
            return res.status(400).json(errorResponse("User is not assigned to any creation"));
        }

        const { startDate, endDate, page = '1', limit = '10', propertyId, propertyCode } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json(errorResponse("Start date and end date are required"));
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json(errorResponse("Invalid date format"));
        }
        
        if (start > end) {
            return res.status(400).json(errorResponse("Start date must be before end date"));
        }

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const serRes = await this.reservationService.getCheckedOutReservations(
            req.user.creationId,
            req.user.level,
            start,
            end,
            pageNum,
            limitNum,
            propertyId?.toString(),
            propertyCode?.toString()
        );
        
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
    public async noShowReservation(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const reservationId = req.params.reservationId;
            
            if (!reservationId) {
                return res.status(400).json(errorResponse("Reservation id is required"));
            }

            const serRes = await this.reservationService.noShowReservation(reservationId);
            return res.status(serRes.success ? 200 : 400).json(serRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to no show Reservation", error.message));
            }
            return res.status(500).json(errorResponse("Internal server Error"));
        }
    }
}