// dao/siteminder.dao.ts

import { prisma } from '../../../config';
import { CurrencyCode } from '../../../tax-system/interfaces/tourist-tax.type';

export class SiteMinderDao {

    public static async getProperty(propertyCode: string): Promise<{ propertyId: string } | null> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true },
            });
            if (!property) return null;
            return { propertyId: property.id };
        } catch {
            throw new Error("Failed to fetch property");
        }
    }

    public static async propertyExists(propertyCode: string): Promise<boolean> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true },
            });
            return !!property;
        } catch {
            throw new Error('Failed to verify property existence');
        }
    }

    /**
     * Get property base currency — used for currency conversion check
     */
    public static async getPropertyCurrency(propertyCode: string): Promise<string | null> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select:{
                    propertyConfigs:{
                        select:{
                            baseCurrency:true
                        }
                    }
                }
            });
            return property?.propertyConfigs?.baseCurrency ?? null;
        } catch {
            return null;
        }
    }

    // ─── RATES ────────────────────────────────────────────────────────────────

    public static async getRatePlanName(ratePlanCode: string): Promise<string | null> {
        const rp = await prisma.ratePlan.findUnique({
            where: { ratePlanCode },
            select: { ratePlanName: true },
        });
        return rp?.ratePlanName ?? null;
    }

    public static async getRoomTypeName(
        roomTypeCode: string,
        propertyCode: string
    ): Promise<string | null> {
        const room = await prisma.room.findFirst({
            where: {
                roomType: roomTypeCode,
                property: { propertyCode },
            },
            select: { roomName: true },
        });
        return room?.roomName ?? null;
    }

    /**
     * Upsert a charge record (rate for a specific room/rate plan/date)
     */
    public static async upsertCharge(params: {
        propertyCode: string;
        roomTypeCode: string;
        ratePlanCode: string;
        ratePlanName: string;
        roomTypeName: string;
        date: Date;
        currencyCode: CurrencyCode;
        baseByGuestAmounts: Array<{
            numberOfGuests: number;
            amountBeforeTax: number;
        }>;
        additionalGuestAmounts: Array<{
            ageQualifyingCode: string;
            amount: number;
        }>;
    }): Promise<void> {
        const {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            ratePlanName,
            roomTypeName,
            date,
            currencyCode,
            baseByGuestAmounts,
            additionalGuestAmounts,
        } = params;

        const existing = await prisma.charge.findFirst({
            where: { propertyCode, roomTypeCode, ratePlanCode, date },
            select: { id: true },
        });

        if (existing) {
            await prisma.$transaction([
                prisma.chargeBaseByGuest.deleteMany({ where: { chargeId: existing.id } }),
                prisma.chargeAdditionalGuest.deleteMany({ where: { chargeId: existing.id } }),
                prisma.charge.update({
                    where: { id: existing.id },
                    data: { currencyCode },
                }),
                prisma.chargeBaseByGuest.createMany({
                    data: baseByGuestAmounts.map(bg => ({
                        chargeId: existing.id,
                        numberOfGuests: bg.numberOfGuests,
                        amountBeforeTax: bg.amountBeforeTax,
                    })),
                }),
                ...(additionalGuestAmounts.length > 0
                    ? [
                        prisma.chargeAdditionalGuest.createMany({
                            data: additionalGuestAmounts.map(ag => ({
                                chargeId: existing.id,
                                ageQualifyingCode: ag.ageQualifyingCode,
                                amount: ag.amount,
                            })),
                        }),
                    ]
                    : []),
            ]);
        } else {
            await prisma.charge.create({
                data: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    ratePlanName,
                    roomTypeName,
                    date,
                    currencyCode,
                    baseGuestAmounts: {
                        create: baseByGuestAmounts.map(bg => ({
                            numberOfGuests: bg.numberOfGuests,
                            amountBeforeTax: bg.amountBeforeTax,
                        })),
                    },
                    additionalGuestAmounts: {
                        create: additionalGuestAmounts.map(ag => ({
                            ageQualifyingCode: ag.ageQualifyingCode,
                            amount: ag.amount,
                        })),
                    },
                },
            });
        }
    }

    // ─── AVAILABILITY + RESTRICTIONS ─────────────────────────────────────────

    public static async upsertInventoryAndRestrictions(params: {
        propertyCode: string;
        roomTypeCode: string;
        ratePlanCode: string;
        date: Date;
        bookingLimit?: number;
        isSaleStopped?: boolean;
        isClosedToArrival?: boolean;
        isClosedToDeparture?: boolean;
    }): Promise<void> {
        const {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date,
            bookingLimit,
            isSaleStopped,
            isClosedToArrival,
            isClosedToDeparture,
        } = params;

        // 1. Upsert inventory count (room level)
        if (bookingLimit !== undefined) {
            const existingInv = await prisma.inventory.findFirst({
                where: { propertyCode, roomTypeCode, date },
                select: { id: true },
            });

            if (existingInv) {
                await prisma.inventory.update({
                    where: { id: existingInv.id },
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

        // 2. Upsert restrictions (room + rate plan level)
        const hasRestrictions =
            isSaleStopped !== undefined ||
            isClosedToArrival !== undefined ||
            isClosedToDeparture !== undefined;

        if (hasRestrictions) {
            const existingCharge = await prisma.charge.findFirst({
                where: { propertyCode, roomTypeCode, ratePlanCode, date },
                select: { id: true },
            });

            const restrictionData = {
                ...(isSaleStopped !== undefined && { isSaleStopped }),
                ...(isClosedToArrival !== undefined && { isClosedToArrival }),
                ...(isClosedToDeparture !== undefined && { isClosedToDeparture }),
            };

            if (existingCharge) {
                await prisma.charge.update({
                    where: { id: existingCharge.id },
                    data: restrictionData,
                });
            } else {
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
    }

    public static async upsertLengthOfStay(params: {
        propertyCode: string;
        ratePlanCode: string;
        date: Date;
        minLos?: number;
        maxLos?: number;
    }): Promise<void> {
        const { propertyCode, ratePlanCode, date, minLos, maxLos } = params;

        const ratePlan = await prisma.ratePlan.findFirst({
            where: { ratePlanCode, property: { propertyCode } },
            select: { id: true },
        });

        if (!ratePlan) return;

        const existingRule = await prisma.ratePlanRule.findFirst({
            where: {
                ratePlanId: ratePlan.id,
                OR: [
                    { startDate: null, endDate: null },
                    { startDate: { lte: date }, endDate: { gte: date } },
                ],
            },
            select: { id: true },
        });

        if (existingRule) {
            await prisma.ratePlanRule.update({
                where: { id: existingRule.id },
                data: {
                    ...(minLos !== undefined && { minLos }),
                    ...(maxLos !== undefined && { maxLos }),
                },
            });
        } else {
            await prisma.ratePlanRule.create({
                data: {
                    ratePlanId: ratePlan.id,
                    minLos: minLos ?? 1,
                    maxLos: maxLos ?? 0,
                    isActive: true,
                },
            });
        }
    }
}