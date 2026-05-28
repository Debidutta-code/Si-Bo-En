import { prisma } from '../../config';
import {
    ICloyaltyProgram,
    IPropertyLoyaltyConfig,
    IULoyalityProgram,
    IloyaltyProgram,
} from '../types';
export class LoyaltyProgramRepository {
    public async createLoyaltyProgram(
        data: ICloyaltyProgram
    ): Promise<IloyaltyProgram> {
        try {
            return await prisma.basicLoyaltyProgram.create({
                data,
            });
        } catch (error) {
            throw new Error('Error creating loyalty program');
        }
    }

    public async updateLoyaltyProgram(
        loyaltyProgramId: string,
        data: IULoyalityProgram
    ): Promise<IULoyalityProgram> {
        try {
            return await prisma.basicLoyaltyProgram.update({
                where: { loyaltyProgramId },
                data: {
                    isActive: data.isActive,
                    logo: data.logo,
                },
            });
        } catch (error) {
            throw new Error('Error updating loyalty program');
        }
    }

    public async getLoyaltyProgramById(
        loyaltyProgramId: string
    ): Promise<IloyaltyProgram | null> {
        try {
            return await prisma.basicLoyaltyProgram.findUnique({
                where: { loyaltyProgramId },
            });
        } catch (error) {
            throw new Error('Error fetching loyalty program');
        }
    }

    public async getLoyaltyProgramByCreationId(
        creationId: string
    ): Promise<any> {
        try {
            return await prisma.creationLoyaltyConfig.findUnique({
                where: { creationId },
                include: {
                    BasicLoyaltyProgram: true,
                },
            });
        } catch (error) {
            throw new Error('Error fetching loyalty program by creation ID');
        }
    }
    public async getPropertyLoyaltyProgramByCreationId(
        creationLoyaltyConfigId: string
    ): Promise<IPropertyLoyaltyConfig[]> {
        try {
            return await prisma.propertyLoyaltyConfig.findMany({
                where: {
                    creationLoyaltyConfigId,
                },
                include: {
                    CreationLoyaltyConfig: true,
                },
            });
        } catch (error) {
            throw new Error('Error fetching loyalty program by creation ID');
        }
    }
    public async deleteLoyaltyProgram(
        loyaltyProgramId: string
    ): Promise<IloyaltyProgram> {
        try {
            return await prisma.basicLoyaltyProgram.delete({
                where: { loyaltyProgramId },
            });
        } catch (error) {
            throw new Error('Error deleting loyalty program');
        }
    }
}

