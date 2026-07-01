import { prisma } from '../../../config';
import {
    IAgencyDetails,
    ICharge,
    IRoom,
    IRatePlan,
    IInventory,
    IAddonWithAvailability,
    IBookingOffset,
    IRatePlanRule,
} from '../types';

export class AgentPricingRepository {
    public async getAgencyDetails(
        agencyId: string
    ): Promise<IAgencyDetails | null> {
        try {
            const agency = await prisma.agency.findUnique({
                where: {
                    id: agencyId,
                    isDeleted: false,
                },
                select: {
                    id: true,
                    agencyName: true,
                    commissionType: true,
                    commissionValue: true,
                    commissionCurrency: true,
                },
            });

            if (!agency) return null;

            return {
                id: agency.id,
                agencyName: agency.agencyName,
                commissionType: agency.commissionType as 'percentage' | 'fixed',
                commissionValue: agency.commissionValue,
                commissionCurrency: agency.commissionCurrency,
            };
        } catch (error) {
            throw new Error('Failed to fetch agency details');
        }
    }

    public async getRatePlanWithTax(
        ratePlanCode: string
    ): Promise<IRatePlan | null> {
        try {
            return (await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                select: {
                    id: true,
                    ratePlanCode: true,
                    ratePlanName: true,
                    b2bAvailable: true, // ← B2B gate
                    taxGroup: {
                        include: {
                            taxGroupRules: {
                                include: { taxRule: true },
                            },
                        },
                    },
                    Addons: {
                        include: {
                            addon: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    postingRhythm: true,
                                    description: true,
                                    isActive: true,
                                },
                            },
                        },
                    },
                },
            })) as IRatePlan | null;
        } catch (error) {
            throw new Error('Failed to fetch rate plan details');
        }
    }

    public async getRoomByTypeCode(
        propertyCode: string,
        roomTypeCode: string
    ): Promise<IRoom | null> {
        try {
            return (await prisma.room.findFirst({
                where: {
                    property: {
                        propertyCode: propertyCode,
                        isDeleted: false,
                    },
                    roomType: roomTypeCode,
                    isDeleted: false,
                },
                include: {
                    TouristTaxs: true,
                },
            })) as IRoom | null;
        } catch (error) {
            throw new Error('Failed to fetch room details');
        }
    }

    public async getInventoryForDates(
        propertyCode: string,
        roomTypeCode: string,
        dates: Date[]
    ): Promise<IInventory[]> {
        try {
            return (await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    date: { in: dates },
                    availability: { gt: 0 },
                },
            })) as IInventory[];
        } catch (error) {
            throw new Error('Failed to check inventory availability');
        }
    }

    public async getChargesForDates(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        dates: Date[]
    ): Promise<ICharge[]> {
        try {
            return (await prisma.charge.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    date: { in: dates },
                    isSaleStopped: false,
                    isAvailable: true,
                },
                include: {
                    baseGuestAmounts: true,
                    additionalGuestAmounts: true,
                },
                orderBy: { date: 'asc' },
            })) as ICharge[];
        } catch (error) {
            throw new Error('Failed to fetch charge details');
        }
    }

    public async getBookingOffset(
        ratePlanId: string,
        checkInDate: Date
    ): Promise<IBookingOffset | null> {
        try {
            return (await prisma.bookingOffset.findFirst({
                where: {
                    ratePlanId,
                    date: checkInDate,
                    isActive: true,
                },
            })) as IBookingOffset | null;
        } catch (error) {
            throw new Error('Failed to fetch booking offset');
        }
    }

    public async getRatePlanRule(
        ratePlanId: string
    ): Promise<IRatePlanRule | null> {
        try {
            return (await prisma.ratePlanRule.findFirst({
                where: {
                    ratePlanId,
                    isActive: true,
                },
            })) as IRatePlanRule | null;
        } catch (error) {
            throw new Error('Failed to fetch rate plan rule');
        }
    }

    public async getIncludedAddons(
        addonIds: string[],
        dates: Date[]
    ): Promise<IAddonWithAvailability[]> {
        try {
            return (await prisma.addon.findMany({
                where: {
                    id: { in: addonIds },
                    isActive: true,
                },
                include: {
                    availability: {
                        where: {
                            date: { in: dates },
                            isAvailable: true,
                        },
                        orderBy: { date: 'asc' },
                    },
                },
            })) as IAddonWithAvailability[];
        } catch (error) {
            throw new Error('Failed to fetch included addons');
        }
    }
    public async getAutoAppliedMLOS(
    ratePlanId: string,
    startDate: Date,
    endDate: Date
) {
    try {
        return await prisma.ratePlanRule.findMany({
            where: {
                isAutoApplied: true,
                isActive: true,
                ratePlanId,
                OR: [
                    { startDate: null },
                    { startDate: { lte: startDate } },
                ],
                AND: [
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gt: endDate } },
                        ],
                    },
                ],
            },
        });
    } catch (error) {
        throw new Error('Failed to get auto applied MLOS');
    }
}

public async getAutoAppliedPromotions(
    ratePlanId: string,
    startDate: Date,
    endDate: Date
) {
    try {
        return await prisma.promotion.findMany({
            where: {
                ratePlanId,
                isActive: true,
                isAutoApplied: true,
                OR: [
                    { validFrom: null },
                    { validFrom: { lte: startDate } },
                ],
                AND: [
                    {
                        OR: [
                            { validTo: null },
                            { validTo: { gte: startDate } },
                        ],
                    },
                ],
            },
        });
    } catch (error) {
        throw new Error('Failed to get auto applied promotions');
    }
}

public async getGeoRatePlans(ratePlanId: string) {
    try {
        return await prisma.geoRatePlan.findMany({
            where: {
                ratePlanId,
                isActive: true,
            },
        });
    } catch (error) {
        throw new Error('Failed to get geo rate plans');
    }
}

public async findPromoCode(code: string) {
    try {
        return await prisma.promoCode.findUnique({
            where: {
                code,
                isActive: true,
            },
        });
    } catch (error) {
        throw new Error('Failed to fetch promo code');
    }
}
}