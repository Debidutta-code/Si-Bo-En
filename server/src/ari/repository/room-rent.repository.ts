import {prisma} from "../../config";

export class RoomRentCalculationRepository {
    public static async getPromotionDetails(data:{id: string ,promotionType: "early_bird"|"offer_for_tonight"|"device_specific"}[]) {
        try {
            return await prisma.promotion.findMany({
                where: {
                    OR: data.map(item => ({
                        id: item.id,
                        promotionType: item.promotionType
                    })),
                    isActive: true
                }
            })
        } catch (error) {
            throw new Error("Failed to fetch promotion details");
        }
    }
    public static async getRatePlanDetails(ratePlanCode: string) {
        try {
            return await prisma.ratePlan.findUnique({
                where: {
                    ratePlanCode
                },include:{
                    ratePlanRules:true,
                    Addons:true,
                }
            })
        }
        catch (error) {
            throw new Error("Failed to fetch rate plan details");
        }
    }
    public static async getGroRatePlan(propertyId:string,roomTypeCode:string,ratePlanCode:string,countryCode:string) {
        try {
            const whereClause:any = {
                propertyId,
                roomTypeCode: roomTypeCode ? roomTypeCode : null,
                ratePlanCode: ratePlanCode ? ratePlanCode : null,
            }
            return await prisma.geoRatePlan.findFirst(
                {
                    where:{
                        ...whereClause,
                        countryCode:{
                            in: [countryCode]
                        },
                        isActive:true,
                    },
                }
            )
        } catch (error) {
            throw new Error("Failed to fetch geo-based rate plan details");
        }
    }
    public static async findAddonsForReservations(addOnIds:string[],checkInDate:Date,checkOutDate:Date) {
        try {
            return await prisma.addon.findMany({
                where: {
                    id: {
                        in: addOnIds
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
            })
        }
        catch (error) {
            throw new Error("Failed to fetch addons for reservations");
        }
    }
}