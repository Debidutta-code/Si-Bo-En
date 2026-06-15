import {
    IApiResponse,
    successResponse,
    errorResponse,
    toUTC,
} from '../../utils';
import { SpaDatesRepo, SpaSlotsRepo } from '../repository';
import { ICSpaDatesR, ICSpaDatesS, ICSpaSlotBatch, ICSpaSlotS } from '../types/spa-slot.type';
import { SpaPricingService } from './spa-pricing.service';

export class SpaDates {
    private spaDatesRepo: SpaDatesRepo;

    constructor() {
        this.spaDatesRepo = new SpaDatesRepo();
    }
    public async createSpaDates(
        dates: Date[],
        spaModuleId: string
    ): Promise<IApiResponse> {
        try {
            const existing = await this.spaDatesRepo.getSpaForDates(spaModuleId, dates);
            const existingDateTimes = new Set(
                existing.map((d) => d.date.toISOString())
            );

            const newDates = dates.filter(
                (d) => !existingDateTimes.has(d.toISOString())
            );

            if (newDates.length === 0) {
                return errorResponse(
                    'All provided dates already exist for this spa',
                    'Duplicate dates'
                );
            }

            const result = await this.spaDatesRepo.createManyDates(
                newDates.map((date) => ({ spaModuleId, date }))
            );

            const skipped = dates.length - newDates.length;

            return successResponse(
                `${result.count} date(s) created successfully${skipped > 0 ? `, ${skipped} skipped (already exist)` : ''}`,
                { created: result.count, skipped }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create spa dates', error.message);
            }
            return errorResponse('Failed to create spa dates', 'Unknown error');
        }
    }
    public async getSpaForDateRange(
        spaId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IApiResponse> {
        try {
            const spaDates = await this.spaDatesRepo.getForDateRange(
                spaId,
                startDate,
                endDate
            );
            return successResponse('Fetched spa dates successfully', spaDates);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch spa dates for range',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch spa dates for range',
                'Unknown error'
            );
        }
    }
    public async deleteDate(id: string): Promise<IApiResponse> {
        try {
            const isExists = await this.spaDatesRepo.getDateById(id);
            if (!isExists) {
                return errorResponse(
                    'Spa date does not exist',
                    'Spa date not found'
                );
            }
            const deletedDate = await this.spaDatesRepo.deleteDate(id);
            return successResponse(
                'Deleted spa date successfully',
                deletedDate
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete spa date',
                    error.message
                );
            }
            return errorResponse('Failed to delete spa date', 'Unknown error');
        }
    }
}

export class SpaSlotsServ {
    private spaSlotsRepo: SpaSlotsRepo;
    private spaDatesRepo: SpaDatesRepo;
    private spaPricingService: SpaPricingService;
    private spaDatesService: SpaDates;

