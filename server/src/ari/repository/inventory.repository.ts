import { prisma } from '../../config';
import { toUTC } from '../../utils';
import type {
    ICreateInventoryRepo,
    IIdInventory,
    IWeekdayCharges,
    IWeekdayAdditionalCharges,
    IAdditionalGuestAmount,
    ICharges,
} from '../types';
import { formatDate, localMidnight, parseDdMmYyyy } from '../utils/date';

class InventoryRepository {
    public async getInventoryDao(
        hotelCode: string,
        currentPage: number,
        invTypeCode?: string,
        startDate?: Date,
        endDate?: Date
    ) {
        try {
            const query: any = { hotelCode };
            const limit = 20;
            const skip = (currentPage - 1) * limit;

            if (invTypeCode) {
                query.invTypeCode = invTypeCode;
            }

            const stayDates: string[] = [];
            if (startDate && endDate) {
                const start = localMidnight(startDate);
                const end = localMidnight(endDate);

                while (start < end) {
                    stayDates.push(formatDate(start));
                    start.setDate(start.getDate() + 1);
                }
                query.date = { in: stayDates };
            }

            const totalCount = await prisma.inventory.count({ where: query });
            const totalPages = Math.ceil(totalCount / limit);

            const response = await prisma.inventory.findMany({
                where: query,
                select: {
                    id: true,
                    roomTypeCode: true,
                    availability: true,
                    propertyCode: true,
                },
                skip,
                take: limit,
            });

            return {
                data: response,
                pagination: {
                    currentPage,
                    totalPages,
                    totalCount,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1,
                    limit,
                },
            };
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async isPropertyExists(hotelCode: string) {
        try {
            return await prisma.property.findFirst({
                where: { propertyCode: hotelCode },
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async getRoom(propertyId: string, roomType: string) {
        try {
            const room = await prisma.room.findFirst({
                where: {
                    propertyId,
                    roomType,
                },
            });
            return room;
        } catch (error: any) {
            console.error('❌ getRoom error:', error);
            throw new Error(error?.message);
        }
    }

    public async getAllRoomTypeDao(propertyId: string) {
        try {
            const roomTypes = await prisma.room.findMany({
                where: {
                    propertyId,
                    available: true,
                },
                select: {
                    roomType: true,
                },
                distinct: ['roomType'],
            });

            return roomTypes.map((r: any) => r.roomType);
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async createInventory(
        repoData: ICreateInventoryRepo[]
    ): Promise<boolean> {
        try {
            await Promise.all(
                repoData.map(item => {
                    const dateUTC = toUTC(item.date);
                    return prisma.inventory.upsert({
                        where: {
                            propertyCode_roomTypeCode_date: {
                                propertyCode: item.propertyCode,
                                roomTypeCode: item.roomTypeCode,
                                date: dateUTC,
                            },
                        },
                        create: { ...item, date: dateUTC },
                        update: { availability: item.availability },
                    });
                })
            );
            return true;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public async mapRatePlans(payload: ICharges[]) {
        try {
            if (!payload || payload.length === 0) {
                throw new Error('No charge data provided');
            }

            // ── Step 1: Upsert all charges in parallel ────────────────────────────
            const upsertedCharges = await Promise.all(
                payload.map(chargeData => {
                    const {
                        propertyCode,
                        ratePlanCode,
                        ratePlanName,
                        roomTypeCode,
                        roomTypeName,
                        currencyCode,
                        date,
                    } = chargeData;

                    return prisma.charge.upsert({
                        where: {
                            propertyCode_roomTypeCode_ratePlanCode_date: {
                                propertyCode,
                                roomTypeCode,
                                ratePlanCode,
                                date: new Date(date.toString()),
                            },
                        },
                        create: {
                            propertyCode,
                            ratePlanCode,
                            ratePlanName,
                            roomTypeCode,
                            roomTypeName,
                            currencyCode: currencyCode.toUpperCase() as any,
                            date: new Date(date.toString()),
                        },
                        update: {
                            ratePlanName,
                            roomTypeName,
                            currencyCode: currencyCode.toUpperCase() as any,
                        },
                        select: {
                            id: true,
                            propertyCode: true,
                            ratePlanCode: true,
                            roomTypeCode: true,
                            date: true,
                        },
                    });
                })
            );

            // ── Step 2: Delete old nested records in bulk ─────────────────────────
            const chargeIds = upsertedCharges.map(c => c.id);

            await Promise.all([
                prisma.chargeBaseByGuest.deleteMany({
                    where: { chargeId: { in: chargeIds } },
                }),
                prisma.chargeAdditionalGuest.deleteMany({
                    where: { chargeId: { in: chargeIds } },
                }),
            ]);

            // ── Step 3: Re-insert all nested records in bulk ──────────────────────
            const baseGuestData = upsertedCharges.flatMap((charge, i) =>
                payload[i].baseGuestAmounts.map(bg => ({
                    chargeId: charge.id,
                    numberOfGuests: bg.noOfGuests,
                    amountBeforeTax: Number(bg.amount),
                    ageQualifyingCode: bg.ageQualifyingCode,
                }))
            );

            const additionalGuestData = upsertedCharges.flatMap((charge, i) =>
                payload[i].additionalGuestAmounts.map(ag => ({
                    chargeId: charge.id,
                    ageQualifyingCode: ag.ageCode,
                    amount: ag.amount,
                }))
            );

            await Promise.all([
                prisma.chargeBaseByGuest.createMany({ data: baseGuestData }),
                prisma.chargeAdditionalGuest.createMany({
                    data: additionalGuestData,
                }),
            ]);

            // ── Step 4: Update inventory ratePlans array ──────────────────────────
            if (payload.length > 0) {
                const { propertyCode, roomTypeCode, ratePlanCode } = payload[0];

                const inventories = await prisma.inventory.findMany({
                    where: { propertyCode, roomTypeCode },
                });

                const inventoryUpdates = inventories
                    .filter(inv => !inv.ratePlans.includes(ratePlanCode))
                    .map(inv =>
                        prisma.inventory.update({
                            where: { id: inv.id },
                            data: { ratePlans: { push: ratePlanCode } },
                        })
                    );

                if (inventoryUpdates.length > 0) {
                    await Promise.all(inventoryUpdates);
                }
            }

            return {
                success: true,
                message: `Added/Updated ${upsertedCharges.length} charge records and updated rate plans for rooms`,
                recordsCreated: upsertedCharges.length,
            };
        } catch (error: any) {
            console.error('Error mapping rate plans:', error);
            throw new Error(error.message);
        }
    }

    public async checkInventoryAvailability(
        propertyCode: string,
        roomTypeCode: string,
        startDate: string,
        endDate: string
    ) {
        try {
            // Generate all dates in the range as ISO strings for comparison
            const allDateStrings: string[] = [];
            const start = new Date(startDate);
            const end = new Date(endDate);

            for (
                let d = new Date(start.getTime());
                d.getTime() <= end.getTime();
                d.setDate(d.getDate() + 1)
            ) {
                allDateStrings.push(d.toISOString().split('T')[0]);
            }

            // Fetch inventory for the date range with availability > 0
            const inventories = await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    availability: {
                        gt: 0, // Only dates with availability > 0
                    },
                },
                select: {
                    date: true,
                    availability: true,
                },
            });

            // Get dates that have inventory with availability > 0 (as ISO strings)
            const availableDateStrings = inventories.map(
                inv => inv.date.toISOString().split('T')[0]
            );

            // Find missing dates (dates without inventory or with 0 availability)
            const missingDateStrings = allDateStrings.filter(
                dateStr => !availableDateStrings.includes(dateStr)
            );

            // Convert back to Date objects for return
            const availableDates = [...new Set(availableDateStrings)].map(
                ds => new Date(ds)
            );
            const missingDates = missingDateStrings.map(ds => new Date(ds));

            return {
                availableDates,
                missingDates,
                totalDates: allDateStrings.length,
                availableCount: availableDates.length,
                missingCount: missingDates.length,
            };
        } catch (error) {
            throw new Error('Error checking inventory availability');
        }
    }

    public async getRoomAvailability(
        propertyCode: string,
        roomTypeCode: string
    ) {
        try {
            const inventories = await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                },
                select: {
                    date: true,
                    availability: true,
                },
            });
            return inventories;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}

export default InventoryRepository;
