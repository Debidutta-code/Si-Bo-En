// dao/inventory-update.dao.ts

import { prisma } from '../../../config';
import { InventoryUpsertParams } from '../types/inventory-update.types';

export class InventoryUpdateDao {
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

    public static async upsertInventoryAndRestrictions(
        params: InventoryUpsertParams
    ): Promise<void> {
        const {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date,
            bookingLimit,
            isSaleStopped,
            isClosedToArrival,
            isClosedToDeparture,
            minAdvanceBookingDays,
            maxAdvanceBookingDays,
        } = params;

        // 1. Upsert Inventory (availability count) — at roomType level
        if (bookingLimit !== undefined) {
            const existingInventory = await prisma.inventory.findFirst({
                where: { propertyCode, roomTypeCode, date },
                select: { id: true },
            });

            if (existingInventory) {
                await prisma.inventory.update({
                    where: { id: existingInventory.id },
                    data: { availability: bookingLimit },
                });
            } else {
                await prisma.inventory.create({
                    data: {
                        propertyCode,
                        roomTypeCode,
                        date,
                        availability: bookingLimit,
                        ratePlans: [ratePlanCode],
                    },
                });
            }
        }

        // 2. Upsert Charge restrictions — at roomType + ratePlan level
        const hasRestrictions =
            isSaleStopped !== undefined ||
            isClosedToArrival !== undefined ||
            isClosedToDeparture !== undefined ||
            minAdvanceBookingDays !== undefined ||
            maxAdvanceBookingDays !== undefined;

        if (hasRestrictions) {
            const existingCharge = await prisma.charge.findFirst({
                where: { propertyCode, roomTypeCode, ratePlanCode, date },
                select: { id: true },
            });

            const restrictionData = {
                ...(isSaleStopped !== undefined && { isSaleStopped }),
                ...(isClosedToArrival !== undefined && { isClosedToArrival }),
                ...(isClosedToDeparture !== undefined && {
                    isClosedToDeparture,
                }),
            };

            if (existingCharge) {
                // Delta update — only update what was sent
                await prisma.charge.update({
                    where: { id: existingCharge.id },
                    data: restrictionData,
                });
            } else {
                // Create new charge with just restriction data
                // Price fields will be filled when price update comes in
                await prisma.charge.create({
                    data: {
                        propertyCode,
                        roomTypeCode,
                        ratePlanCode,
                        ratePlanName: ratePlanCode,
                        roomTypeName: roomTypeCode,
                        date,
                        ...restrictionData,
                    },
                });
            }
        }

        // 3. Upsert RatePlanRule for MinLOS/MaxLOS
        // 3. Upsert RatePlanRule for MinLOS/MaxLOS
        if (params.minLos !== undefined || params.maxLos !== undefined) {
            // Find the rate plan first
            const ratePlan = await prisma.ratePlan.findFirst({
                where: {
                    ratePlanCode,
                    property: { propertyCode },
                },
                select: { id: true },
            });

            if (!ratePlan) {
                console.warn(
                    `Rate plan ${ratePlanCode} not found for property ${propertyCode}`
                );
                return; // Skip if rate plan doesn't exist
            }

            // Try to find existing rule
            const existingRule = await prisma.ratePlanRule.findFirst({
                where: {
                    ratePlanId: ratePlan.id,
                    // Match rules that overlap with this date
                    OR: [
                        { startDate: null, endDate: null }, // Global rules
                        {
                            startDate: { lte: date },
                            endDate: { gte: date },
                        },
                    ],
                },
                select: { id: true },
            });

            if (existingRule) {
                // Update existing rule
                await prisma.ratePlanRule.update({
                    where: { id: existingRule.id },
                    data: {
                        ...(params.minLos !== undefined && {
                            minLos: params.minLos,
                        }),
                        ...(params.maxLos !== undefined && {
                            maxLos: params.maxLos,
                        }),
                    },
                });
            } else {
                // Create new rule for this date range
                await prisma.ratePlanRule.create({
                    data: {
                        ratePlanId: ratePlan.id,
                        minLos: params.minLos ?? 1,
                        maxLos: params.maxLos ?? 0,
                        isActive: true,
                    },
                });
            }
        }
    }
    public static async upsertBookingOffset(params: {
        propertyCode: string;
        ratePlanCode: string;
        date: Date;
        minAdvanceBookingDays?: number;
        maxAdvanceBookingDays?: number;
    }): Promise<void> {
        const {
            propertyCode,
            ratePlanCode,
            date,
            minAdvanceBookingDays,
            maxAdvanceBookingDays,
        } = params;

        // Find rate plan
        const ratePlan = await prisma.ratePlan.findFirst({
            where: {
                ratePlanCode,
                property: { propertyCode },
            },
            select: { id: true, ratePlanName: true, propertyId: true },
        });

        if (!ratePlan) return;

        // Convert days to hours
        const minHours =
            minAdvanceBookingDays !== undefined
                ? minAdvanceBookingDays * 24
                : undefined;

        const maxHours =
            maxAdvanceBookingDays !== undefined
                ? maxAdvanceBookingDays * 24
                : undefined;

        // Upsert BookingOffset
        await prisma.bookingOffset.upsert({
            where: {
                ratePlanId_date: {
                    ratePlanId: ratePlan.id,
                    date,
                },
            },
            update: {
                ...(minHours !== undefined && {
                    minimumAdvanceBookingOffset: minHours,
                }),
                ...(maxHours !== undefined && {
                    maximumAdvanceBookingOffset: maxHours,
                }),
            },
            create: {
                propertyId: ratePlan.propertyId,
                ratePlanId: ratePlan.id,
                ratePlanCode,
                ratePlanName: ratePlan.ratePlanName,
                date,
                minimumAdvanceBookingOffset: minHours ?? null,
                maximumAdvanceBookingOffset: maxHours ?? null,
            },
        });
    }
}
