import { prisma } from "../../../config";
import { IRatePlan } from "../types";

export class AgenticRatePlanRepository{
    public async getRatePlans(propertyId:string):Promise<IRatePlan[]>{
        try {
            return await prisma.ratePlan.findMany({
                where: {
                    propertyId,
                    b2bAvailable:true,
                    
                },
                include:{
                    cancellationPolicy:true,
                    depositPolicy:true,
                    guaranteePolicy:true,
                }
            });
        } catch (error) {
            throw new Error("Failed to retrieve rate plans");
        }
    }
}