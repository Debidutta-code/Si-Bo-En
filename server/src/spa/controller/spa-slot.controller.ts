import { SpaDates, SpaSlotsServ } from '../services';
import { CustomRequest, IApiResponse, errorResponse, toUTC } from '../../utils';
import { Response, Request } from 'express';
import { ICSpaSlotS } from '../types';

export class SpaDateController {
    private spaDateService: SpaDates;

    constructor() {
        this.spaDateService = new SpaDates();
    }
    public async createSpaDate(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaId = req.params.id;
            const data = req.body;
            if (!data || !data.date) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Date is required for creating the spa date'
                        )
                    );
            }
            const date = toUTC(data.date);
            const response = await this.spaDateService.createSpaDate(
                date,
                spaId
            );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create spa date',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to create spa date', 'Unknown error')
                );
        }
    }
    public async getSpaForDateRange(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaId = req.params.id;
            const { startDate, endDate } = req.body;
            if (!startDate || !endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse('Start date and end date are required')
                    );
            }
            const response = await this.spaDateService.getSpaForDateRange(
                spaId,
                toUTC(startDate),
                toUTC(endDate)
            );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch spa dates for range',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to fetch spa dates for range',
                        'Unknown error'
                    )
                );
        }
    }
    public async deleteSpaDate(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaId = req.params.id;
            if (!spaId) {
                return res
                    .status(400)
                    .json(errorResponse('Spa ID is required'));
            }
            const response = await this.spaDateService.deleteDate(spaId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete spa date',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to delete spa date', 'Unknown error')
                );
        }
    }
}

export class SpaSlotController {
    private spaSlotService: SpaSlotsServ;

    constructor() {
        this.spaSlotService = new SpaSlotsServ();
    }
    public async createSlots(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const spaDateId = req.params.id;
            const data: ICSpaSlotS[] = req.body;
            if (!data || !Array.isArray(data) || data.length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Slots are required for creating spa slots'
                        )
                    );
            }
            const response = await this.spaSlotService.createSpaSlots(
                data,
                spaDateId
            );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create spa slots',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to create spa slots', 'Unknown error')
                );
        }
    }
    public async deleteSpaSlot(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const slotId = req.params.id;
            if (!slotId) {
                return res
                    .status(400)
                    .json(errorResponse('Slot ID is required'));
            }
            const response = await this.spaSlotService.deleteSpaSlot(slotId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete spa slot',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to delete spa slot', 'Unknown error')
                );
        }
    }
    public async markSlotAsBooked(
        req: Request,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const slotId = req.params.id;
            const { reservationId, userName } = req.body;
            if (!slotId) {
                return res
                    .status(400)
                    .json(errorResponse('Slot ID is required'));
            }
            if (!reservationId || !userName) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Reservation ID and User Name are required'
                        )
                    );
            }
            const response = await this.spaSlotService.markAsBooked(
                slotId,
                reservationId,
                userName
            );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to mark spa slot as booked',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to mark spa slot as booked',
                        'Unknown error'
                    )
                );
        }
    }
    public async markSlotAsAvailable(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const slotId = req.params.id;
            if (!slotId) {
                return res
                    .status(400)
                    .json(errorResponse('Slot ID is required'));
            }
            const response = await this.spaSlotService.markAsAvailable(slotId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to mark spa slot as available',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to mark spa slot as available',
                        'Unknown error'
                    )
                );
        }
    }
    public async markSlotAsCompleted(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const slotId = req.params.id;
            if (!slotId) {
                return res
                    .status(400)
                    .json(errorResponse('Slot ID is required'));
            }
            const response =
                await this.spaSlotService.markSlotAsCompleted(slotId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to mark spa slot as completed',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to mark spa slot as completed',
                        'Unknown error'
                    )
                );
        }
    }
}
