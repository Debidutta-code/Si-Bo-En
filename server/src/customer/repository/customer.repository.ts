import { prisma } from '../../config';
import { ICustomer, ICustomerwp } from '../types';

export class CustomerRepository {
    public async findByEmail(email: string): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
        } catch (error) {
            throw new Error('Error occurred while finding customer');
        }
    }
    public async loginUser(email: string): Promise<ICustomerwp | null> {
        try {
            return await prisma.customers.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    password: true,
                },
            });
        } catch (error) {
            throw new Error('Error occurred while finding customer');
        }
    }

    public async findById(id: string) {
        try {
            return await prisma.customers.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    PropertyLoyalityGuests: true,
                    CreationGuest: {
                        include: {
                            CreationLoyaltyConfig: {
                                include: {
                                    LoyalityLevels: true,
                                    BasicLoyaltyProgram: true,
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
                    WishList: true,
                },
            });
        } catch (error) {
            throw new Error('Error occurred while finding customer');
        }
    }

    public async create(data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }):Promise<ICustomer> {
        try {
            return await prisma.customers.create({
                data,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
        } catch (error) {
            throw new Error('Error occurred while creating customer');
        }
    }

    public async updatePassword(email: string, hashedPassword: string) {
        try {
            return await prisma.customers.update({
                where: { email },
                data: { password: hashedPassword },
            });
        } catch (error) {
            throw new Error('Error occurred while updating password');
        }
    }
}