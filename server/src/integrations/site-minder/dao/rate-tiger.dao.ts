// repository/ratetiger.repository.ts

import { prisma } from '../../../config';
import {
    ChargeQueryResult,
    InventoryQueryResult,
    RatePlanRuleQueryResult,
    RateTigerMappingData,
} from '../types';

export class RateTigerDao {
    /**
     * Get property with all room types and rate plans
     */
    public static async getPropertyMappingData(
        propertyCode: string
    ): Promise<RateTigerMappingData | null> {
        try {
            // 1. Get property and rooms
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: {
                    propertyCode: true,
                    propertyRooms: {
                        where: {
                            isDeleted: false,
                            available: true,
                        },
                        select: {
                            roomType: true,
                            roomName: true,
                            maxOccupancy: true,
                            maxNumberOfAdults: true,
                        },
                    },
                },
            });

            if (!property) {
                return null;
            }
            // After you fetch ratePlans, add this:
            const chargeDateRanges = await prisma.charge.groupBy({
                by: ['ratePlanCode'],
                where: {
                    propertyCode: propertyCode,
                    isAvailable: true,
                    date: {
                        gte: new Date(), // only future/current dates
                    },
                },
                _min: {
                    date: true, // effectiveDate
                },
                _max: {
                    date: true, // expireDate
                },
            });

            // Then build a lookup map for easy access
            const dateRangeMap = new Map(
                chargeDateRanges.map(item => [
                    item.ratePlanCode,
                    {
                        effectiveDate: item._min.date,
                        expireDate: item._max.date,
                    },
                ])
            );
            // 2. Get all rate plans with date ranges
            const ratePlans = await prisma.ratePlan.findMany({
                where: {
                    property: {
                        propertyCode: propertyCode,
                    },
                },
                select: {
                    ratePlanCode: true,
                    ratePlanName: true,
                },
            });

            // 3. Get inventory to determine room-rate plan mappings
            const inventories = await prisma.inventory.findMany({
                where: {
                    propertyCode: propertyCode,
                    date: {
                        gte: new Date(), // Only current/future inventory
                    },
                },
                select: {
                    roomTypeCode: true,
                    ratePlans: true, // This is the String[] array
                    date: true,
                },
            });

            // 4. Build room-rate plan mappings from inventory
            const roomRateMappings = new Map<string, Set<string>>();

            inventories.forEach(inventory => {
                const roomTypeCode = inventory.roomTypeCode;

                if (!roomRateMappings.has(roomTypeCode)) {
                    roomRateMappings.set(roomTypeCode, new Set());
                }

                // Add all rate plans from this inventory record
                inventory.ratePlans.forEach(ratePlanCode => {
                    roomRateMappings.get(roomTypeCode)!.add(ratePlanCode);
                });
            });

            // 5. Build roomRates array (the mapping!)
            const roomRates: Array<{
                ratePlanCode: string;
                roomTypeCode: string;
                status: 'Active' | 'inActive';
            }> = [];

            // Get all unique room types
            const allRoomTypes = property.propertyRooms.map(r => r.roomType);
            const allRatePlanCodes = ratePlans.map(rp => rp.ratePlanCode);

            // Create cross-reference for all combinations
            allRoomTypes.forEach(roomTypeCode => {
                allRatePlanCodes.forEach(ratePlanCode => {
                    const isActive =
                        roomRateMappings.get(roomTypeCode)?.has(ratePlanCode) ||
                        false;

                    roomRates.push({
                        ratePlanCode,
                        roomTypeCode,
                        status: isActive ? 'Active' : 'inActive',
                    });
                });
            });

            const formattedRatePlans = ratePlans.map(rp => ({
                ratePlanCode: rp.ratePlanCode,
                ratePlanName: rp.ratePlanName,
                effectiveDate:
                    dateRangeMap.get(rp.ratePlanCode)?.effectiveDate || null,
                expireDate:
                    dateRangeMap.get(rp.ratePlanCode)?.expireDate || null,
            }));

            // 7. Format room types
            const formattedRoomTypes = property.propertyRooms.map(room => ({
                roomTypeCode: room.roomType,
                roomTypeName: room.roomName,
                maxOccupancy: room.maxOccupancy,
                maxNumberOfAdults: room.maxNumberOfAdults,
            }));

