import {
    IApiResponse,
    successResponse,
    errorResponse,
    toUTC,
} from '../../utils';
import { SpaDatesRepo, SpaRepository, SpaSlotsRepo } from '../repository';
import { IBookAvailability, ICSpaDatesR, ICSpaDatesS, ICSpaSlotBatch, ICSpaSlotS, SlotStatus } from '../types/spa-slot.type';
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
    private spaRepo: SpaRepository;
    private spaDatesRepo: SpaDatesRepo;
    private spaPricingService: SpaPricingService;
    private spaDatesService: SpaDates;

    constructor() {
        this.spaSlotsRepo = new SpaSlotsRepo();
        this.spaRepo = new SpaRepository();
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
                        [new Date()],
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
                const startTime = new Date(slot.startTime);
                const endTime = new Date(slot.endTime!);

                if (startTime >= endTime) {
                    return errorResponse(
                        'Invalid slot time',
                        'Start time must be before end time'
                    );
                }

                const overlappingSlot =
                    await this.spaSlotsRepo.findOverlappingSlot(
                        slot.spaDateId,
                        startTime,
                        endTime
                    );

                if (overlappingSlot) {
                    return errorResponse(
                        'Slot overlaps with an existing slot',
                        `Existing slot: ${overlappingSlot.startTime.toISOString()} - ${overlappingSlot.endTime?.toISOString()}`
                    );
                }

                const created = await this.spaSlotsRepo.createSlot({
                    spaDateId: slot.spaDateId,
                    startTime,
                    endTime,
                });

                await this.spaSlotsRepo.createManyAvailability(
                    created.id,
                    slot.availability
                );
            }

            return successResponse(`${slots.length} slot(s) created successfully`);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create slots', error.message);
            }
            return errorResponse('Failed to create slots', 'Unknown error');
        }
    }

    public async updateSpaSlotStatus(
        id: string,
        isActive: boolean
    ): Promise<IApiResponse> {
        try {
            const exist = await this.spaSlotsRepo.getSlotById(id);
            if (!exist) {
                return errorResponse('Spa slot does not exist', 'Spa slot not found');
            }
            const updated = await this.spaSlotsRepo.updateSpaSlotStatus(id, isActive);
            return successResponse('Updated spa slot status successfully', updated);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update spa slot status', error.message);
            }
            return errorResponse('Failed to update spa slot status', 'Unknown error');
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
    
public async markSlotAvailibilityAsBooked(
    reservationId: string,
    userName: string,
    availabilities: IBookAvailability[]
): Promise<IApiResponse> {
    try {
        // Validate all availabilities exist and are not already booked
        const existingSlots = await Promise.all(
            availabilities.map((a) =>
                this.spaSlotsRepo.getspaSlotAvailibilitybyId(a.availabilityId)
            )
        );

        for (let i = 0; i < existingSlots.length; i++) {
            const slot = existingSlots[i];
            if (!slot) {
                return errorResponse(
                    'Spa slot does not exist',
                    `Slot ID ${availabilities[i].availabilityId} not found`
                );
            }
            if (slot.status === 'booked') {
                return errorResponse(
                    'Spa slot is already booked',
                    `Slot ID ${availabilities[i].availabilityId} is already booked`
                );
            }
        }

        // Fetch the spa for each availability to check isInclusive
        const uniqueSpaIds = [...new Set(availabilities.map(a => a.spaId))];
        const spaMap = new Map();
        for (const id of uniqueSpaIds) {
            const spa = await this.spaRepo.getById(id);
            if (spa) spaMap.set(id, spa);
        }

        let inclusiveCountInRequest = 0;
        for (let i = 0; i < availabilities.length; i++) {
            const spa = spaMap.get(availabilities[i].spaId);
            if (!spa) {
                return errorResponse(
                    'Spa not found',
                    `Spa ID ${availabilities[i].spaId} not found`
                );
            }
            if (spa.isInclusive) inclusiveCountInRequest++;
        }

        // Restriction for inclusive slots
        if (inclusiveCountInRequest > 0) {
            const reservationWithGuests = await this.spaRepo['prisma'].reservation.findUnique({
                where: { id: reservationId },
                include: {
                    reservationGuests: true,
                    SlotsAvailable: {
                        where: { status: 'booked' },
                        include: {
                            spaSlot: {
                                include: {
                                    spaDate: {
                                        include: {
                                            spaModule: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            });

            if (!reservationWithGuests) {
                return errorResponse('Reservation not found');
            }

            const totalGuestsAllowed = (reservationWithGuests.reservationGuests?.length || 0) + 1;
            const alreadyBookedInclusiveCount = reservationWithGuests.SlotsAvailable?.filter(sa =>
                sa.spaSlot?.spaDate?.spaModule?.isInclusive
            ).length || 0;

            if (inclusiveCountInRequest + alreadyBookedInclusiveCount > totalGuestsAllowed) {
                return errorResponse(`You can only book up to ${totalGuestsAllowed} inclusive spa slots in total for your stay. You have already booked ${alreadyBookedInclusiveCount}.`);
            }
        }

        // Mark all slots as booked in one DB call
        await this.spaSlotsRepo.markSlotAvailabilitiesAsBooked(
            availabilities.map((a) => ({
                availabilityId: a.availabilityId,
                userName: a.userName,
                userEmail: a.userEmail,
            })),
            reservationId,
            userName
        );

      
        for (let i = 0; i < existingSlots.length; i++) {
            const spa = spaMap.get(availabilities[i].spaId);
            if (spa!.isInclusive) continue;

            const pricingResult = await this.spaPricingService.createSpaPricing({
                reservationId,
                spaDateId: existingSlots[i]!.spaSlot?.spaDateId!,
                spaSlotId: existingSlots[i]!.spaSlot?.id!,
            });

            if (!pricingResult.success) return pricingResult;
        }

        return successResponse('Spa slots booked successfully');
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse('Failed to mark spa slot as booked', error.message);
        }
        return errorResponse('Failed to mark spa slot as booked', 'Unknown error');
    }
}
    
    public async deleteSlotAvailibilityById(id: string): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getspaSlotAvailibilitybyId(id);
            if (!isSlotExists) {
                return errorResponse(
                    'Spa slot does not exist',
                    'Spa slot not found'
                );
            }
            await this.spaSlotsRepo.deleteSlotAvailibilityById(id);
            return successResponse('Slot availability deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete slot availability',
                    error.message
                );
            }
            return errorResponse(
                'Failed to delete slot availability',
                'Unknown error'
            );
        }
    }
    public async updateSpaSlotAvailibilityStatus(id: string, status: SlotStatus): Promise<IApiResponse> {
        try {
            const isSlotExists = await this.spaSlotsRepo.getspaSlotAvailibilitybyId(id);
            if (!isSlotExists) {
                return errorResponse(
                    'Spa slot does not exist',
                    'Spa slot not found'
                );
            }
            await this.spaSlotsRepo.updateSpaSlotAvailibilityStatus(id, status);
            return successResponse('Slot availability status updated successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update slot availability status',
                    error.message
                );
            }
            return errorResponse(
                'Failed to update slot availability status',
                'Unknown error'
            );
        }
    }
}
