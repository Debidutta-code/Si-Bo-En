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
                    propertyVideos: true
                }
            })
        } catch (error) {
            throw new Error("Failed to retrieve properties");
        }
    }
    public async getAgenticPropertyById(agenticPropertyId: string): Promise<IProperty | null> {
        try {
            return await prisma.property.findUnique({
                where: {
                    id: agenticPropertyId
                },
                include: {
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
                    propertyVideos: true
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