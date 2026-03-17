import { prisma } from "../../../config";
import { IReservationFilters, IReservationResponse,  } from "../types";

export class ReservationRepository {
    public async getReservationsByAgencyId(
        agencyId: string,
        filters: IReservationFilters
    ): Promise<{ data: IReservationResponse[]; total: number; page: number; limit: number }> {
        try {
            const {
                bookingStatus,
                bookingSource,
                propertyId,
                propertyCode,
                roomTypeCode,
                ratePlanCode,
                checkInDateFrom,
                checkInDateTo,
                checkOutDateFrom,
                checkOutDateTo,
                bookingCode,
                guestEmail,
                guestPhone,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = filters;

            const whereClause = {
                agencyId,
                ...(bookingStatus && { bookingStatus }),
                ...(bookingSource && { bookingSource }),
                ...(propertyId && { propertyId }),
                ...(propertyCode && { propertyCode }),
                ...(roomTypeCode && { roomTypeCode }),
                ...(ratePlanCode && { ratePlanCode }),
                ...(bookingCode && { bookingCode: { contains: bookingCode, mode: 'insensitive' } }),
                ...(guestEmail && { bookingUserEmail: { contains: guestEmail, mode: 'insensitive' } }),
                ...(guestPhone && { bookingUserPhone: { contains: guestPhone, mode: 'insensitive' } }),
                ...(checkInDateFrom || checkInDateTo
                    ? {
                        checkInDate: {
                            ...(checkInDateFrom && { gte: checkInDateFrom }),
                            ...(checkInDateTo && { lte: checkInDateTo })
                        }
                    }
                    : {}),
                ...(checkOutDateFrom || checkOutDateTo
                    ? {
                        checkOutDate: {
                            ...(checkOutDateFrom && { gte: checkOutDateFrom }),
                            ...(checkOutDateTo && { lte: checkOutDateTo })
                        }
                    }
                    : {})
            };

            const [total, reservations] = await Promise.all([
                prisma.reservation.count({ where: whereClause }),
                prisma.reservation.findMany({
                    where: whereClause,
                    include: {
                        primaryGuest: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phoneNumber: true
                            }
                        },
                        property: {
                            select: {
                                id: true,
                                propertyName: true,
                                propertyCode: true,
                                propertyEmail: true,
                                propertyContact: true
                            }
                        }
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder }
                })
            ]);

            return {
                data: reservations as IReservationResponse[],
                total,
                page,
                limit
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservations: ${error.message}`);
            }
            throw new Error("Failed to fetch reservations");
        }
    }

    public async getReservationById(reservationId: string, agencyId: string): Promise<IReservationResponse | null> {
        try {
            const reservation = await prisma.reservation.findFirst({
                where: {
                    id: reservationId,
                    agencyId
                },
                include: {
                    primaryGuest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            propertyName: true,
                            propertyCode: true,
                            propertyEmail: true,
                            propertyContact: true,
                            propertyAddress: true
                        }
                    },
                    priceBreakdowns: true,
                    addOns: true,
                    promo: true
                }
            });

            return reservation as IReservationResponse | null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation");
        }
    }

    public async getReservationByBookingCode(bookingCode: string, agencyId: string): Promise<IReservationResponse | null> {
        try {
            const reservation = await prisma.reservation.findFirst({
                where: {
                    bookingCode,
                    agencyId
                },
                include: {
                    primaryGuest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            propertyName: true,
                            propertyCode: true,
                            propertyEmail: true,
                            propertyContact: true
                        }
                    },
                    priceBreakdowns: true,
                    addOns: true
                }
            });

            return reservation as IReservationResponse | null;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation by booking code: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation by booking code");
        }
    }

    public async cancelReservation(reservationId: string, agencyId: string, cancellationReason: string): Promise<IReservationResponse> {
        try {
            const reservation = await prisma.reservation.updateMany({
                where: {
                    id: reservationId,
                    agencyId,
                    bookingStatus: {
                        not: "cancelled"
                    }
                },
                data: {
                    bookingStatus: "cancelled",
                    cancellationReason,
                    cancelledAt: new Date()
                }
            });

            if (reservation.count === 0) {
                throw new Error("Reservation not found or already cancelled");
            }

            const updatedReservation = await this.getReservationById(reservationId, agencyId);
            if (!updatedReservation) {
                throw new Error("Failed to fetch updated reservation");
            }

            return updatedReservation;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to cancel reservation: ${error.message}`);
            }
            throw new Error("Failed to cancel reservation");
        }
    }

    public async getReservationStats(agencyId: string): Promise<{
        totalReservations: number;
        confirmedReservations: number;
        cancelledReservations: number;
        pendingReservations: number;
        totalRevenue: number;
    }> {
        try {
            const [
                totalReservations,
                confirmedReservations,
                cancelledReservations,
                pendingReservations,
                revenueData
            ] = await Promise.all([
                prisma.reservation.count({ where: { agencyId } }),
                prisma.reservation.count({ where: { agencyId, bookingStatus: "confirmed" } }),
                prisma.reservation.count({ where: { agencyId, bookingStatus: "cancelled" } }),
                prisma.reservation.count({ where: { agencyId, bookingStatus: "pending" } }),
                prisma.reservation.aggregate({
                    where: {
                        agencyId,
                        bookingStatus: {
                            in: ["confirmed", "pending"]
                        }
                    },
                    _sum: {
                        amount: true
                    }
                })
            ]);

            return {
                totalReservations,
                confirmedReservations,
                cancelledReservations,
                pendingReservations,
                totalRevenue: revenueData._sum.amount || 0
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation stats: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation stats");
        }
    }

    public async getUpcomingArrivals(agencyId: string, days: number = 7): Promise<IReservationResponse[]> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);
            futureDate.setHours(23, 59, 59, 999);

            const arrivals = await prisma.reservation.findMany({
                where: {
                    agencyId,
                    checkInDate: {
                        gte: today,
                        lte: futureDate
                    },
                    bookingStatus: "confirmed"
                },
                include: {
                    primaryGuest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            propertyName: true,
                            propertyCode: true,
                            propertyEmail: true,
                            propertyContact: true
                        }
                    }
                },
                orderBy: {
                    checkInDate: 'asc'
                }
            });

            return arrivals as IReservationResponse[];
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch upcoming arrivals: ${error.message}`);
            }
            throw new Error("Failed to fetch upcoming arrivals");
        }
    }

    public async getUpcomingDepartures(agencyId: string, days: number = 7): Promise<IReservationResponse[]> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + days);
            futureDate.setHours(23, 59, 59, 999);

            const departures = await prisma.reservation.findMany({
                where: {
                    agencyId,
                    checkOutDate: {
                        gte: today,
                        lte: futureDate
                    },
                    bookingStatus: "confirmed"
                },
                include: {
                    primaryGuest: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            phoneNumber: true
                        }
                    },
                    property: {
                        select: {
                            id: true,
                            propertyName: true,
                            propertyCode: true,
                            propertyEmail: true,
                            propertyContact: true
                        }
                    }
                },
                orderBy: {
                    checkOutDate: 'asc'
                }
            });

            return departures as IReservationResponse[];
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch upcoming departures: ${error.message}`);
            }
            throw new Error("Failed to fetch upcoming departures");
        }
    }
}
