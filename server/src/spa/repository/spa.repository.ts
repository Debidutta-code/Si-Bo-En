import { prisma } from '../../config';
import { ICSpaR, IReservationSpa, ISpaO, ISpaWSlots, IUSpaR } from '../types';

export class SpaRepository {
    public async createSpa(data: ICSpaR): Promise<ISpaO> {
        try {
            return await prisma.spa.create({
                data: {
                    ...data,
                    isActive: true,
                },
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
    public async getSpaForPropertyCode(propertyCode: string): Promise<ISpaWSlots[]> {
        try {
            return await prisma.spa.findMany({
                where: {
                    Property: {
                        propertyCode: propertyCode,
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
    public async createSpaBooking(
        data: {
            userEmail: string;
            userContactNumber: string;
            userId?: string;
            totalAmount: number;
            currencyCode?: string;
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
                                spaSlotId: s.spaSlotId,
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
                        data: { isBooked: true },
                    });
                }

                return booking;
            });
        } catch (error) {
            throw new Error('Error occur while creating spa booking');
        }
    }
    public async cancelSpaBooking(bookingId: string, customerId?: string) {
        try {
            return await prisma.$transaction(async (tx) => {
                const booking = await tx.spaBooking.findUnique({
                    where: { id: bookingId },
                    include: { SlotBookings: true }
                });

                if (!booking) {
                    throw new Error('Spa booking not found');
                }

                if (customerId && booking.userId !== customerId) {
                    throw new Error('Unauthorized to cancel this booking');
                }

                if (booking.status === 'cancelled') {
                    throw new Error('Booking is already cancelled');
                }

                // Update booking status
                const updatedBooking = await tx.spaBooking.update({
                    where: { id: bookingId },
                    data: { status: 'cancelled' }
                });

                // Free up all associated slots
                for (const slotBooking of booking.SlotBookings) {
                    await tx.spaSlots.update({
                        where: { id: slotBooking.spaSlotId },
                        data: { isBooked: false }
                    });
                }

                return updatedBooking;
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
                },
                include: {
                    SlotBookings: {
                        include: {
                            Spa: true,
                            SpaSlot: {
                                include: {
                                    spaDate: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });
        } catch (error) {
            throw new Error('Error occur while fetching customer spa bookings');
        }
    }
}
