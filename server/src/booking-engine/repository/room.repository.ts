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
                    where: {
                        isActive: true,
                    },
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
                        roomAmenities: {
                            include: { amenity: true },
                        },
                        roomVideos: true,
                    },
                },
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

    /**
     * Get inventory for property and room type
     */
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

    /**
     * Get charges for a specific date
     */
    public static async getCharges(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        dates: Date[]
    ) {
        //console.log('🔍 Query Parameters:', {
        //   propertyCode,
        //   roomTypeCode,
        //   ratePlanCode,
        //   dates: dates,
        // });

        // First, check if ANY charges exist for this room type
        const anyCharges = await prisma.charge.findMany({
            where: {
                propertyCode,
                roomTypeCode,
            },
            take: 5,
        });

        //console.log('📊 Sample charges for this room type:', anyCharges.map(c => ({
        //   date: c.date.toISOString(),
        //   ratePlanCode: c.ratePlanCode,
        //   isAvailable: c.isAvailable,
        //   isSaleStopped: c.isSaleStopped
        // })));

        // Now do the actual query
        const charges = await prisma.charge.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                date: {
                    in: dates,
                },
                isAvailable: true,
                isSaleStopped: false,
            },
            include: {
                baseGuestAmounts: true,
                additionalGuestAmounts: true,
            },
            orderBy: {
                date: 'asc',
            },
        });

        //console.log('✅ Final charges found:', charges.length);

        return charges;
    }

    /**
     * Get addons linked to a rate plan
     */
    public static async getRatePlanAddons(ratePlanId: string) {
        return prisma.ratePlanWithAddon.findMany({
            where: {
                ratePlanId,
            },
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

    /**
     * Get addon availability for date range
     */
    public static async getAddonAvailability(addonId: string, dates: Date[]) {
        return prisma.addonAvailability.findMany({
            where: {
                addonId,
                date: { in: dates },
                isAvailable: true,
            },
            orderBy: {
                date: 'asc',
            },
        });
    }

    /**
     * Get geo-based rate plan adjustment
     */
    public static async getGeoRatePlan(
        propertyId: string,
        roomId: string,
        ratePlanId: string,
        countryCode: string
    ) {
        // First try to find room-specific geo rate
        const roomSpecificGeo = await prisma.geoRatePlan.findFirst({
            where: {
                propertyId,
                roomId,
                ratePlanId,
                countryCode: {
                    has: countryCode,
                },
                isActive: true,
            },
        });

        if (roomSpecificGeo) return roomSpecificGeo;

        // Fall back to property-level geo rate (roomId is null)
        return prisma.geoRatePlan.findFirst({
            where: {
                propertyId,
                roomId: null,
                ratePlanId,
                countryCode: {
                    has: countryCode,
                },
                isActive: true,
            },
        });
    }

    /**
     * Get applicable promotions (excluding device-specific unless matching)
     */
    /**
     * Get applicable promotions (excluding device-specific)
     */
    public static async getPromotions(
        propertyId: string,
        roomId: string,
        ratePlanId: string,
        checkInDate: Date,
        today: Date,
        numberOfNights: number,
        deviceType?: string
    ) {
        // Convert to UTC dates for consistent comparison
        const checkInUTC = toUTCDate(checkInDate);
        const todayUTC = toUTCDate(today);

        const dayOfWeek = checkInUTC.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Map day of week to day applicability fields
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

        // Calculate days between today and check-in for early bird validation
        const daysBetweenBookingAndCheckIn = Math.floor(
            DateTime.fromJSDate(checkInUTC).diff(
                DateTime.fromJSDate(todayUTC),
                'days'
            ).days
        );

        return prisma.promotion.findMany({
            where: {
                propertyId,
                OR: [
                    { roomId: roomId },
                    { roomId: null }, // Property-level promotions
                ],
                ratePlanId,
                isActive: true,

                // ✅ EXCLUDE device-specific promotions completely
                promotionType: {
                    not: 'device_specific',
                },

                // All other conditions
                AND: [
                    // Date range validation
                    {
                        OR: [
                            // No date restrictions
                            { AND: [{ validFrom: null }, { validTo: null }] },
                            // Valid from is in past or null, valid to is in future or null
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
                    // Day of week validation
                    { [dayField]: true },
                    // Early bird validation (advanceBookingDays)
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

    /**
     * Get rate plan rule (for MLOS promotion)
     */
    public static async getRatePlanRule(ratePlanId: string) {
        return prisma.ratePlanRule.findUnique({
            where: { ratePlanId },
        });
    }
    /**
     * Get device-specific promotion for silent application
     */
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
                OR: [{ roomId: roomId }, { roomId: null }],
                ratePlanId,
                isActive: true,
                promotionType: 'device_specific',
                deviceType: {
                    has: deviceType as any,
                },
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
            where: {
                ratePlanId,
            },
        });
    }
}
