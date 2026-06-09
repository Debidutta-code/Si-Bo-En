import { InventoryDao } from '../repository';
import { errorResponse, successResponse } from '../../utils/return';
import {
    ICreateInventoryRepo,
    AdditionalGuestAmount,
    BaseGuestAmount,
    ICharges,
} from '../types';
import { toUTC } from '../../utils';
import { getCurrencyConverter } from '../../currency-maping/utils';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import { LogBuilder } from '../../logs/services/service-log.service';
class InventoryServices {
    inventoryDao: InventoryDao;
    constructor() {
        this.inventoryDao = new InventoryDao();
    }
    public async getInventoryServices(
        hotelCode: string,
        page: number,
        resultPerPage: number,
        startDate: Date,
        endDate?: Date,
        invTypeCode?: string
    ) {
        try {
            const response = await this.inventoryDao.getInventoryDao(
                hotelCode,
                page,
                invTypeCode && invTypeCode,
                startDate && startDate,
                endDate && endDate
            );
            if (response) {
                return successResponse(
                    'Rate Plans and availability fetched successfully',
                    response
                );
            } else {
                return errorResponse('Failed to fetch rateplans');
            }
        } catch (error: any) {
            return errorResponse(`Failed to delete RatePlan`, error?.message);
        }
    }
    public async getAllRoomTypeService(hotelCode: string) {
        try {
            const property =
                await this.inventoryDao.isPropertyExists(hotelCode);
            if (!property) {
                return errorResponse('Property not found');
            }
            const roomTypes = await this.inventoryDao.getAllRoomTypeDao(
                property.id
            );
            if (!roomTypes) {
                return errorResponse('No Room found under this property');
            }
            return successResponse('RoomTypes fetched successfully', roomTypes);
        } catch (error: any) {
            return errorResponse(`Failed to delete RatePlan`, error?.message);
        }
    }
    public async createInventoryService(
        propertyCode: string,
        roomType: string,
        startDate: string,
        endDate: string,
        availableRooms: number,
        pushFromCalender?: boolean
    ) {
        try {
            const property =
                await this.inventoryDao.isPropertyExists(propertyCode);
            if (!property) {
                return errorResponse('Property not found');
            }
            const isRoomExists = await this.inventoryDao.getRoom(
                property.id,
                roomType
            );
            if (!isRoomExists) {
                return errorResponse('Room  not found');
            }
            if (availableRooms > isRoomExists.totalRoom) {
                return errorResponse(
                    'Available rooms cannot be greater than No of rooms exist'
                );
            }
            // Validate date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return errorResponse('Invalid startDate or endDate');
            }
            if (end < start) {
                return errorResponse(
                    'endDate cannot be earlier than startDate'
                );
            }

            // Build one availability record per date in the inclusive range
            const invTOCreated: ICreateInventoryRepo[] = [];
            for (
                let d = new Date(start.getTime());
                d.getTime() <= end.getTime();
                d.setDate(d.getDate() + 1)
            ) {
                const yyyyMmDd = new Date(d.getTime())
                    .toISOString()
                    .split('T')[0];
                invTOCreated.push({
                    propertyCode,
                    roomTypeCode: roomType,
                    date: yyyyMmDd,
                    availability: availableRooms,
                });
            }
            const response =
                await this.inventoryDao.createInventory(invTOCreated);
            if (response) {
                return successResponse(
                    'Availability added/updated successfully',
                    response
                );
            } else {
                return errorResponse('Failed to added/updated availability');
            }
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to add inventory', error.message);
            }
            return errorResponse('Failed to add/update availability');
        }
    }
    public async mapRatePlanService(
        propertyId: string,
        propertyCode: string,
        roomTypeName: string,
        roomTypeCode: string,
        ratePlanName: string,
        ratePlanCode: string,
        baseGuestAmounts: BaseGuestAmount[],
        additionalGuestAmounts: AdditionalGuestAmount[],
        currencyCode: CurrencyCode,
        startDate: string,
        endDate: string,
        log?: LogBuilder
    ) {
        try {
            log?.pushMessage('mapRatePlanService started', 'info', { propertyId, propertyCode, roomTypeCode, ratePlanCode });

            const [room, { convert, baseCurrency }] = await Promise.all([
                this.inventoryDao.getRoom(propertyId, roomTypeCode, log),
                getCurrencyConverter(propertyId, currencyCode),
            ]);

            if (!room) {
                log?.pushMessage(`Room not found`, 'warn', { roomTypeCode, propertyId });
                return errorResponse(`No room found with roomTypeCode: ${roomTypeCode} for property: ${propertyId}`);
            }

            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                log?.pushMessage('Invalid date range', 'warn', { startDate, endDate });
                return errorResponse('Invalid startDate or endDate');
            }
            if (end < start) {
                log?.pushMessage('endDate is before startDate', 'warn', { startDate, endDate });
                return errorResponse('endDate cannot be earlier than startDate');
            }

            log?.pushMessage('Checking inventory availability', 'info', { propertyCode, roomTypeCode, startDate, endDate });
            const inventoryCheck = await this.inventoryDao.checkInventoryAvailability(
                propertyCode, roomTypeCode, startDate, endDate, log  // 👈
            );

            if (inventoryCheck.availableDates.length === 0) {
                log?.pushMessage('No inventory available for date range', 'warn', {
                    totalDates: inventoryCheck.totalDates,
                });
                return errorResponse(`Please add your inventory before mapping rate plans for this room`);
            }

            if (inventoryCheck.missingDates.length > 0) {
                log?.pushMessage('Partial inventory — mapping only available dates', 'warn', {
                    availableCount: inventoryCheck.availableCount,
                    missingCount: inventoryCheck.missingCount,
                });

                const mappedRI: ICharges[] = [];
                for (const dateStr of inventoryCheck.availableDates) {
                    const convertedBaseGuestAmounts = baseGuestAmounts.map(bg => ({
                        noOfGuests: bg.numberOfGuests,
                        amount: convert(bg.amountBeforeTax),
                        ageQualifyingCode: bg.ageQualifyingCode,
                    }));
                    const convertedAdditionalGuestAmounts = additionalGuestAmounts.map(ag => ({
                        ageCode: ag.ageQualifyingCode as '10' | '8' | '5',
                        amount: convert(ag.amount),
                    }));
                    mappedRI.push({
                        propertyCode, roomTypeName, roomTypeCode,
                        ratePlanName, ratePlanCode,
                        baseGuestAmounts: convertedBaseGuestAmounts,
                        additionalGuestAmounts: convertedAdditionalGuestAmounts,
                        currencyCode: baseCurrency,
                        date: dateStr,
                    });
                }

                const daoRes = await this.inventoryDao.mapRatePlans(mappedRI, log);  // 👈

                if (daoRes) {
                    const firstMissing = inventoryCheck.missingDates[0];
                    const lastMissing = inventoryCheck.missingDates[inventoryCheck.missingDates.length - 1];
                    log?.pushMessage('Rate plans mapped with warnings', 'warn', {
                        recordsCreated: daoRes.recordsCreated,
                        missingDateRange: `${firstMissing} to ${lastMissing}`,
                    });
                    return successResponse(`Rate plan mapped successfully for available dates.`, {
                        ...daoRes,
                        warning: {
                            message: 'Inventory missing for some dates',
                            missingDates: inventoryCheck.missingDates,
                            missingDateRange: `${firstMissing} to ${lastMissing}`,
                            mappedDates: inventoryCheck.availableDates,
                        },
                    });
                } else {
                    log?.pushMessage('mapRatePlans DAO returned falsy (partial path)', 'warn');
                    return errorResponse('Failed to map rate plans');
                }
            }

            // ── Full date range path ──────────────────────────────────────────────
            const mappedRI: ICharges[] = [];
            for (
                let d = new Date(start.getTime());
                d.getTime() <= end.getTime();
                d.setDate(d.getDate() + 1)
            ) {
                const yyyyMmDd = new Date(d.getTime()).toISOString().split('T')[0];
                const convertedBaseGuestAmounts = baseGuestAmounts.map(bg => ({
                    noOfGuests: bg.numberOfGuests,
                    amount: convert(bg.amountBeforeTax),
                    ageQualifyingCode: bg.ageQualifyingCode,
                }));
                const convertedAdditionalGuestAmounts = additionalGuestAmounts.map(ag => ({
                    ageCode: ag.ageQualifyingCode as '10' | '8' | '5',
                    amount: convert(ag.amount),
                }));
                mappedRI.push({
                    propertyCode, roomTypeName, roomTypeCode,
                    ratePlanName, ratePlanCode,
                    baseGuestAmounts: convertedBaseGuestAmounts,
                    additionalGuestAmounts: convertedAdditionalGuestAmounts,
                    currencyCode: baseCurrency,
                    date: toUTC(yyyyMmDd),
                });
            }

            log?.pushMessage('Calling mapRatePlans DAO (full range)', 'info', { recordCount: mappedRI.length });
            const daoRes = await this.inventoryDao.mapRatePlans(mappedRI, log);  // 👈

            if (daoRes) {
                log?.pushMessage('Rate plans mapped successfully', 'info', { recordsCreated: daoRes.recordsCreated });
                return successResponse('Rate plan mapped successfully', daoRes);
            } else {
                log?.pushMessage('mapRatePlans DAO returned falsy (full path)', 'warn');
                return errorResponse('Failed to map rate plans');
            }

        } catch (error) {
            log?.pushMessage('Unexpected error in mapRatePlanService', 'error', {
                error: error instanceof Error ? error.message : String(error),
            });
            if (error instanceof Error) return errorResponse('Failed to map room with rate plan', error.message);
            return errorResponse('Failed to map room with rate plan');
        }
    }
    public async getRoomAvailabilityService(
        propertyCode: string,
        roomType: string
    ) {
        try {
            const response = await this.inventoryDao.getRoomAvailability(
                propertyCode,
                roomType
            );
            if (response) {
                return successResponse(
                    'Date based availability fetched successfully',
                    response
                );
            } else {
                return errorResponse('Failed to fetch date based availability');
            }
        } catch (error: any) {
            return errorResponse(
                'Failed to fetch date based availability',
                error?.message
            );
        }
    }
}

export { InventoryServices };
