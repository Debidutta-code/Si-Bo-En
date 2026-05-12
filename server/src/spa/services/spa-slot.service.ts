import {
    IApiResponse,
    successResponse,
    errorResponse,
    toUTC,
} from '../../utils';
import { SpaDatesRepo, SpaSlotsRepo } from '../repository';
import { ICSpaDatesR, ICSpaDatesS, ICSpaSlotS } from '../types/spa-slot.type';
import { SpaPricingService } from './spa-pricing.service';

export class SpaDates {
    private spaDatesRepo: SpaDatesRepo;

    constructor() {
        this.spaDatesRepo = new SpaDatesRepo();
    }
    public async createSpaDate(
        date: Date,
        spaModuleId: string
    ): Promise<IApiResponse> {
        try {
            const isExistsForDates = await this.spaDatesRepo.getSpaForDate(
                spaModuleId,
                date
            );
            if (isExistsForDates) {
                return errorResponse(
                    'Spa already exists for this date add slots',
                    'Spa Exist for this date'
                );
            }
            await this.spaDatesRepo.createDate({
                spaModuleId,
                date,
            });
            return successResponse('Date Added Successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create date for spa',
                    error.message
                );
            }
            return errorResponse(
                'Failed to create date for spa',
                'Unknown error'
            );
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

    constructor() {
        this.spaSlotsRepo = new SpaSlotsRepo();
        this.spaDatesRepo = new SpaDatesRepo();
        this.spaPricingService = new SpaPricingService();
    }
    public async createSpaSlots(
        data: ICSpaSlotS[],
        spaDateId: string
    ): Promise<IApiResponse> {
        try {
            const isDateExists = await this.spaDatesRepo.getDateById(spaDateId);
            if (!isDateExists) {
                return errorResponse(
                    'Spa date does not exist',
                    'Spa date not found'
                );
            }

            const existingSlots = isDateExists.Slots || [];

            const slotsData = data.map(slot => ({
                ...slot,
                spaDateId,
                startTime: toUTC(slot.startTime),
                endTime: slot.endTime ? toUTC(slot.endTime) : null,
            }));

            // Check for overlaps
            for (let i = 0; i < slotsData.length; i++) {
                const pStart = new Date(slotsData[i].startTime).getTime();
                const pEndMatch = slotsData[i].endTime;
                if (!pEndMatch) continue;
                const pEnd = new Date(pEndMatch).getTime();

                // Check against existing slots
                for (const eSlot of existingSlots) {
                    if (!eSlot.endTime) continue;
                    const eStart = new Date(eSlot.startTime).getTime();
                    const eEnd = new Date(eSlot.endTime).getTime();

                    // Check for overlap condition: (StartA < EndB) and (EndA > StartB)
                    if (pStart < eEnd && pEnd > eStart) {
                        return errorResponse(
                            'Overlapping slots',
                            'Slot time overlaps with existing slots'
                        );
                    }
                }

                // Check against other proposed slots internally
                for (let j = i + 1; j < slotsData.length; j++) {
                    const oStart = new Date(slotsData[j].startTime).getTime();
                    const oEndMatch = slotsData[j].endTime;
                    if (!oEndMatch) continue;
                    const oEnd = new Date(oEndMatch).getTime();

                    if (pStart < oEnd && pEnd > oStart) {
                        return errorResponse(
                            'Overlapping proposed slots',
                            'The slots you are trying to add overlap with each other'
                        );
                    }
                }
            }

            const createdSlot = await this.spaSlotsRepo.createSlots(slotsData);
            return successResponse(
                'Created spa slot successfully',
                createdSlot
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create spa slot',
                    error.message
                );
            }
            return errorResponse('Failed to create spa slot', 'Unknown error');
        }
    }
    public async deleteSpaSlot(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse(
                    'Spa slot does not exist',
                    'Spa slot not found'
                );
            }
            const deletedSlots = await this.spaSlotsRepo.deleteSlot(id);
            return successResponse(
                'Deleted spa slots successfully',
                deletedSlots
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete spa slots',
                    error.message
                );
            }
            return errorResponse('Failed to delete spa slots', 'Unknown error');
        }
    }
    public async markAsBooked(
        id: string,
        reservationId: string,
        userName: string
    ): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse(
                    'Spa slot does not exist',
                    'Spa slot not found'
                );
            }
            if (isSlotExists.isBooked) {
                return errorResponse(
                    'Spa slot is already booked',
                    'Spa slot already booked'
                );
            }
            const updatedSlot = await this.spaSlotsRepo.markSlotAsBooked(
                id,
                reservationId,
                userName
            );
            const spaSlotPricing =
                await this.spaPricingService.createSpaPricing({
                    reservationId: reservationId,
                    spaDateId: isSlotExists.spaDateId,
                    spaSlotId: id,
                });
            return spaSlotPricing;
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to mark spa slot as booked',
                    error.message
                );
            }
            return errorResponse(
                'Failed to mark spa slot as booked',
                'Unknown error'
            );
        }
    }
    public async markAsAvailable(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse(
                    'Spa slot does not exist',
                    'Spa slot not found'
                );
            }
            if (!isSlotExists.isBooked) {
                return errorResponse(
                    'Spa slot is available',
                    'Spa slot already booked'
                );
            }
            if (!isSlotExists.reservationId) {
                return errorResponse(
                    'Spa slot is not booked yet',
                    'Spa slot is not booked yet'
                );
            }
            const updatedSlot = await this.spaSlotsRepo.markSlotAsAvailable(id);
            const spaSlotPricing =
                await this.spaPricingService.deleteSpaPricing({
                    reservationId: isSlotExists.reservationId,
                    spaDateId: isSlotExists.spaDateId,
                    spaSlotId: isSlotExists.id,
                });

            return spaSlotPricing;
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to mark spa slot as available',
                    error.message
                );
            }
            return errorResponse(
                'Failed to mark as Available',
                'Unknown error'
            );
        }
    }
    public async markSlotAsCompleted(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getSlotById(id);
            if (!isSlotExists) {
                return errorResponse(
                    'Spa slot does not exist',
                    'Spa slot not found'
                );
            }
            await this.spaSlotsRepo.markSlotAsCompleted(id);
            return successResponse('Slot marked as completed successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to mark slot as completed',
                    error.message
                );
            }
            return errorResponse(
                'Failed to mark slot as completed',
                'Unknown error'
            );
        }
    }
}
