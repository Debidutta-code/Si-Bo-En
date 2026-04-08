import { prisma } from "../../config/db.config";
import {
    ICLoyalityLevels,
    ILoyalityLevels
} from "../types";

export class LoyalityLevelRepository {
    public async create(data: ICLoyalityLevels): Promise<ILoyalityLevels> {
        try {
            const loyaltyLevel = await prisma.loyalityLevel.create({ data });            
            return loyaltyLevel;
        } catch (error) {
            console.log(error);
            throw new Error(`Failed to create loyalty level`);
        }
    }

    public async findAllByPropertyConfigId(propertyLoyaltyConfigId: string): Promise<ILoyalityLevels[]> {
        try {
            return await prisma.loyalityLevel.findMany({
                where: { creationLoyaltyConfigId:propertyLoyaltyConfigId }
            });
        } catch (error) {
            throw new Error(`Failed to retrieve loyalty levels`);
        }
    }

    public async findById(id: string): Promise<ILoyalityLevels | null> {
        try {
            return await prisma.loyalityLevel.findUnique({ where: { id } });
        } catch (error) {
            throw new Error(`Failed to retrieve loyalty level`);
        }
    }

    public async update(id: string, data: Partial<ICLoyalityLevels>): Promise<ILoyalityLevels | null> {
        try {
            return await prisma.loyalityLevel.update({ where: { id }, data });
        } catch (error) {
            throw new Error(`Failed to update loyalty level`);
        }
    }

    public async delete(id: string): Promise<ILoyalityLevels | null> {
        try {
            return await prisma.loyalityLevel.delete({ where: { id } });
        } catch (error) {
            throw new Error(`Failed to delete loyalty level`);
        }
    }
}