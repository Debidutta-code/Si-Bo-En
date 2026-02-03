import { prisma } from "../../config";
import {
    ICreationLoyality,
    ICCreationLoyality,
    ICreationLoyalityWithProperty,
    IUCreationLoyalty
} from "../types/creation-loyality.types";

export class creationLoyalityRepository {
    public async createCreationLoyality(data: ICCreationLoyality): Promise<ICCreationLoyality> {
        try {
            return await prisma.creationLoyaltyConfig.create({
                data
            });
        } catch (error) {
            throw new Error("Failed to create creation loyalty");
        }
    }
    
    public async updateCreationLoyality(creationLoyalityId: string, data: IUCreationLoyalty): Promise<ICCreationLoyality> {
        try {
            return await prisma.creationLoyaltyConfig.update({
                where: {
                    id: creationLoyalityId
                },
                data
            });
        } catch (error) {
            throw new Error("Failed to update creation loyalty");
        }
    }
    
    public async deleteLoyality(creationLoyalityId: string): Promise<ICCreationLoyality> {
        try {
            return await prisma.creationLoyaltyConfig.delete({
                where: {
                    id: creationLoyalityId
                }
            });
        } catch (error) {
            throw new Error("Failed to delete creation loyalty");
        }
    }
    
    public async getCreationLoyalityById(creationLoyalityId: string): Promise<ICreationLoyality | null> {
        try {
            return await prisma.creationLoyaltyConfig.findUnique({
                where: {
                    id: creationLoyalityId
                },
                include: {
                    BasicLoyaltyProgram: true,
                    AdvanceLoyaltyProgram: true,
                    loyaltyAdvanceProgram: true,
                    loyaltySpecialCondition: true,
                    LoyaltyProgramFieldConfig: true
                }
            });
        } catch (error) {
            throw new Error("Failed to get creation loyalty by id");
        }
    }
    
    public async getLoyalityByCreation(creationId: string): Promise<ICreationLoyality | null> {
        try {
            return await prisma.creationLoyaltyConfig.findUnique({
                where: {
                    creationId
                },
                include: {
                    BasicLoyaltyProgram: true,
                    AdvanceLoyaltyProgram: true,
                    loyaltyAdvanceProgram: true,
                    loyaltySpecialCondition: true,
                    LoyaltyProgramFieldConfig: true
                }
            });
        } catch (error) {
            throw new Error("Failed to get loyalty by creation");
        }
    }
    
    public async getAllCreationLoyalityWithProperty(creationId: string): Promise<ICreationLoyalityWithProperty | null> {
        try {
            return await prisma.creationLoyaltyConfig.findUnique({
                where: {
                    creationId
                },
                include: {
                    PropertyLoyaltyConfig: true,
                    AdvanceLoyaltyProgram: true,
                    BasicLoyaltyProgram: true,
                    loyaltyAdvanceProgram: true,
                    LoyaltyProgramFieldConfig: true,
                    loyaltySpecialCondition: true
                }
            });
        } catch (error) {
            throw new Error("Failed to get all creation loyalty with property");
        }
    }
}