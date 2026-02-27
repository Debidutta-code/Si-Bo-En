import { successResponse, errorResponse, toUTC, toUTCDate } from '../../utils';
import { IApiResponse } from '../../utils';
import { BookingOffsetRepository, RatePlanRepository } from '../repository';
import {
    IBookingOffset,
    ICBookingOffsetR,
    ICBookingOffsetS,
    IUBookingOffsetR,
    IUpsertBookingOffsetEntry,
} from '../types';

export class BookingOffsetService {
    private bookingOffsetRepository: BookingOffsetRepository;
    constructor() {
        this.bookingOffsetRepository = new BookingOffsetRepository();
    }
    public async createBookingOffsets(
        bookingOffsets: ICBookingOffsetS,
        propertyId: string,
        ratePlanId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IApiResponse> {
        try {
            const ratePlan =
                await RatePlanRepository.getRateplanById(ratePlanId);
            if (!ratePlan) {
                throw new Error('Rate plan not found');
            }
            const start = toUTCDate(startDate);
            const bookingOffsetsR: ICBookingOffsetR[] = [];
            while (start <= endDate) {
                bookingOffsetsR.push({
                    ...bookingOffsets,
                    propertyId,
                    ratePlanId,
                    ratePlanName: ratePlan.ratePlanName,
                    ratePlanCode: ratePlan.ratePlanCode,
                    date: toUTCDate(start),
                });
                start.setDate(start.getDate() + 1);
            }
            const result =
                await this.bookingOffsetRepository.createBookingOffsets(
                    bookingOffsetsR
                );
            return successResponse(
                'Booking offsets created successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create booking offsets',
                    error.message
                );
            }
            return errorResponse('Failed to create booking offsets');
        }
    }
    public async getBookingOffsets(
        propertyId: string,
        ratePlanId: string,
        startDate: Date | null,
        endDate: Date | null
    ): Promise<IApiResponse> {
        try {
            const result = await this.bookingOffsetRepository.getBookingOffsets(
                propertyId,
                ratePlanId,
                startDate,
                endDate
            );
            return successResponse(
                'Booking offsets fetched successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch booking offsets',
                    error.message
                );
            }
            return errorResponse('Failed to fetch booking offsets');
        }
    }
    public async updateBookingOffsets(
        condition: {
            propertyId: string;
            ratePlanId: string;
            startDate: Date | null;
            endDate: Date | null;
        },
        bookingOffsets: IUBookingOffsetR[]
    ): Promise<IApiResponse> {
        try {
            const result =
                await this.bookingOffsetRepository.updateBookingOffsets(
                    condition,
                    bookingOffsets
                );
            return successResponse(
                'Booking offsets updated successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update booking offsets',
                    error.message
                );
            }
            return errorResponse('Failed to update booking offsets');
        }
    }
    public async deleteBookingOffsets(condition: {
        propertyId: string;
        ratePlanId: string;
        startDate: Date | null;
        endDate: Date | null;
    }): Promise<IApiResponse> {
        try {
            const result =
                await this.bookingOffsetRepository.deleteBookingOffsets(
                    condition
                );
            return successResponse(
                'Booking offsets deleted successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete booking offsets',
                    error.message
                );
            }
            return errorResponse('Failed to delete booking offsets');
        }
    }

    public async updateById(
        id: string,
        bookingOffset: IUBookingOffsetR
    ): Promise<IApiResponse> {
        try {
            const isExist = await this.bookingOffsetRepository.getById(id);
            if (!isExist) {
                return errorResponse('Booking offset not found');
            }
            const result = await this.bookingOffsetRepository.updateById(
                id,
                bookingOffset
            );
            return successResponse(
                'Booking offset updated successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update booking offset',
                    error.message
                );
            }
            return errorResponse('Failed to update booking offset');
        }
    }
    public async deleteById(id: string): Promise<IApiResponse> {
        try {
            const isExist = await this.bookingOffsetRepository.getById(id);
            if (!isExist) {
                return errorResponse('Booking offset not found');
            }
            const result = await this.bookingOffsetRepository.deleteById(id);
            return successResponse(
                'Booking offset deleted successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete booking offset',
                    error.message
                );
            }
            return errorResponse('Failed to delete booking offset');
        }
    }

    public async upsertBookingOffsets(
        propertyId: string,
        ratePlanId: string,
        entries: IUpsertBookingOffsetEntry[]
    ): Promise<IApiResponse> {
        try {
            const ratePlan =
                await RatePlanRepository.getRateplanById(ratePlanId);
            if (!ratePlan) {
                throw new Error('Rate plan not found');
            }

            const results = await Promise.all(
                entries.map(entry => {
                    const { date, ...fields } = entry;
                    return this.bookingOffsetRepository.upsertBookingOffset(
                        ratePlanId,
                        toUTCDate(date),
                        propertyId,
                        ratePlan.ratePlanCode,
                        ratePlan.ratePlanName,
                        fields
                    );
                })
            );

            return successResponse(
                `Booking offsets upserted successfully (${results.length} dates)`,
                results
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to upsert booking offsets',
                    error.message
                );
            }
            return errorResponse('Failed to upsert booking offsets');
        }
    }
}
