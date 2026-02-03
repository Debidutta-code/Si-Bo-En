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
            throw new Error("failed to create creation loyality");
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
            throw new Error("failed to update creation loyality");
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
            throw new Error("failed to delete creation loyality");
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
            throw new Error("failed to get creation loyality by id");
        }
    }
    public async getLoyalityByCreation(creationId: string): Promise<ICreationLoyality | null> {
        try {
            return await prisma.creationLoyaltyConfig.findUnique({
                where: {
                    creationId
                }, include: {
                    BasicLoyaltyProgram: true,
                    AdvanceLoyaltyProgram: true,
                    loyaltyAdvanceProgram: true,
                    loyaltySpecialCondition: true,
                    LoyaltyProgramFieldConfig: true
                }
            })
        } catch (error) {
            throw new Error("failed to get loyality by creation ");
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
            })
        } catch (error) {
            throw new Error("failed to get all creation loyality with property ");
        }
    }


}