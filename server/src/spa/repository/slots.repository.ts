import { prisma } from '../../config';
import {
    BatchPayload,
    ICSpaSlotR,
    ISpaSlot,
    ICSpaDatesR,
    ISpaDates,
    ISlotsAvailable,
    SlotStatus,
} from '../types';

export class SpaDatesRepo {
    public async createDate(data: ICSpaDatesR): Promise<ISpaDates> {
        try {
            return await prisma.spaDates.create({
                data: { ...data },
                include: {
                    slots: {
                        include: {
                            slotsAvailable: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while creating spa date');
        }
    }

    public async getDateById(id: string): Promise<ISpaDates | null> {
        try {
            return await prisma.spaDates.findUnique({
                where: {
                    id,
                    spaModule: {
                        Property: {
                            propertyConfigs: { isSpaModuleEnabled: true },
                        },
                    },
                },
                include: {
                    slots: {
                        include: {
                            slotsAvailable: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa date by id');
        }
    }

    public async getForDateRange(
        spaModuleId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISpaDates[]> {
        try {
            return await prisma.spaDates.findMany({
                where: {
                    spaModuleId,
                    date: { gte: startDate, lte: endDate },
                    spaModule: {
                        Property: {
                            propertyConfigs: { isSpaModuleEnabled: true },
                        },
                    },
                },
                include: {
                    slots: {
                        include: {
                            slotsAvailable: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa dates for date range');
        }
    }

    // public async getSpaForDate(
    //     spaModuleId: string,
    //     date: Date
    // ): Promise<ISpaDates | null> {
    //     try {
    //         return await prisma.spaDates.findFirst({
    //             where: {
    //                 spaModuleId,
    //                 date: { equals: date },
    //                 spaModule: {
    //                     Property: {
    //                         propertyConfigs: { isSpaModuleEnabled: true },
    //                     },
    //                 },
    //             },
    //             // include: {
    //             //     Slots: {
    //             //         include: {
    //             //             slotsAvailable: true,
    //             //         },
    //             //     },
    //             // },
    //         });
    //     } catch (error) {
    //         throw new Error('Error occur while fetching spa for date');
    //     }
    // }
    public async createManyDates(
        data: ICSpaDatesR[]
    ): Promise<{ count: number }> {
        try {
            return await prisma.spaDates.createMany({
                data,
                skipDuplicates: true,
            });
        } catch (error) {
            throw new Error('Error occurred while creating multiple spa dates');
        }
    }

    public async getSpaForDates(
        spaModuleId: string,
        dates: Date[]
    ): Promise<ISpaDates[]> {
        try {
            return await prisma.spaDates.findMany({
                where: {
                    spaModuleId,
                    date: { in: dates },
                    spaModule: {
                        Property: {
                            propertyConfigs: { isSpaModuleEnabled: true },
                        },
                    },
                },
                include: {
                    slots: { include: { slotsAvailable: true } },
                },
            });
        } catch (error) {
            throw new Error('Error occurred while checking existing spa dates');
        }
    }
    public async deleteDate(id: string): Promise<ICSpaDatesR> {
        try {
            return await prisma.spaDates.delete({
                where: {
                    id,
                    spaModule: {
                        Property: {
                            propertyConfigs: { isSpaModuleEnabled: true },
                        },
                    },
                },
                include: {
                    slots: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while deleting spa date');
        }
    }
}

export class SpaSlotsRepo {
    public async createSlot(data: ICSpaSlotR): Promise<ISpaSlot> {
        try {
            return await prisma.spaSlots.create({
                data,
                include: { slotsAvailable: true },
            });
        } catch (error) {
            throw new Error('Error occurred while creating spa slot');
        }
    }
    public async createManyAvailability(spaSlotId: string, count: number): Promise<void> {
        try {
            await prisma.slotsAvailable.createMany({
                data: Array.from({ length: count }, () => ({
                    spaSlotId,
                    status: 'active' as const,
                })),
            });
        } catch (error) {
            throw new Error('Error occurred while creating slot availability');
        }
    }
    public async getSlotById(id: string): Promise<ISpaSlot | null> {
        try {
            return await prisma.spaSlots.findUnique({
                where: {
                    id,
                    spaDate: {
                        spaModule: {
                            Property: {
                                propertyConfigs: { isSpaModuleEnabled: true },
                            },
                        },
                    },
                },
                include: {
                    slotsAvailable: true,
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa slot by id');
        }
    }
    public async deleteSlot(id: string): Promise<ISpaSlot> {
        try {
            return await prisma.spaSlots.delete({
                where: {
                    id,
                    spaDate: {
                        spaModule: {
                            Property: {
                                propertyConfigs: { isSpaModuleEnabled: true },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while deleting spa slot');
        }
    }
    public async updateSpaSlotStatus(id: string, isActive: boolean): Promise<ISpaSlot> {
        try {
            return await prisma.spaSlots.update({
                where: {
                    id,
                    spaDate: {
                        spaModule: {
                            Property: {
                                propertyConfigs: { isSpaModuleEnabled: true },
                            },
                        },
                    },
                },
                data: {
                    isActive,
                },
            });
        } catch (error) {
            throw new Error('Error occur while updating spa slot status');
        }
    }
    public async getspaSlotAvailibilitybySpaId(id: string): Promise<ISlotsAvailable[]> {
        try {
            return await prisma.slotsAvailable.findMany({
                where: { spaSlotId: id },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa slot availibility by id');
        }
    }
    public async getspaSlotAvailibilitybyId(id: string): Promise<ISlotsAvailable | null> {
        try {
            return await prisma.slotsAvailable.findUnique({
                where: {
                    id,
                    spaSlot: {
                        spaDate: {
                            spaModule: {
                                Property: {
                                    propertyConfigs: { isSpaModuleEnabled: true },
                                },
                            },
                        },
                    },
                },
                include: {
                    spaSlot: {
                        include: {
                            spaDate: {
                                include: {
                                    spaModule: {
                                        include: {
                                            Property: {
                                                include: {
                                                    propertyConfigs: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa slot availibility by id');
        }
    }
    public async markSlotAvailabilitiesAsBooked(
        slotsAvailableIds: string[],
        reservationId: string,
        userName: string,
    ): Promise<ISlotsAvailable[]> {
        try {
            await prisma.slotsAvailable.updateMany({
                where: {
                    id: { in: slotsAvailableIds },
                    status: 'active',
                },
                data: {
                    status: 'booked',
                    reservationId,
                    userName,
                },
            });

            return await prisma.slotsAvailable.findMany({
                where: { id: { in: slotsAvailableIds } },
            });
        } catch (error) {
            throw new Error('Error occurred while marking spa slots as booked');
        }
    }
    public async deleteSlotAvailibilityById(id: string): Promise<ISlotsAvailable> {
        try {
            return await prisma.slotsAvailable.delete({
                where: {
                    id,
                    spaSlot: {
                        spaDate: {
                            spaModule: {
                                Property: {
                                    propertyConfigs: { isSpaModuleEnabled: true },
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occurred while deleting spa slot availability by id');
        }
    }
    public async updateSpaSlotAvailibilityStatus(id: string, status: SlotStatus): Promise<ISlotsAvailable> {
        try {
            return await prisma.slotsAvailable.update({
                where: {
                    id,
                    spaSlot: {
                        spaDate: {
                            spaModule: {
                                Property: {
                                    propertyConfigs: { isSpaModuleEnabled: true },
                                },
                            },
                        },
                    },
                },
                data: {
                    status,
                },
            });
        } catch (error) {
            throw new Error('Error occurred while updating spa slot availability status');
        }
    }
    public async findOverlappingSlot(
        spaDateId: string,
        startTime: Date,
        endTime: Date
    ): Promise<ISpaSlot | null> {
        try {
            return await prisma.spaSlots.findFirst({
                where: {
                    spaDateId,
                    startTime: {
                        lt: endTime,
                    },
                    endTime: {
                        gt: startTime,
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occurred while checking overlapping slots');
        }
    }
}