import { Response } from 'express';
import { CustomRequest, errorResponse, toUTCDate } from '../../utils';
import { BookingOffsetService } from '../services';
import {
    IBookingOffset,
    ICBookingOffsetS,
    IUBookingOffsetR,
    IUpsertBookingOffsetEntry,
} from '../types/booking-offset.types';
import { PropertyCustomRequest } from '../../utils';
export class BookingOffsetController {
    private bookingOffsetService: BookingOffsetService;
    constructor() {
        this.bookingOffsetService = new BookingOffsetService();
    }
    public async createBookingOffsets(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const {
                bookingOffsets,
                ratePlanId,
                startDate,
                endDate,
            }: {
                bookingOffsets: ICBookingOffsetS;
                ratePlanId: string;
                startDate: Date;
                endDate: Date;
            } = req.body;
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property identifier not found'));
            }
            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan identifier not found'));
            }
            if (!startDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Start date required to create booking offsets'
                        )
                    );
            }
            if (!endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'End date required to create booking offsets'
                        )
                    );
            }
            const result = await this.bookingOffsetService.createBookingOffsets(
                bookingOffsets,
                propertyId,
                ratePlanId,
                toUTCDate(startDate),
                toUTCDate(endDate)
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create booking offsets'));
        }
    }
    public async getBookingOffsets(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { ratePlanId, startDate, endDate } = req.query;
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property identifier not found'));
            }
            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan identifier not found'));
            }

            if (
                startDate &&
                endDate &&
                toUTCDate(startDate as string) > toUTCDate(endDate as string)
            ) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }
            const result = await this.bookingOffsetService.getBookingOffsets(
                propertyId,
                ratePlanId as string,
                startDate ? toUTCDate(startDate as string) : null,
                endDate ? toUTCDate(endDate as string) : null
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to fetch booking offsets'));
        }
    }
    public async updateBookingOffsets(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { bookingOffsets, ratePlanId, startDate, endDate } = req.body;
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property identifier not found'));
            }
            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan identifier not found'));
            }
            if (!startDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Start date required to update booking offsets'
                        )
                    );
            }
            if (!endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'End date required to update booking offsets'
                        )
                    );
            }
            if (toUTCDate(startDate) > toUTCDate(endDate)) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }
            const result = await this.bookingOffsetService.updateBookingOffsets(
                {
                    propertyId,
                    ratePlanId,
                    startDate: toUTCDate(startDate),
                    endDate: toUTCDate(endDate),
                },
                bookingOffsets
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to update booking offsets'));
        }
    }
    public async deleteBookingOffsets(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { ratePlanId, startDate, endDate } = req.query;
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property identifier not found'));
            }
            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan identifier not found'));
            }
            if (!startDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Start date required to delete booking offsets'
                        )
                    );
            }
            if (!endDate) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'End date required to delete booking offsets'
                        )
                    );
            }
            if (toUTCDate(startDate as string) > toUTCDate(endDate as string)) {
                return res
                    .status(400)
                    .json(errorResponse('Start date must be before end date'));
            }
            const result = await this.bookingOffsetService.deleteBookingOffsets(
                {
                    propertyId,
                    ratePlanId: ratePlanId as string,
                    startDate: toUTCDate(startDate as string),
                    endDate: toUTCDate(endDate as string),
                }
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete booking offsets'));
        }
    }

    public async updateById(req: CustomRequest, res: Response) {
        try {
            const {
                id,
                bookingOffsets,
            }: { id: string; bookingOffsets: IUBookingOffsetR } = req.body;

            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Booking offset identifier not found'));
            }
            if (!bookingOffsets) {
                return res
                    .status(400)
                    .json(errorResponse('Booking offsets required to update'));
            }
            const result = await this.bookingOffsetService.updateById(
                id,
                bookingOffsets
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to update booking offsets'));
        }
    }
    public async deleteById(req: CustomRequest, res: Response) {
        try {
            const { id } = req.params;

            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Booking offset identifier not found'));
            }
            const result = await this.bookingOffsetService.deleteById(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete booking offsets'));
        }
    }

    public async upsertBookingOffsets(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const {
                ratePlanId,
                entries,
            }: {
                ratePlanId: string;
                entries: IUpsertBookingOffsetEntry[];
            } = req.body;
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property identifier not found'));
            }
            if (!ratePlanId) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan identifier not found'));
            }
            if (!entries || !Array.isArray(entries) || entries.length === 0) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Entries array is required and must not be empty'
                        )
                    );
            }
            const result = await this.bookingOffsetService.upsertBookingOffsets(
                propertyId,
                ratePlanId,
                entries
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to upsert booking offsets',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to upsert booking offsets'));
        }
    }
}
