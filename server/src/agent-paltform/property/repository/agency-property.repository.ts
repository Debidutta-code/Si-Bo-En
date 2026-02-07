import { prisma } from "../../../config";
import { IProperty } from "../types";

export class AgenticPropertyRepository {
    public async getAgenticProperties(agencyId: string): Promise<IProperty[]> {
        try {

            return await prisma.property.findMany({
                where: {
                    agenticProperties: {
                        some: {
                            agencyId
                        }
                    }
                }, include: {
                    propertyAddress: true,
                    propertyAmenities: {
                        include: {
                            amenity: true
                        }
                    },
                    propertyCategory: {
                        include: {
                            masterCategory: true
                        }
                    },
                    propertyType: {
                        include: {
                            masterPropertyType: true
                        }
                    },
                    propertyVideos: true,
                    
                }
            })
        } catch (error) {
            throw new Error("Failed to retrieve properties");
        }
    }
    public async getAgenticPropertyById(agencyId:string,propertyId:string) {
        try {
            return await prisma.agenticProperty.findFirst({
                where:{
                    propertyId: propertyId,
                    agencyId: agencyId,
                    isActive:true,
                    isDeleted:false
                },
                include:{
                    Property:true
                }
            })
        } catch (error) {
            throw new Error("Failed to retrieve property");
        }
    }

    public async getAgencyById(agencyId: string) {
        try {
            return await prisma.agency.findUnique({
                where: {
                    id: agencyId,
                    isDeleted:false,

                }
            });
        } catch (error) {
            throw new Error("Failed to retrieve agency");
        }
    }
}