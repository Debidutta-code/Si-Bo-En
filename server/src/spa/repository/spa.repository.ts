import { prisma } from '../../config';
import { ICSpaR, IReservationSpa, ISpaO, ISpaWSlots, IUSpaR } from '../types';

export class SpaRepository {
    public async createSpa(data: ICSpaR): Promise<ISpaO> {
        try {
            return await prisma.spa.create({
                data,
            });
        } catch (error) {
            throw new Error('Error occur while creating spa');
        }
    }
    public async getSpaByCode(
        code: string,
        propertyId: string
    ): Promise<ISpaO | null> {
        try {
            return await prisma.spa.findUnique({
                where: {
                    itemCode_propertyId: {
                        itemCode: code,
                        propertyId: propertyId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa');
        }
    }
    public async getByName(
        name: string,
        propertyId: string
    ): Promise<ISpaO | null> {
        try {
            return await prisma.spa.findUnique({
                where: {
                    name_propertyId: {
                        name: name,
                        propertyId: propertyId,
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa');
        }
    }
    public async getById(id: string): Promise<ISpaO | null> {
        try {
            return await prisma.spa.findUnique({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa');
        }
    }
    public async updateSpa(id: string, data: IUSpaR): Promise<ISpaO> {
        try {
            return await prisma.spa.update({
                where: {
                    id: id,
                },
                data: {
                    ...data,
                },
            });
        } catch (error) {
            throw new Error('Error occur while updating spa');
        }
    }
    public async deleteSpa(id: string): Promise<ISpaO> {
        try {
            return await prisma.spa.delete({
                where: {
                    id: id,
                },
            });
        } catch (error) {
            throw new Error('Error occur while deleting spa');
        }
    }
    public async getSpaForProperty(propertyId: string): Promise<ISpaWSlots[]> {
        try {
            return await prisma.spa.findMany({
                where: {
                    propertyId: propertyId,
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
                        include: {
                            Slots: {
                                include: {
                                    Reservation: {
                                        select: {
                                            bookingCode: true,
                                        },
                                    },
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
            throw new Error('Error occur while fetching spas for property');
        }
    }
    public async getAvailableSpaForinDateRange(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISpaWSlots[]> {
        try {
            return await prisma.spa.findMany({
                where: {
                    propertyId,
                    isActive: true,
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
                                lt: endDate,
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
            throw new Error(
                'Error occur while fetching available spas for property'
            );
        }
    }
    public async getReservationByCode(
        bookingCode: string
    ): Promise<IReservationSpa | null> {
        try {
            return await prisma.reservation.findUnique({
                where: {
                    bookingCode: bookingCode,
                },
                select: {
                    id: true,
                    propertyId: true,
                    bookingCode: true,
                    reservationStartDate: true,
                    reservationEndDate: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa');
        }
    }
}
