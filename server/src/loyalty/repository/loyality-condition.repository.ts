import { prisma } from '../../config';
import {
    ICLoyalityCondition,
    ICLoyalitySpecialCondition,
    IULoyalityCondition,
    ILoyalityCondition,
    ILoyalitySpecialCondition,
    IULoyalitySpecialCondition,
} from '../types';

export class LoyalityConditionRepository {
    public async createLoyalityCondition(
        data: ICLoyalityCondition
    ): Promise<ILoyalityCondition> {
        try {
            return await prisma.loyaltyConditions.create({
                data,
            });
        } catch (error) {
            throw new Error('Error creating loyalty condition ');
        }
    }
    public async getById(id: string): Promise<ILoyalityCondition | null> {
        try {
            return await prisma.loyaltyConditions.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error fetching loyalty condition by id ');
        }
    }
    public async updateLoyalityCondition(
        id: string,
        data: IULoyalityCondition
    ): Promise<ILoyalityCondition> {
        try {
            return await prisma.loyaltyConditions.update({
                where: { id },

                data,
            });
        } catch (error) {
            throw new Error('Error updating loyalty condition ');
        }
    }
    public async deleteLoyalityCondition(
        id: string
    ): Promise<ILoyalityCondition> {
        try {
            return await prisma.loyaltyConditions.update({
                where: { id },
                data: { isDeleted: true },
            });
        } catch (error) {
            throw new Error('Error deleting loyalty condition ');
        }
    }

    public async getConditionsByProgramId(
        loyaltyProgramId: string
    ): Promise<ILoyalityCondition[]> {
        try {
            return await prisma.loyaltyConditions.findMany({
                where: { loyaltyProgramId, isDeleted: false },
            });
        } catch (error) {
            throw new Error('Error fetching loyalty conditions by program id ');
        }
    }
}

export class LoyalitySpecialConditionRepository {
    public async createLoyalitySpecialCondition(
        data: ICLoyalitySpecialCondition
    ): Promise<ILoyalitySpecialCondition> {
        try {
            return await prisma.loyaltySpecialCondition.create({
                data,
            });
        } catch (error) {
            throw new Error('Error creating loyalty special condition ');
        }
    }
    public async getById(
        id: string
    ): Promise<ILoyalitySpecialCondition | null> {
        try {
            return await prisma.loyaltySpecialCondition.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error fetching loyalty special condition by id ');
        }
    }
    public async updateLoyalitySpecialCondition(
        id: string,
        data: IULoyalitySpecialCondition
    ): Promise<ILoyalitySpecialCondition> {
        try {
            return await prisma.loyaltySpecialCondition.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error('Error updating loyalty special condition ');
        }
    }
    public async deleteLoyalitySpecialCondition(
        id: string
    ): Promise<ILoyalitySpecialCondition> {
        try {
            return await prisma.loyaltySpecialCondition.update({
                where: { id },
                data: { isDeleted: true },
            });
        } catch (error) {
            throw new Error('Error deleting loyalty special condition ');
        }
    }
    public async getSpecialConditionsByProgramId(
        loyaltyProgramId: string
    ): Promise<ILoyalitySpecialCondition[]> {
        try {
            return await prisma.loyaltySpecialCondition.findMany({
                where: { loyaltyProgramId, isDeleted: false },
            });
        } catch (error) {
            throw new Error(
                'Error fetching loyalty special conditions by program id '
            );
        }
    }
}
