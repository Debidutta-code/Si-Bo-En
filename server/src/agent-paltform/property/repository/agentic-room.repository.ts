import { prisma } from "../../../config";
import { toUTCDate } from "../../../utils";

export class AgenticRoomRepository {
    public async agenticRooms(agenticPropertyId: string) {
        return prisma.agenticRoom.findMany({
            where: {
                agenticPropertyId,
                isActive: true,
                isDeleted: false
            },
            include: {
                room: {
                    include: {
                        roomVideos: true,
                        roomAmenities: {
                            include: {
                                amenity: true
                            }
                        }
                    }
                }
            }
        });
    }

    public async getAgenticRoomById(agenticRoomId: string) {
        return prisma.agenticRoom.findUnique({
            where: {
                id: agenticRoomId
            },
            include: {
                room: {
                    include: {
                        roomVideos: true,
                        roomAmenities: {
                            include: {
                                amenity: true
                            }
                        }
                    }
                }
            }
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

    public async getGeoRatePlan(
        propertyId: string,
        roomId: string,
        ratePlanId: string,
        countryCode: string
    ) {
        const roomSpecificGeo = await prisma.geoRatePlan.findFirst({
            where: {
                propertyId,
                roomId,
                ratePlanId,
                countryCode: { has: countryCode },
                isActive: true,
            },
        });

        if (roomSpecificGeo) return roomSpecificGeo;

        return prisma.geoRatePlan.findFirst({
            where: {
                propertyId,
                roomId: null,
                ratePlanId,
                countryCode: { has: countryCode },
                isActive: true,
            },
        });
    }

    public async getRatePlanRule(ratePlanId: string) {
        return prisma.ratePlanRule.findUnique({
            where: { ratePlanId },
        });
    }

    public async getTouristTax(ratePlanId: string) {
        return prisma.touristTaxes.findFirst({
            where: { ratePlanId },
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
}