import { DateTime } from 'luxon';
import { prisma } from '../../config';
import { toUTCDate } from '../../utils';

export class RoomBookingRepository {
    public static async getPropertyByCode(propertyCode: string) {
        return prisma.property.findUnique({
            where: { propertyCode },
            include: {
                propertyAddress: true,
                propertyAmenities: {
                    include: { amenity: true },
                },
                loyaltyProgramConfig: {
                    where: { isActive: true },
                    include: {
                        CreationLoyaltyConfig: {
                            include: {
                                AdvanceLoyaltyProgram: true,
                                BasicLoyaltyProgram: true,
                                loyaltyConditions: true,
                                LoyaltyProgramFieldConfig: true,
                                loyaltySpecialConditions: true,
                            },
                        },
                    },
                },
                propertyVideos: true,
                propertyRooms: {
                    where: { isDeleted: false, available: true },
                    include: {
                        roomAmenities: { include: { amenity: true } },
                        roomVideos: true,
                    },
                },
                propertyConfigs: true,
                ratePlans: {
                    include: {
                        depositPolicy: true,
                        cancellationPolicy: true,
                        guaranteePolicy: true,
                    },
                },
                bookingEngineConfig: true,
            },
        });
    }

    public static async getInventoryByProperty(
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

    public static async getCharges(
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
                isSaleStopped: false,
            },
            include: {
                baseGuestAmounts: true,
                additionalGuestAmounts: true,
            },
            orderBy: { date: 'asc' },
        });
    }

    public static async getRatePlanAddons(ratePlanId: string) {
        return prisma.ratePlanWithAddon.findMany({
            where: { ratePlanId },
            include: {
                addon: {
                    include: {
                        category: true,
                        subCategory: true,
                        addonVariant: true,
                    },
                },
            },
        });
    }

    public static async getAddonAvailability(addonId: string, dates: Date[]) {
        return prisma.addonAvailability.findMany({
            where: {
                addonId,
                date: { in: dates },
                isAvailable: true,
            },
            orderBy: { date: 'asc' },
        });
    }

    public static async getGeoRatePlan(
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

    public static async getPromotions(
        propertyId: string,
        roomId: string,
        ratePlanId: string,
        checkInDate: Date,
        today: Date,
        numberOfNights: number
    ) {
        const checkInUTC = toUTCDate(checkInDate);
        const todayUTC = toUTCDate(today);
        const dayOfWeek = checkInUTC.getDay();

        const dayApplicability: Record<number, string> = {
            0: 'sunApplicable',
            1: 'monApplicable',
            2: 'tueApplicable',
            3: 'wedApplicable',
            4: 'thuApplicable',
            5: 'friApplicable',
            6: 'satApplicable',
        };

        const dayField = dayApplicability[dayOfWeek];

        const daysBetweenBookingAndCheckIn = Math.floor(
            DateTime.fromJSDate(checkInUTC)
                .diff(DateTime.fromJSDate(todayUTC), 'days')
                .days
        );

        return prisma.promotion.findMany({
            where: {
                propertyId,
                OR: [{ roomId }, { roomId: null }],
                ratePlanId,
                isActive: true,
                promotionType: { not: 'device_specific' },
                AND: [
                    {
                        OR: [
                            { AND: [{ validFrom: null }, { validTo: null }] },
                            {
                                AND: [
                                    {
                                        OR: [
                                            { validFrom: null },
                                            { validFrom: { lte: todayUTC } },
                                        ],
                                    },
                                    {
                                        OR: [
                                            { validTo: null },
                                            { validTo: { gte: checkInUTC } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    { [dayField]: true },
                    {
                        OR: [
                            { promotionType: { not: 'early_bird' } },
                            {
                                AND: [
                                    { promotionType: 'early_bird' },
                                    {
                                        advanceBookingDays: {
                                            lte: daysBetweenBookingAndCheckIn,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        });
    }

    public static async getRatePlanRule(ratePlanId: string) {
        return prisma.ratePlanRule.findUnique({
            where: { ratePlanId },
        });
    }

    public static async getDeviceSpecificPromotion(
        propertyId: string,
        roomId: string,
        ratePlanId: string,
        checkInDate: Date,
        deviceType: string
    ) {
        const checkInUTC = toUTCDate(checkInDate);
        const todayUTC = toUTCDate(new Date());
        const dayOfWeek = checkInUTC.getDay();

        const dayApplicability: Record<number, string> = {
            0: 'sunApplicable',
            1: 'monApplicable',
            2: 'tueApplicable',
            3: 'wedApplicable',
            4: 'thuApplicable',
            5: 'friApplicable',
            6: 'satApplicable',
        };

        const dayField = dayApplicability[dayOfWeek];

        return prisma.promotion.findFirst({
            where: {
                propertyId,
                OR: [{ roomId }, { roomId: null }],
                ratePlanId,
                isActive: true,
                promotionType: 'device_specific',
                deviceType: { has: deviceType as any },
                AND: [
                    {
                        OR: [
                            { AND: [{ validFrom: null }, { validTo: null }] },
                            {
                                AND: [
                                    {
                                        OR: [
                                            { validFrom: null },
                                            { validFrom: { lte: todayUTC } },
                                        ],
                                    },
                                    {
                                        OR: [
                                            { validTo: null },
                                            { validTo: { gte: checkInUTC } },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    { [dayField]: true },
                ],
            },
        });
    }

    public static async getTouristTax(ratePlanId: string) {
        return prisma.touristTaxes.findFirst({
            where: { ratePlanId },
        });
    }
}