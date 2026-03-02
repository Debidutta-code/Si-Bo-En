import { prisma } from "../../config";
import {
    ICPropertyLoyaltyConfig,
    IPropertyLoyalityWithLoyality,
    IPropertyLoyaltyConfig
} from "../types/property-loyality.types";

export class propertyLoyalityRepository {
    public async createPropertyLoyalityConfig(
        data: ICPropertyLoyaltyConfig
    ): Promise<IPropertyLoyaltyConfig> {
        try {
            return await prisma.propertyLoyaltyConfig.create({
                data
            });
        } catch (error) {
            console.log(error)
            throw new Error("Failed to create property loyalty config");
        }
    }

    public async getLoyalityForProperty(propertyId: string): Promise<IPropertyLoyaltyConfig | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId
                },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            BasicLoyaltyProgram: true,
                            AdvanceLoyaltyProgram: true,
                            LoyaltyProgramFieldConfig: true,
                            loyaltyConditions: true,
                            loyaltySpecialConditions: true,
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error("Failed to get loyalty for property");
        }
    }
        public async getLoyalityForPropertyWhereTrue(propertyId: string): Promise<IPropertyLoyaltyConfig | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId,
                },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            BasicLoyaltyProgram: true,
                            AdvanceLoyaltyProgram: true,
                            LoyaltyProgramFieldConfig: true,
                            loyaltyConditions: true,
                            loyaltySpecialConditions: true,
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error("Failed to get loyalty for property");
        }
    }

    public async updatePropertyLoyalityConfig(propertyLoyalityId: string, isActive: boolean): Promise<IPropertyLoyaltyConfig> {
        try {
            return await prisma.propertyLoyaltyConfig.update({
                where: {
                    id: propertyLoyalityId
                },
                data: {
                    isActive
                }
            });
        } catch (error) {
            throw new Error("Failed to update property loyalty config");
        }
    }

    public async deletePropertyLoyalityConfig(propertyLoyalityId: string): Promise<IPropertyLoyaltyConfig> {
        try {
            return await prisma.propertyLoyaltyConfig.delete({
                where: {
                    id: propertyLoyalityId
                }
            });
        } catch (error) {
            throw new Error("Failed to delete property loyalty config");
        }
    }

    public async getAllPropertyLoyalityWithLoyality(propertyId: string): Promise<IPropertyLoyalityWithLoyality[]> {
        try {
            return await prisma.propertyLoyaltyConfig.findMany({
                where: {
                    propertyId,
                },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            BasicLoyaltyProgram: true,
                            AdvanceLoyaltyProgram: true,
                            LoyaltyProgramFieldConfig: true,
                            loyaltyConditions: true,
                            loyaltySpecialConditions: true,
                            PropertyLoyaltyConfig: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error("Failed to get property loyalty with loyalty");
        }
    }

    public async getActiveLoyaltyConfigByPropertyId(propertyId: string): Promise<IPropertyLoyaltyConfig | null> {
        try {
            return await prisma.propertyLoyaltyConfig.findFirst({
                where: {
                    propertyId,
                    isActive: true
                },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            BasicLoyaltyProgram: true,
                            AdvanceLoyaltyProgram: true,
                            LoyaltyProgramFieldConfig: true,
                            loyaltyConditions: true,
                            loyaltySpecialConditions: true,
                            PropertyLoyaltyConfig: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error("Error fetching active loyalty config by property");
        }
    }

    public async getPropertiesByLoyaltyProgram(loyaltyProgramId: string): Promise<IPropertyLoyaltyConfig[]> {
        try {
            return await prisma.propertyLoyaltyConfig.findMany({
                where: {
                    creationLoyaltyConfigId: loyaltyProgramId
                }
            });
        } catch (error) {
            throw new Error("Error fetching properties by loyalty program");
        }
    }
}

