
import { prisma } from '../../config';
import { toUTC } from '../../utils';
import type { ICreateInventoryRepo, IIdInventory, IWeekdayCharges, IWeekdayAdditionalCharges, IAdditionalGuestAmount, ICharges } from "../types"
import { formatDate, localMidnight, parseDdMmYyyy } from "../utils/date"


class InventoryRepository {
    public static async getInventoryDao(
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

    public static async isPropertyExists(hotelCode: string) {
        try {
            return await prisma.property.findFirst({
                where: { propertyCode: hotelCode },
            });
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    public static async getRoom(propertyId: string, roomType: string) {
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

    public static async getAllRoomTypeDao(propertyId: string) {
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

    public static async createInventory(
        repoData: ICreateInventoryRepo[]
    ): Promise<boolean> {
        try {
            const ops: any[] = [];

            for (const item of repoData) {
                const isExists = await prisma.inventory.findFirst({
                    where: {
                        propertyCode: item.propertyCode,
                        roomTypeCode: item.roomTypeCode,
                        date: toUTC(item.date)
                    }
                })
                if (isExists) {
                    ops.push(
                        prisma.inventory.update({
                            where: {
                                id: isExists.id
                            },
                            data: { availability: item.availability },
                        })
                    )

                } else {
                    ops.push(
                        prisma.inventory.create({
                            data: {
                                ...item,
                                date: toUTC(item.date),
                            },
                        })
                    );
                }

            }

            if (ops.length > 0) {
                await prisma.$transaction(ops);
            }

            return true

        } catch (error: any) {
            throw new Error(error.message);
        }
    }



    public static async mapRatePlans(
        payload: ICharges[]
    ) {
        try {
            if (!payload || payload.length === 0) {
                throw new Error('No charge data provided');
            }
            const chargeUpdates = [];

            for (const chargeData of payload) {
                const {
                    propertyCode,
                    ratePlanCode,
                    ratePlanName,
                    roomTypeCode,
                    roomTypeName,
                    currencyCode,
                    date,
                    baseGuestAmounts,
                    additionalGuestAmounts,
                } = chargeData;

                const chargeDoc: any = {
                    propertyCode,
                    ratePlanCode,
                    ratePlanName,
                    roomTypeCode,
                    roomTypeName,
                    currencyCode: currencyCode.toUpperCase() as any,
                    date: new Date(date.toString()),
                    baseGuestAmounts: {
                        create: baseGuestAmounts.map(bg => ({
                            numberOfGuests: bg.noOfGuests,
                            amountBeforeTax: bg.amount,
                            ageQualifyingCode: bg.ageQualifyingCode,

                        })),
                    },
                    additionalGuestAmounts: {
                        create: additionalGuestAmounts.map(ag => ({
                            ageQualifyingCode: ag.ageCode,
                            amount: ag.amount,
                        })),
                    },
                };

                // First check if the charge exists
                const existingCharge = await prisma.charge.findFirst({
                    where: {
                        propertyCode,
                        ratePlanCode,
                        roomTypeCode,
                        date: new Date(date.toString()),
                    },
                });

                // Then either update or create based on existence
                if (existingCharge) {
                    chargeUpdates.push(
                        prisma.charge.update({
                            where: { id: existingCharge.id },
                            data: {
                                ratePlanName,
                                roomTypeName,
                                currencyCode: currencyCode.toUpperCase() as any,
                                baseGuestAmounts: {
                                    deleteMany: {},
                                    create: baseGuestAmounts.map(bg => ({
                                        numberOfGuests: bg.noOfGuests,
                                        amountBeforeTax: bg.amount,
                                        ageQualifyingCode: bg.ageQualifyingCode,
                                    })),
                                },
                                additionalGuestAmounts: {
                                    deleteMany: {},
                                    create: additionalGuestAmounts.map(ag => ({
                                        ageQualifyingCode: ag.ageCode,
                                        amount: ag.amount,
                                    })),
                                },
                            },
                        })
                    );
                } else {
                    chargeUpdates.push(
                        prisma.charge.create({
                            data: chargeDoc
                        }
                        )
                    );
                }
            }

            if (chargeUpdates.length > 0) {
                await prisma.$transaction(chargeUpdates);
            }

            // Update ratePlans array in Inventory for the affected room types
            if (payload.length > 0) {
                const { propertyCode, roomTypeCode, ratePlanCode } = payload[0];

                const inventories = await prisma.inventory.findMany({
                    where: {
                        propertyCode,
                        roomTypeCode,
                    },
                });

                const inventoryUpdates = inventories
                    .filter(inv => !inv.ratePlans.includes(ratePlanCode))
                    .map(inv =>
                        prisma.inventory.update({
                            where: { id: inv.id },
                            data: {
                                ratePlans: {
                                    push: ratePlanCode,
                                },
                            },
                        })
                    );

                if (inventoryUpdates.length > 0) {
                    await prisma.$transaction(inventoryUpdates);
                }
            }

            return {
                success: true,
                message: `Added/Updated ${chargeUpdates.length} charge records and updated rate plans for rooms`,
                recordsCreated: chargeUpdates.length,
            };
        } catch (error: any) {
            console.error('Error mapping rate plans:', error);
            throw new Error(error.message);
        }
    }
    public static async checkInventoryAvailability(
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
                        gt: 0  // Only dates with availability > 0
                    }
                },
                select: {
                    date: true,
                    availability: true
                }
            });

            // Get dates that have inventory with availability > 0 (as ISO strings)
            const availableDateStrings = inventories.map(inv => inv.date.toISOString().split('T')[0]);

            // Find missing dates (dates without inventory or with 0 availability)
            const missingDateStrings = allDateStrings.filter(dateStr => !availableDateStrings.includes(dateStr));

            // Convert back to Date objects for return
            const availableDates = [...new Set(availableDateStrings)].map(ds => new Date(ds));
            const missingDates = missingDateStrings.map(ds => new Date(ds));

            return {
                availableDates,
                missingDates,
                totalDates: allDateStrings.length,
                availableCount: availableDates.length,
                missingCount: missingDates.length
            };
        } catch (error) {
            throw new Error("Error checking inventory availability");
        }
    }
}

export default InventoryRepository;