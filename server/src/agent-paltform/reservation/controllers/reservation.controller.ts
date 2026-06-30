import { Response } from 'express';
import { errorResponse } from '../../../utils/return';
import { AgentRequest } from '../../utils';
import { NewReservationService } from '../../../reservation/services';

export class AgentBookingController {
    private reservationService: NewReservationService;

    constructor() {
        this.reservationService = new NewReservationService();
    }

    public async getAgentBookings(
        req: AgentRequest,
        res: Response
    ): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;

            if (!agentId || !agencyId) {
                return res
                    .status(401)
                    .json(
                        errorResponse('Unauthorized', 'Agent not authenticated')
                    );
            }

            const {
                startDate,
                endDate,
                page = '1',
                limit = '10',
            } = req.query;

            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start date and end date are required')
                    );
            }

            const start = new Date(startDate as string);
            const end = new Date(endDate as string);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res
                    .status(400)
                    .json(errorResponse('Invalid date format'));
            }

            if (start > end) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);

            if (pageNum < 1 || limitNum < 1) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Page and limit must be positive numbers')
                    );
            }
            return res
                .status(501)
                .json(
                    errorResponse('Get agent bookings - Not implemented yet')
                );
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch bookings', error.message)
                    );
            }
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }

    public async cancelAgentBooking(
        req: AgentRequest,
        res: Response
    ): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;
            const { cancellationReason } = req.body;

            if (!agentId || !agencyId) {
                return res
                    .status(401)
                    .json(
                        errorResponse('Unauthorized', 'Agent not authenticated')
                    );
            }

            const { reservationId } = req.params;

            if (!reservationId) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation ID is required'));
            }

            const serviceRes = await this.reservationService.deleteReservation(
                reservationId,
                cancellationReason
            );

            return res.status(serviceRes.success ? 200 : 400).json(serviceRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to cancel booking', error.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to cancel booking'));
        }
    }

    public async getAgentBookingByCode(
        req: AgentRequest,
        res: Response
    ): Promise<Response> {
        try {
            const agentId = req.agent?.id;
            const agencyId = req.agent?.agencyId;

            if (!agentId || !agencyId) {
                return res
                    .status(401)
                    .json(
                        errorResponse('Unauthorized', 'Agent not authenticated')
                    );
            }

            const { bookingCode, propertyCode } = req.params;

            if (!bookingCode || !propertyCode) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Booking code and property code are required'
                        )
                    );
            }

            const serviceRes =
                await this.reservationService.getReservaltionByCode(
                    bookingCode,
                    propertyCode
                );

            if (!serviceRes.success) {
                return res.status(404).json(serviceRes);
            }

            return res.status(200).json(serviceRes);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to fetch booking', error.message)
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to fetch booking'));
        }
    }
}