            return {
                propertyCode: property.propertyCode,
                ratePlans: formattedRatePlans,
                roomTypes: formattedRoomTypes,
                roomRates: roomRates,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch property mapping data: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while fetching property mapping data'
            );
        }
    }

    public static async propertyExists(propertyCode: string): Promise<boolean> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true },
            });
            return !!property;
        } catch (error) {
            throw new Error('Failed to verify property existence');
        }
    }

    public static async getDailyInventoryAndRestrictions(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date
    ): Promise<
        Array<{
            date: Date;
            availability: number;
            isSaleStopped: boolean;
            isClosedToArrival: boolean;
            isClosedToDeparture: boolean;
            minAdvanceBookingDays: number | null; // ✅ ADD
            maxAdvanceBookingDays: number | null; // ✅ ADD
        }>
    > {
        // Fetch inventory and charges in parallel
        const [inventories, charges] = await Promise.all([
            prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    date: { gte: startDate, lte: endDate },
                },
                select: {
                    date: true,
                    availability: true,
                },
                orderBy: { date: 'asc' },
            }),
            prisma.charge.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    date: { gte: startDate, lte: endDate },
                },
                select: {
                    date: true,
                    isSaleStopped: true,
                    isClosedToArrival: true,
                    isClosedToDeparture: true,
                },
                orderBy: { date: 'asc' },
            }),
        ]);

        // Build lookup maps by date string
        const inventoryMap = new Map(
            inventories.map(i => [
                i.date.toISOString().split('T')[0],
                i.availability,
            ])
        );

        const chargeMap = new Map(
            charges.map(c => [
                c.date.toISOString().split('T')[0],
                {
                    isSaleStopped: c.isSaleStopped,
                    isClosedToArrival: c.isClosedToArrival,
                    isClosedToDeparture: c.isClosedToDeparture,
                },
            ])
        );

        // ✅ FIX: Generate ALL dates in the requested range
        // Don't just return dates that have records - fill in missing dates with defaults
        // Query BookingOffset (ADD THIS - before the result array)
        const property = await prisma.property.findUnique({
            where: { propertyCode },
            select: { id: true },
        });

        const bookingOffsets = await prisma.bookingOffset.findMany({
            where: {
                propertyId: property!.id,
                ratePlanCode: ratePlanCode,
                date: { gte: startDate, lte: endDate },
            },
            select: {
                date: true,
                minimumAdvanceBookingOffset: true,
                maximumAdvanceBookingOffset: true,
            },
        });

        // Create offset lookup map (convert hours to days)
        const offsetMap = new Map(
            bookingOffsets.map(o => [
                o.date.toISOString().split('T')[0],
                {
                    minAdvanceBookingDays: o.minimumAdvanceBookingOffset
                        ? Math.round(o.minimumAdvanceBookingOffset / 24)
                        : null,
                    maxAdvanceBookingDays: o.maximumAdvanceBookingOffset
                        ? Math.round(o.maximumAdvanceBookingOffset / 24)
                        : null,
                },
            ])
        );

        // ✅ UPDATE result array type definition
        const result: Array<{
            date: Date;
            availability: number;
            isSaleStopped: boolean;
            isClosedToArrival: boolean;
            isClosedToDeparture: boolean;
            minAdvanceBookingDays: number | null; // ✅ ADD
            maxAdvanceBookingDays: number | null; // ✅ ADD
        }> = [];

        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const chargeData = chargeMap.get(dateStr);
            const offsetData = offsetMap.get(dateStr); // ✅ ADD

            result.push({
                date: new Date(currentDate),
                availability: inventoryMap.get(dateStr) ?? 0,
                isSaleStopped: chargeData?.isSaleStopped ?? false,
                isClosedToArrival: chargeData?.isClosedToArrival ?? false,
                isClosedToDeparture: chargeData?.isClosedToDeparture ?? false,
                minAdvanceBookingDays:
                    offsetData?.minAdvanceBookingDays ?? null, // ✅ ADD
                maxAdvanceBookingDays:
                    offsetData?.maxAdvanceBookingDays ?? null, // ✅ ADD
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return result;
    }
    public static async getRatePlanRules(
        propertyCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date
    ): Promise<RatePlanRuleQueryResult | null> {
        try {
            // RatePlanRule is per rate plan, find the one
            // whose date range overlaps with the requested range
            const rule = await prisma.ratePlanRule.findFirst({
                where: {
                    ratePlan: {
                        property: { propertyCode },
                        ratePlanCode,
                    },
                    isActive: true,
                    OR: [
                        // Rule has no dates = applies always
                        { startDate: null, endDate: null },
                        // Rule overlaps with requested range
                        {
                            startDate: { lte: endDate },
                            endDate: { gte: startDate },
                        },
                    ],
                },
                select: {
                    minLos: true,
                    maxLos: true,
                    startDate: true,
                    endDate: true,
                    ratePlan: {
                        select: { ratePlanCode: true },
                    },
                },
            });

            if (!rule) return null;

            return {
                ratePlanCode: rule.ratePlan.ratePlanCode,
                minLos: rule.minLos,
                maxLos: rule.maxLos,
                startDate: rule.startDate,
                endDate: rule.endDate,
            };
        } catch (error) {
            throw new Error(
                `Failed to fetch rate plan rules: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    public static async getBookingOffsets(
        propertyCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date
    ): Promise<
        Array<{
            date: Date;
            minimumAdvanceBookingOffset: number | null;
            maximumAdvanceBookingOffset: number | null;
        }>
    > {
        const offsets = await prisma.bookingOffset.findMany({
            where: {
                property: { propertyCode },
                ratePlanCode,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                date: true,
                minimumAdvanceBookingOffset: true,
                maximumAdvanceBookingOffset: true,
            },
            orderBy: { date: 'asc' },
        });

        return offsets;
    }
}
