// src/modules/restrictions/repository/restriction.repository.ts

import { prisma } from '../../config';
import { RoomRestriction } from '../types/restriction.types';

export class RestrictionRepository {
    public static async applyRestrictions(
        propertyCode: string,
        restrictionType: 'CTA' | 'CTD',
        dates: Date[],
        isActive: boolean,
        notes: string | null,
        roomRestrictions: RoomRestriction[],
        globalRatePlanCodes: string[]
    ): Promise<number> {
        try {
            const restrictionField =
                restrictionType === 'CTA'
                    ? 'isClosedToArrival'
                    : 'isClosedToDeparture';

            const updatePromises = [];

            // Handle global rate plans (apply to all rooms)
            if (globalRatePlanCodes.length > 0) {
                const globalUpdate = prisma.charge.updateMany({
                    where: {
                        propertyCode,
                        ratePlanCode: { in: globalRatePlanCodes },
                        date: { in: dates },
                    },
                    data: {
                        [restrictionField]: isActive,
                        restrictionNotes: notes,
                    },
                });
                updatePromises.push(globalUpdate);
            }

            // Handle room-specific restrictions
            for (const roomRestriction of roomRestrictions) {
                const roomUpdate = prisma.charge.updateMany({
                    where: {
                        propertyCode,
                        roomTypeCode: roomRestriction.roomTypeCode,
                        ratePlanCode: { in: roomRestriction.ratePlanCodes },
                        date: { in: dates },
                    },
                    data: {
                        [restrictionField]: isActive,
                        restrictionNotes: notes,
                    },
                });
                updatePromises.push(roomUpdate);
            }

            // Execute all updates
            const results = await Promise.all(updatePromises);

            // Sum up all affected records
            const totalAffected = results.reduce(
                (sum, result) => sum + result.count,
                0
            );

            return totalAffected;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to apply restrictions: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while applying restrictions'
            );
        }
    }

    public static async getRatePlansByNames(
        propertyCode: string,
        ratePlanNames: string[]
    ): Promise<any[]> {
        try {
            return await prisma.ratePlan.findMany({
                where: {
                    property: {
                        propertyCode: propertyCode,
                    },
                    ratePlanName: { in: ratePlanNames },
                },
                select: {
                    ratePlanCode: true,
                    ratePlanName: true,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch rate plans: ${error.message}`);
            }
            throw new Error('Unknown error occurred while fetching rate plans');
        }
    }

    public static async getRestrictionsByProperty(
        propertyCode: string,
        startDate?: Date,
        endDate?: Date,
        restrictionType?: 'CTA' | 'CTD',
        roomTypeCode?: string,
        ratePlanCode?: string
    ): Promise<any[]> {
        try {
            const whereClause: any = {
                propertyCode,
            };

            // Add date range filter if provided
            if (startDate && endDate) {
                whereClause.date = {
                    gte: startDate,
                    lte: endDate,
                };
            }

            // Add restriction type filter
            if (restrictionType === 'CTA') {
                whereClause.isClosedToArrival = true;
            } else if (restrictionType === 'CTD') {
                whereClause.isClosedToDeparture = true;
            } else {
                // If no type specified, get both
                whereClause.OR = [
                    { isClosedToArrival: true },
                    { isClosedToDeparture: true },
                ];
            }

            if (roomTypeCode) {
                whereClause.roomTypeCode = roomTypeCode;
            }

            if (ratePlanCode) {
                whereClause.ratePlanCode = ratePlanCode;
            }

            return await prisma.charge.findMany({
                where: whereClause,
                select: {
                    id: true,
                    propertyCode: true,
                    ratePlanCode: true,
                    ratePlanName: true,
                    roomTypeCode: true,
                    roomTypeName: true,
                    date: true,
                    isClosedToArrival: true,
                    isClosedToDeparture: true,
                    restrictionNotes: true,
                },
                orderBy: {
                    date: 'asc',
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(
                    `Failed to fetch restrictions: ${error.message}`
                );
            }
            throw new Error(
                'Unknown error occurred while fetching restrictions'
            );
        }
    }
}
