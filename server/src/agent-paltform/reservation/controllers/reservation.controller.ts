import { Response } from "express";
import { errorResponse } from "../../../utils/return";
import { AgentRequest } from "../../utils";
import { ReservationService } from "../../../reservation/services";

export class AgentBookingController {
    private reservationService: ReservationService;

    constructor() {
        this.reservationService = new ReservationService();
    }

    // public async createAgentBooking(req: AgentRequest, res: Response): Promise<Response> {
    //     try {
    //         const agentId = req.agent?.id;
    //         const agencyId = req.agent?.agencyId;
    //         const agentEmail = req.agent?.agentEmail;

    //         if (!agentId || !agencyId) {
    //             return res.status(401).json(
    //                 errorResponse("Unauthorized", "Agent not authenticated")
    //             );
    //         }

    //         const body = req.body;

    //         // Validate payload structure
    //         if (!body?.data?.bookingDetails) {
    //             return res.status(400).json(errorResponse("Invalid payload - missing bookingDetails"));
    //         }

    //         if (!body?.data?.guestDetails || body.data.guestDetails.length === 0) {
    //             return res.status(400).json(errorResponse("Invalid payload - at least one guest is required"));
    //         }

    //         const { bookingDetails, guestDetails } = body.data;

    //         // Validate required booking fields
    //         if (!bookingDetails.propertyCode) {
    //             return res.status(400).json(errorResponse("Property code is required"));
    //         }
    //         if (!bookingDetails.roomTypeCode) {
    //             return res.status(400).json(errorResponse("Room type code is required"));
    //         }
    //         if (!bookingDetails.ratePlanCode) {
    //             return res.status(400).json(errorResponse("Rate plan code is required"));
    //         }
    //         if (!bookingDetails.startDate || !bookingDetails.endDate) {
    //             return res.status(400).json(errorResponse("Check-in and check-out dates are required"));
    //         }
    //         if (!bookingDetails.email) {
    //             return res.status(400).json(errorResponse("Guest email is required"));
    //         }
    //         if (!bookingDetails.paymentMethod) {
    //             return res.status(400).json(errorResponse("Payment method is required"));
    //         }

    //         // Validate finalPrice exists
    //         if (!bookingDetails.finalPrice) {
    //             return res.status(400).json(errorResponse("Pricing details are required"));
    //         }

    //         // Validate primary guest details
    //         const primaryGuest = guestDetails[0];
    //         if (!primaryGuest.firstName || !primaryGuest.lastName) {
    //             return res.status(400).json(errorResponse("Primary guest first and last name are required"));
    //         }

    //         // Add agency information to the booking
    //         const enhancedPayload = {
    //             ...body,
    //             data: {
    //                 ...body.data,
    //                 bookingDetails: {
    //                     ...bookingDetails,
    //                     bookingSource: "agency" as const, // Set booking source as agency
    //                     agencyId: agencyId, // Add agency ID
    //                     agentEmail: agentEmail, // Track which agent made the booking
    //                 }
    //             }
    //         };


    //         // Call the existing reservation service
    //         // const serviceRes = await this.reservationService.createReservation(enhancedPayload.data);

    //         return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
    //     } catch (error) {
    //         console.error("Controller error:", error);
    //         if (error instanceof Error) {
    //             return res.status(500).json(errorResponse("Failed to create booking", error.message));
    //         }
    //         return res.status(500).json(errorResponse("Failed to create booking"));
    //     }
    // }

    public async getAgentBookings(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;

            if (!agentId || !agencyId) {
                return res.status(401).json(
                    errorResponse("Unauthorized", "Agent not authenticated")
                );
            }

            const { 
                startDate, 
                endDate, 
                page = '1', 
                limit = '10', 
                propertyCode,
                bookingStatus,
                bookingCode
            } = req.query;

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

            if (pageNum < 1 || limitNum < 1) {
                return res.status(400).json(errorResponse("Page and limit must be positive numbers"));
            }

            // TODO: Implement getAgentBookings in ReservationService
            // This would filter reservations by agencyId
            
            return res.status(501).json(errorResponse("Get agent bookings - Not implemented yet"));
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch bookings", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }

    public async cancelAgentBooking(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;
            const {cancellationReason} = req.body;

            if (!agentId || !agencyId) {
                return res.status(401).json(
                    errorResponse("Unauthorized", "Agent not authenticated")
                );
            }

            const { reservationId } = req.params;

            if (!reservationId) {
                return res.status(400).json(errorResponse("Reservation ID is required"));
            }

            const serviceRes = await this.reservationService.deleteReservation(reservationId,cancellationReason);

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to cancel booking", error.message));
            }
            return res.status(500).json(errorResponse("Failed to cancel booking"));
        }
    }

    public async getAgentBookingByCode(req: AgentRequest, res: Response): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;

            if (!agentId || !agencyId) {
                return res.status(401).json(
                    errorResponse("Unauthorized", "Agent not authenticated")
                );
            }

            const { bookingCode, propertyCode } = req.params;

            if (!bookingCode || !propertyCode) {
                return res.status(400).json(errorResponse("Booking code and property code are required"));
            }

            const serviceRes = await this.reservationService.getReservaltionByCode(bookingCode, propertyCode);

            if (!serviceRes.success) {
                return res.status(404).json(serviceRes);
            }

            // TODO: Verify that the booking belongs to this agency
            // if (serviceRes.data.agencyId !== agencyId) {
            //     return res.status(403).json(errorResponse("Access denied to this booking"));
            // }

            return res.status(200).json(serviceRes);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch booking", error.message));
            }
            return res.status(500).json(errorResponse("Failed to fetch booking"));
        }
    }
}