import { prisma } from '../../config';
import { ISpa, ISpaWUser } from '../types';

export class SpaUserRepository {
    public async getSpaUsersForProperty(propertyId: string) {
        try {
            return await prisma.creation.findFirst({
                where: { propertyId,property:{
                    propertyConfigs:{
                        isSpaModuleEnabled: true
                    }
                } },
                include: {
                    level0Users: {
                        where: {
                            role: 'spa_manager',
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to get spa managers for property `);
        }
    }
    public async assignSpaToUser(
        spaId: string,
        userId: string
    ): Promise<ISpaWUser> {
        try {
            return await prisma.userAssignedSpa.create({
                
                data: {
                    spaId,
                    userId,
                },
                include: {
                    User: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to add spa user for property`);
        }
    }
    public async isAlreadySpaAssignedtoUser(
        spaId: string,
        userId: string
    ): Promise<ISpaWUser | null> {
        try {
            return await prisma.userAssignedSpa.findUnique({
                where: {
                    userId_spaId: {
                        userId,
                        spaId,
                    },
                    Spa:{
                        Property:{
                            propertyConfigs:{
                                isSpaModuleEnabled: true
                            }
                        }
                    }
                },
                include: {
                    User: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to check spa assignment for user`);
        }
    }
    public async removeUserFromSpa(
        spaId: string,
        userId: string
    ): Promise<ISpaWUser> {
        try {
            return await prisma.userAssignedSpa.delete({
                where: {
                    userId_spaId: {
                        userId,
                        spaId,
                    },
                    Spa:{
                        Property:{
                            propertyConfigs:{
                                isSpaModuleEnabled: true
                            }
                        }
                    }
                },
                include: {
                    User: true,
                },
            });
        } catch (error) {
            throw new Error(`Failed to remove spa user for property`);
        }
    }
    public async getSpaForUser(
        userId: string,
        propertyId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISpa[]> {
        try {
            return await prisma.spa.findMany({
                where: {
                    propertyId: propertyId,
                    AssignedSpas: {
                        some: {
                            userId: userId,
                        },
                    },
                    Property:{
                        propertyConfigs:{
                            isSpaModuleEnabled: true
                        }
                    }
                },
                include: {
                    Category: true,
                    SubCategory: true,
                    User: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    SpaDates: {
                        where: {
                            date: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                        include: {
                            Slots: {
                                include: {
                                    Reservation: {
                                        select: {
                                            bookingCode: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    startTime: 'asc',
                                },
                            },
                        },
                    },
                    AssignedSpas: {
                        include: {
                            User: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error(`Failed to get spa for user`);
        }
    }
}
