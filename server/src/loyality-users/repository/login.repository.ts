import { prisma } from '../../config';
import { ILoyalityGuests } from '../../loyalty/types';
import { ILoginResponseR } from '../types';

export class LoyalityLoginRepository {
    public async login(email: string): Promise<ILoginResponseR | null> {
        try {
            return await prisma.customers.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while finding user');
        }
    }

    public async updatePassword(
        email: string,
        hashedPassword: string
    ): Promise<ILoyalityGuests> {
        try {
            return await prisma.customers.update({
                where: { email },
                data: { password: hashedPassword },
            }) as unknown as ILoyalityGuests;
        } catch (error) {
            throw new Error('Error occur while finding user');
        }
    }

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