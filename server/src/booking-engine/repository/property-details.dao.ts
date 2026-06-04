import { prisma } from "../../config";
import { IPropertyDetailsContext } from "../types/property-details.type";

export class PropertyDetailsDao {
    public async getPropertyDetailsByCode(propertyCode: string):Promise<IPropertyDetailsContext | null> {
        try {
            return await prisma.property.findUnique({
                where:{
                    propertyCode
                },
                select:{
                    id:true,
                    propertyName:true,
                    propertyCode:true,
                    bookingEngineConfig:true,
                    propertyAddress:true,
                    propertyConfigs:{
                        select:{
                            isSpaModuleEnabled:true,
                            isLoyaltyProgramEnabled:true,
                            isB2cAvailable:true,
                            isB2bAvailable:true
                        }
                    }
                }
            })
        } catch (error) {
            throw new Error("Failed to fetch property details");
        }
    }
}