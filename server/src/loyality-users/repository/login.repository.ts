import { prisma } from '../../config';
import { ILoginResponseR } from '../types';

export class LoyalityLoginRepository {
    public async getByUserId(id: string) {
        try {
            return await prisma.customers.findUnique({
                where: { id },
                include: {
                    CreationGuest: {
                        include: {
                            CreationLoyaltyConfig: {
                                include: {
                                    BasicLoyaltyProgram: true,
                                    AdvanceLoyaltyProgram: true,
                                    LoyaltyProgramFieldConfig: true,
                                    loyaltyConditions: true,
                                    loyaltySpecialConditions: true,
                                    LoyalityLevels: true,
                                    PropertyLoyaltyConfig: {
                                        include: {
                                            Property: {
                                                select: {
                                                    id: true,
                                                    propertyCode: true,
                                                    propertyName: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                } as any,
            });
        } catch (error) {
            throw new Error('Error occur while finding user');
        }
    }
}