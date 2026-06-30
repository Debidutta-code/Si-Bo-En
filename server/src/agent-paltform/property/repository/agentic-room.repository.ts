import { prisma } from '../../../config';
import { toUTCDate } from '../../../utils';

export class AgenticRoomRepository {
    public async agenticRooms(agenticPropertyId: string) {
        return prisma.agenticRoom.findMany({
            where: {
                agenticPropertyId,
                isActive: true,
                isDeleted: false,
            },
            include: {
                room: {
                    include: {
                        roomVideos: true,
                        roomAmenities: {
                            include: {
                                amenity: true,
                            },
                        },
                    },
                },
            },
        });
    }

    public async getAgenticRoomById(agenticRoomId: string) {
        return prisma.agenticRoom.findUnique({
            where: {
                id: agenticRoomId,
            },
            include: {
                room: {
                    include: {
                        roomVideos: true,
                        roomAmenities: {
                            include: {
                                amenity: true,
                            },
                        },
                    },
                },
            },
        });
    }

    public async getInventoryByProperty(
        propertyCode: string,
        roomTypeCode: string,
        dates: Date[]
    ) {
        return prisma.inventory.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                date: { in: dates },
                availability: { gt: 0 },
            },
        });
    }

    public async getCharges(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        dates: Date[]
    ) {
        return prisma.charge.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                date: { in: dates },
                isAvailable: true,
            },
            include: {
                baseGuestAmounts: true,
                additionalGuestAmounts: true,
            },
            orderBy: { date: 'asc' },
        });
    }

   public async getAutoAppliedMLOS(ratePlanId: string, startDate: Date, endDate: Date) {
    try {
        return await prisma.ratePlanRule.findMany({
            where: {
                isAutoApplied: true,
                isActive: true,
                ratePlanId,
                OR: [{ startDate: null }, { startDate: { lte: startDate } }],
                AND: [{ OR: [{ endDate: null }, { endDate: { gt: endDate } }] }],
            },
        });
    } catch (error) {
        throw new Error('Failed to get auto applied MLOS');
    }
}

public async getAutoAppliedPromotions(ratePlanId: string, startDate: Date, endDate: Date) {
    try {
        return await prisma.promotion.findMany({
            where: {
                ratePlanId,
                isActive: true,
                isAutoApplied: true,
                OR: [{ validFrom: null }, { validFrom: { lte: startDate } }],
                AND: [{ OR: [{ validTo: null }, { validTo: { gte: startDate } }] }],
            },
        });
    } catch (error) {
        throw new Error('Failed to get auto applied promotions');
    }
}

public async getGeoRatePlans(ratePlanId: string) {
    try {
        return await prisma.geoRatePlan.findMany({
            where: { ratePlanId, isActive: true },
        });
    } catch (error) {
        throw new Error('Failed to get geo rate plans');
    }
}
    public async getRatePlanRule(ratePlanId: string) {
        return prisma.ratePlanRule.findUnique({
            where: { ratePlanId },
        });
    }

    public async getTouristTax(roomId: string) {
        return prisma.touristTaxes.findFirst({
            where: { roomId },
        });
    }

    public async getBookingOffset(ratePlanId: string, checkInDate: Date) {
        return prisma.bookingOffset.findFirst({
            where: {
                ratePlanId,
                date: checkInDate,
                isActive: true,
            },
        });
    }
    public async getRatePlanAddons(ratePlanId: string) {
        return prisma.ratePlanWithAddon.findMany({
            where: { ratePlanId },
            include: {
                addon: {
                    include: {
                        category: true,
                        subCategory: true,
                        addonVariant: true,
                        ChildAddons: true,
                    },
                },
            },
        });
    }

    public async getAddonAvailability(addonId: string, dates: Date[]) {
        return prisma.addonAvailability.findMany({
            where: {
                addonId,
                date: { in: dates },
                isAvailable: true,
            },
            orderBy: { date: 'asc' },
        });
    }
}