import { prisma } from '../../config';
import { CurrencyCode } from '../../tax-system/interfaces';
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
                    Property: {
                        propertyConfigs: {
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
    public async getSpaForPropertyCode(propertyCode: string): Promise<ISpaWSlots[]> {
        try {
            return await prisma.spa.findMany({
                where: {
                    isInclusive: false,
                    Property: {
                        propertyCode: propertyCode,
                        propertyConfigs:{
                            isSpaModuleEnabled: true
                        }
                    },
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
            throw new Error('Error occur while fetching spas for property code');
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
                    Property:{
                        propertyConfigs:{
                            isSpaModuleEnabled:true
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
                    property:{
                        propertyConfigs:{
                            isSpaModuleEnabled:true
                        }
                    }
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
    public async createSpaBooking(
        data: {
            userEmail: string;
            userContactNumber: string;
            userId?: string;
            totalAmount: number;
            currencyCode?: CurrencyCode;
            userName: string;
        },
        slots: { spaId: string; spaSlotId: string; amount: number }[]
    ) {
        try {
            return await prisma.$transaction(async (tx) => {
                const booking = await tx.spaBooking.create({
                    data: {
                        userEmail: data.userEmail,
                        userContactNumber: data.userContactNumber,
                        userId: data.userId,
                        totalAmount: data.totalAmount,
                        currencyCode: data.currencyCode,
                        SlotBookings: {
                            create: slots.map((s) => ({
                                spaId: s.spaId,
                                spaSlotsId: s.spaSlotId,
                                amount: s.amount,
                            })),
                        },
                    },
                });

                for (const s of slots) {
                    const slot = await tx.spaSlots.findUnique({ where: { id: s.spaSlotId } });
                    if (!slot) throw new Error(`Slot not found: ${s.spaSlotId}`);
                    if (slot.isBooked) throw new Error(`Slot already booked: ${s.spaSlotId}`);

                    await tx.spaSlots.update({
                        where: { id: s.spaSlotId },
                        data: { isBooked: true, userName: data.userName },
                    });
                }

                return booking;
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error(String(error) || 'Error occur while creating spa booking');
        }
    }
    public async cancelSpaBooking(
        bookingId: string,
        customerId?: string,
        spaSlotsId?: string
    ) {
        try {
            return await prisma.$transaction(async (tx) => {

                const booking = await tx.spaBooking.findUnique({
                    where: { id: bookingId },
                    include: {
                        SlotBookings: {
                            include: {
                                spa: {
                                    include: {
                                        AssignedSpas: {
                                            include: {
                                                User: true,
                                            },
                                        },
                                    },
                                },
                                spaSlots: {
                                    include: {
                                        spaDate: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!booking) {
                    throw new Error('Spa booking not found');
                }

                const slotBookingToCancel = booking.SlotBookings.find(
                    (sb) =>
                        sb.spaSlotsId === spaSlotsId ||
                        sb.id === spaSlotsId
                );
                if (!slotBookingToCancel) {
                    throw new Error('Slot booking not found');
                }

                await tx.spaSlots.update({
                    where: {
                        id: slotBookingToCancel.spaSlotsId,
                    },
                    data: {
                        isBooked: false,
                        userName: null,
                    },
                });

                await tx.slotBooking.delete({
                    where: {
                        id: slotBookingToCancel.id,
                    },
                });

                const remainingSlotBookings = booking.SlotBookings.filter(
                    (sb) => sb.id !== slotBookingToCancel.id
                );

                let updatedBooking;

                if (remainingSlotBookings.length === 0) {
                    updatedBooking = await tx.spaBooking.update({
                        where: { id: bookingId },
                        data: {
                            status: 'cancelled',
                            totalAmount: 0,
                        },
                    });
                } else {
                    const newTotalAmount =
                        booking.totalAmount - slotBookingToCancel.amount;

                    updatedBooking = await tx.spaBooking.update({
                        where: { id: bookingId },
                        data: {
                            totalAmount: newTotalAmount,
                        },
                    });
                }

                return {
                    booking: updatedBooking,
                    cancelledSlot: slotBookingToCancel,
                };
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }

            throw new Error('Error occur while cancelling spa booking');
        }
    }
    public async getSpaBookingsByCustomerId(customerId: string) {
        try {
            return await prisma.spaBooking.findMany({
                where: {
                    userId: customerId,
                    status: "confirmed",
                },
                include: {
                    SlotBookings: {
                        include: {
                            spa: true,
                            spaSlots: {
                                include: {
                                    spaDate: true,
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            throw new Error('Error occur while fetching customer spa bookings');
        }
    }
    public async getSlotById(slotId: string) {
        try {
            return await prisma.spaSlots.findUnique({
                where: { id: slotId },
                include: {
                    spaDate: true,
                    SlotBookings: {
                        select: { spaId: true },
                        take: 1,
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa slot');
        }
    }
    public async getSlotBookingBySpaSlotId(spaSlotsId: string) {
        try {
            return await prisma.slotBooking.findFirst({
                where: {
                    spaSlotsId: spaSlotsId,
                },
                include: {
                    spa: {
                        include: {
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
                    },
                    spaSlots: {
                        include: {
                            spaDate: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching slot booking');
        }
    }

    public async getSpaBookingById(bookingId: string) {
        try {
            return await prisma.spaBooking.findUnique({
                where: { id: bookingId},
            });
        } catch (error) {
            throw new Error('Error occur while fetching spa booking');
        }
    }

    public async getSpaWithProperty(spaId: string) {
        try {
            return await prisma.spa.findUnique({
                where: { id: spaId, Property: {
                    propertyConfigs: {
                        isSpaModuleEnabled: true
                    }
                } },
                include: {
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
            throw new Error('Error occur while fetching spa with property');
        }
    }

}
