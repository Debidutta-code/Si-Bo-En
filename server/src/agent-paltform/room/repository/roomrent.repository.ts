import { prisma } from "../../../config";
import { toUTCDate } from "../../../utils";

export class AgentPricingRepository {
    
    public static async getRatePlanWithTax(ratePlanCode: string) {
        try {
            return await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                include: {
                    taxGroup: {
                        include: {
                            taxGroupRules: {
                                include: { taxRule: true },
                            },
                        },
                    },
                    Addons: {
                        include: {
                            addon: true,
                        }
                    },
                },
            });
        } catch (error) {
            throw new Error("Failed to fetch rate plan details");
        }
    }

    public static async getAgencyDetails(agencyId: string) {
        try {
            return await prisma.agency.findUnique({
                where: { 
                    id: agencyId,
                    isDeleted: false 
                },
                select: {
                    id: true,
                    agencyName: true,
                    commissionType: true,
                    commissionValue: true,
                    commissionCurrency: true
                }
            });
        } catch (error) {
            throw new Error("Failed to fetch agency details");
        }
    }

    public static async checkInventoryAvailability(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        stayDates: Date[]
    ) {
        try {
            return await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    date: { in: stayDates },
                },
            });
        } catch (error) {
            throw new Error("Failed to check inventory availability");
        }
    }

    public static async getChargeForDate(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        startOfDateUTC: Date,
        endOfDateUTC: Date
    ) {
        try {
            return await prisma.charge.findFirst({
                where: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    date: {
                        gte: startOfDateUTC,
                        lt: endOfDateUTC,
                    },
                    isSaleStopped: false
                },
                include: {
                    baseGuestAmounts: true,
                    additionalGuestAmounts: true,
                },
            });
        } catch (error) {
            throw new Error("Failed to fetch charge details");
        }
    }

    public static async getIncludedAddons(
        addonIds: string[],
        checkInDate: Date,
        checkOutDate: Date
    ) {
        try {
            return await prisma.addon.findMany({
                where: {
                    id: {
                        in: addonIds
                    },
                    isActive: true
                },
                include: {
                    availability: {
                        where: {
                            date: {
                                gte: checkInDate,
                                lt: checkOutDate
                            },
                            isAvailable: true
                        },
                        orderBy: {
                            date: 'asc'
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error("Failed to fetch included addons");
        }
    }
}