    constructor() {
        this.spaSlotsRepo = new SpaSlotsRepo();
        this.spaDatesRepo = new SpaDatesRepo();
        this.spaPricingService = new SpaPricingService();
        this.spaDatesService = new SpaDates();

    }
    public async createManySlots(
        slots: ICSpaSlotBatch[],
        spaModuleId: string
    ): Promise<IApiResponse> {
        try {
            const uniqueDateIds = [...new Set(slots.map((s) => s.spaDateId))];

            for (const spaDateId of uniqueDateIds) {
                const exists = await this.spaDatesRepo.getDateById(spaDateId);
                if (!exists) {
                    const createRes = await this.spaDatesService.createSpaDates(
                        [new Date()], // fallback, ideally never hit
                        spaModuleId
                    );
                    if (!createRes.success) {
                        return errorResponse(
                            `Spa date ${spaDateId} does not exist and could not be created`,
                            'Date not found'
                        );
                    }
                }
            }

            for (const slot of slots) {
                const created = await this.spaSlotsRepo.createSlot({
                    spaDateId: slot.spaDateId,
                    startTime: new Date(slot.startTime),
                    endTime: slot.endTime ? new Date(slot.endTime) : null,
                });
                await this.spaSlotsRepo.createManyAvailability(created.id, slot.availability);
            }

            return successResponse(`${slots.length} slot(s) created successfully`);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create slots', error.message);
            }
            return errorResponse('Failed to create slots', 'Unknown error');
        }
    }

    public async deleteSpaSlot(id: string): Promise<IApiResponse> {
        try {
            const exists = await this.spaSlotsRepo.getSlotById(id);
            if (!exists) {
                return errorResponse('Spa slot does not exist', 'Spa slot not found');
            }
            const deleted = await this.spaSlotsRepo.deleteSlot(id);
            return successResponse('Deleted spa slot successfully', deleted);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete spa slot', error.message);
            }
            return errorResponse('Failed to delete spa slot', 'Unknown error');
        }
    }
    // public async markAsBooked(
    //     id: string,
    //     reservationId: string,
    //     userName: string
    // ): Promise<IApiResponse> {
    //     try {
    //         const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
    //         if (!isSlotExists) {
    //             return errorResponse(
    //                 'Spa slot does not exist',
    //                 'Spa slot not found'
    //             );
    //         }
    //         if (isSlotExists.isBooked) {
    //             return errorResponse(
    //                 'Spa slot is already booked',
    //                 'Spa slot already booked'
    //             );
    //         }
    //         const updatedSlot = await this.spaSlotsRepo.markSlotAsBooked(
    //             id,
    //             reservationId,
    //             userName
    //         );
    //         const spaSlotPricing =
    //             await this.spaPricingService.createSpaPricing({
    //                 reservationId: reservationId,
    //                 spaDateId: isSlotExists.spaDateId,
    //                 spaSlotId: id,
    //             });
    //         return spaSlotPricing;
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse(
    //                 'Failed to mark spa slot as booked',
    //                 error.message
    //             );
    //         }
    //         return errorResponse(
    //             'Failed to mark spa slot as booked',
    //             'Unknown error'
    //         );
    //     }
    // }
    // public async markAsAvailable(id: string): Promise<IApiResponse> {
    //     try {
    //         const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
    //         if (!isSlotExists) {
    //             return errorResponse(
    //                 'Spa slot does not exist',
    //                 'Spa slot not found'
    //             );
    //         }
    //         if (!isSlotExists.isBooked) {
    //             return errorResponse(
    //                 'Spa slot is available',
    //                 'Spa slot already booked'
    //             );
    //         }
    //         if (!isSlotExists.reservationId) {
    //             return errorResponse(
    //                 'Spa slot is not booked yet',
    //                 'Spa slot is not booked yet'
    //             );
    //         }
    //         const updatedSlot = await this.spaSlotsRepo.markSlotAsAvailable(id);
    //         const spaSlotPricing =
    //             await this.spaPricingService.deleteSpaPricing({
    //                 reservationId: isSlotExists.reservationId,
    //                 spaDateId: isSlotExists.spaDateId,
    //                 spaSlotId: isSlotExists.id,
    //             });

    //         return spaSlotPricing;
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse(
    //                 'Failed to mark spa slot as available',
    //                 error.message
    //             );
    //         }
    //         return errorResponse(
    //             'Failed to mark as Available',
    //             'Unknown error'
    //         );
    //     }
    // }
    // public async markSlotAsCompleted(id: string): Promise<IApiResponse> {
    //     try {
    //         const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
    //         if (!isSlotExists) {
    //             return errorResponse(
    //                 'Spa slot does not exist',
    //                 'Spa slot not found'
    //             );
    //         }
    //         await this.spaSlotsRepo.markSlotAsCompleted(id);
    //         return successResponse('Slot marked as completed successfully');
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             return errorResponse(
    //                 'Failed to mark slot as completed',
    //                 error.message
    //             );
    //         }
    //         return errorResponse(
    //             'Failed to mark slot as completed',
    //             'Unknown error'
    //         );
    //     }
    // }
}
