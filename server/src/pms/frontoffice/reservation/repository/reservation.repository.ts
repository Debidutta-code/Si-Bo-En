import { prisma } from "../../../../config";
import { IPaginatedResponse } from "../../../../utils/return";
import {
    ICReservation,
    IReservation,
    IReservationWithAllDetails,
    IReservationPriceBrakeDownR,
    IAriManulupulation
} from "../types";
import { BookingStatus } from "../types/reservation.type";

export class ReservationRepository {
    public async createReservation(data: ICReservation) {
        try {
            return await prisma.reservation.create({
                data,
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create reservation: ${error.message}`);
            }
            throw new Error("Failed to create reservation");
        }
    }

    // public async getReservationForADate(propertyId: string, date: Date): Promise<IReservationWithAllDetails[]> {
    //     try {
    //         const start = new Date(date);
    //         start.setHours(0, 0, 0, 0);
    //         const end = this.getNextDate(start);

    //         return await prisma.reservation.findMany({
    //             where: {
    //                 propertyId,
    //                 checkInDate: {
    //                     gte: start,
    //                     lt: end
    //                 }
    //             },
    //             orderBy: { createdAt: 'desc' },
    //             include: {
    //                 primaryGuest: true,
    //                 priceBreakdowns: true,
    //                 addOns: true,
    //             }
    //         });
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             throw new Error(`getReservationForADate failed: ${error.message}`);
    //         }
    //         throw new Error("Failed to fetch reservations");
    //     }
    // }
public async getReservationsForDateRange(
    propertyIds: string[],
    startDate: Date, 
    endDate: Date,
    page: number,
    limit: number,
    bookingStatus?: string // <-- Add this parameter
): Promise<IPaginatedResponse<IReservationWithAllDetails>> {
    try {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const whereClause: any = { // <-- Change type to any for flexibility
            propertyId: { in: propertyIds },
            OR: [
                {
                    checkInDate: {
                        gte: start,
                        lte: end
                    }
                },
                {
                    checkOutDate: {
                        gte: start,
                        lte: end
                    }
                },
                {
                    AND: [
                        { checkInDate: { lte: start } },
                        { checkOutDate: { gte: end } }
                    ]
                }
            ]
        };

        // Add bookingStatus filter if provided
        if (bookingStatus) {
            whereClause.bookingStatus = bookingStatus; // <-- Add this condition
        }

        const totalResults = await prisma.reservation.count({
            where: whereClause
        });

        const totalPages = Math.ceil(totalResults / limit);
        const skip = (page - 1) * limit;

        const reservations = await prisma.reservation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { checkInDate: 'asc' },
            include: {
                primaryGuest: true,
                priceBreakdowns: true,
                addOns: true,
                property: {
                    select: {
                        propertyName: true,
                        propertyCode: true
                    }
                }
            }
        });

        return {
            data: reservations,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                resultsPerPage: limit
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`getReservationsForDateRange failed: ${error.message}`);
        }
        throw new Error("Failed to fetch reservations");
    }
}
    // public async getArrivals(propertyId: string, arrivalDate: Date): Promise<IReservationWithAllDetails[]> {
    //     try {
    //         const start = new Date(arrivalDate);
    //         start.setHours(0, 0, 0, 0);
    //         const end = this.getNextDate(start);

    //         return await prisma.reservation.findMany({
    //             where: {
    //                 propertyId,
    //                 checkInDate: {
    //                     gte: start,
    //                     lt: end
    //                 },
    //                 bookingStatus: "confirmed"
    //             },
    //             orderBy: { createdAt: 'desc' },
    //             include: {
    //                 primaryGuest: true,
    //                 priceBreakdowns: true,
    //                 addOns: true,
    //             }
    //         });
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             throw new Error(`getArrivals failed: ${error.message}`);
    //         }
    //         throw new Error("Failed to fetch Arrivals");
    //     }
    // }

    // public async getDepartures(propertyId: string, departureDate: Date): Promise<IReservationWithAllDetails[]> {
    //     try {
    //         const start = new Date(departureDate);
    //         start.setHours(0, 0, 0, 0);
    //         const end = this.getNextDate(start);

    //         return await prisma.reservation.findMany({
    //             where: {
    //                 propertyId,
    //                 checkOutDate: {
    //                     gte: start,
    //                     lt: end
    //                 },
    //                 bookingStatus: "confirmed"
    //             },
    //             orderBy: { createdAt: 'desc' },
    //             include: {
    //                 primaryGuest: true,
    //                 priceBreakdowns: true,
    //                 addOns: true,
    //             }
    //         });
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             throw new Error(`getDepartures failed: ${error.message}`);
    //         }
    //         throw new Error("Failed to fetch Departures");
    //     }
    // }

    // public async getCheckIns(propertyId: string, checkInDate: Date): Promise<IReservationWithAllDetails[]> {
    //     try {
    //         const start = new Date(checkInDate);
    //         start.setHours(0, 0, 0, 0);
    //         const end = this.getNextDate(start);

    //         return await prisma.reservation.findMany({
    //             where: {
    //                 propertyId,
    //                 checkInDate: {
    //                     gte: start,
    //                     lt: end
    //                 },
    //                 bookingStatus: "confirmed"
    //             },
    //             orderBy: { createdAt: 'desc' },
    //             include: {
    //                 primaryGuest: true,
    //                 priceBreakdowns: true,
    //                 addOns: true,
    //             }
    //         });
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             throw new Error(`getCheckIns failed: ${error.message}`);
    //         }
    //         throw new Error("Failed to fetch Check-ins");
    //     }
    // }

    // public async getCheckouts(propertyId: string, checkOutDate: Date): Promise<IReservationWithAllDetails[]> {
    //     try {
    //         const start = new Date(checkOutDate);
    //         start.setHours(0, 0, 0, 0);
    //         const end = this.getNextDate(start);

    //         return await prisma.reservation.findMany({
    //             where: {
    //                 propertyId,
    //                 checkOutDate: {
    //                     gte: start,
    //                     lt: end
    //                 },
    //                 bookingStatus: "confirmed"
    //             },
    //             orderBy: { createdAt: 'desc' },
    //             include: {
    //                 primaryGuest: true,
    //                 priceBreakdowns: true,
    //                 addOns: true,
    //             }
    //         });
    //     } catch (error) {
    //         if (error instanceof Error) {
    //             throw new Error(`getCheckouts failed: ${error.message}`);
    //         }
    //         throw new Error("Failed to fetch Check-outs");
    //     }
    // }

public async getArrivals(
    propertyIds: string[],
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    bookingStatus?: string
): Promise<IPaginatedResponse<IReservationWithAllDetails>> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // 🔑 If date range starts in the past → start from today
        const effectiveStart = start < today ? today : start;

        const whereClause: any = {
            propertyId: { in: propertyIds },
            checkInDate: {
                gte: effectiveStart,
                lte: end
            }
        };

        // 🔥 Booking status logic
        if (bookingStatus) {
            whereClause.bookingStatus = bookingStatus;
        } else {
            whereClause.bookingStatus = { not: "cancelled" };
        }

        const totalResults = await prisma.reservation.count({ where: whereClause });

        const totalPages = Math.ceil(totalResults / limit);
        const skip = (page - 1) * limit;

        const arrivals = await prisma.reservation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { checkInDate: "asc" },
            include: {
                primaryGuest: true,
                priceBreakdowns: true,
                addOns: true,
                property: {
                    select: {
                        propertyName: true,
                        propertyCode: true
                    }
                }
            }
        });

        return {
            data: arrivals,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                resultsPerPage: limit
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`getArrivals failed: ${error.message}`);
        }
        throw new Error("Failed to fetch arrivals");
    }
}


public async getDepartures(
    propertyIds: string[],
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    bookingStatus?: string
): Promise<IPaginatedResponse<IReservationWithAllDetails>> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const effectiveStart = start < today ? today : start;

        const whereClause: any = {
            propertyId: { in: propertyIds },
            checkOutDate: {
                gte: effectiveStart,
                lte: end
            }
        };

        // 🔥 Booking status logic
        if (bookingStatus) {
            whereClause.bookingStatus = bookingStatus;
        } else {
            whereClause.bookingStatus = { not: "cancelled" };
        }

        const totalResults = await prisma.reservation.count({ where: whereClause });

        const totalPages = Math.ceil(totalResults / limit);
        const skip = (page - 1) * limit;

        const departures = await prisma.reservation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { checkOutDate: "asc" },
            include: {
                primaryGuest: true,
                priceBreakdowns: true,
                addOns: true,
                property: {
                    select: {
                        propertyName: true,
                        propertyCode: true
                    }
                }
            }
        });

        return {
            data: departures,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                resultsPerPage: limit
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`getDepartures failed: ${error.message}`);
        }
        throw new Error("Failed to fetch departures");
    }
}


public async getCheckIns(
    propertyIds: string[],
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
): Promise<IPaginatedResponse<IReservationWithAllDetails>> {
    try {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const whereClause = {
            propertyId: { in: propertyIds },
            checkInDate: {
                gte: start,
                lte: end
            },
            bookingStatus: "confirmed" as const
        };

        const totalResults = await prisma.reservation.count({
            where: whereClause
        });

        const totalPages = Math.ceil(totalResults / limit);
        const skip = (page - 1) * limit;

        const checkIns = await prisma.reservation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { checkInDate: 'asc' },
            include: {
                primaryGuest: true,
                priceBreakdowns: true,
                addOns: true,
                property: {
                    select: {
                        propertyName: true,
                        propertyCode: true
                    }
                }
            }
        });

        return {
            data: checkIns,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                resultsPerPage: limit
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`getCheckIns failed: ${error.message}`);
        }
        throw new Error("Failed to fetch check-ins");
    }
}

public async getCheckouts(
    propertyIds: string[],
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
): Promise<IPaginatedResponse<IReservationWithAllDetails>> {
    try {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const whereClause = {
            propertyId: { in: propertyIds },
            checkOutDate: {
                gte: start,
                lte: end
            },
            bookingStatus: "confirmed" as const
        };

        const totalResults = await prisma.reservation.count({
            where: whereClause
        });

        const totalPages = Math.ceil(totalResults / limit);
        const skip = (page - 1) * limit;

        const checkOuts = await prisma.reservation.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { checkOutDate: 'asc' },
            include: {
                primaryGuest: true,
                priceBreakdowns: true,
                addOns: true,
                property: {
                    select: {
                        propertyName: true,
                        propertyCode: true
                    }
                }
            }
        });

        return {
            data: checkOuts,
            pagination: {
                currentPage: page,
                totalPages,
                totalResults,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
                resultsPerPage: limit
            }
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`getCheckouts failed: ${error.message}`);
        }
        throw new Error("Failed to fetch check-outs");
    }
}
    private getNextDate(currentDate: Date): Date {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return end;
    }

    public async amendReservation(reservationId: string, newCheckoutDate: Date): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { checkOutDate: newCheckoutDate },
                include: { 
                    primaryGuest: true,
                    priceBreakdowns: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to amend reservation: ${error.message}`);
            }
            throw new Error("Failed to extend ReservationDate");
        }
    }

    public async deleteReservation(reservationId: string): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: "cancelled" },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to cancel reservation: ${error.message}`);
            }
            throw new Error("Failed to delete ReservationDate");
        }
    }

    public async getReservaltionByCode(reservationCode: string): Promise<IReservationWithAllDetails | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { bookingCode: reservationCode },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation by code");
        }
    }

    public async updateReservationStatus(reservationId: string, status: BookingStatus): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: status },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update status: ${error.message}`);
            }
            throw new Error("Failed to update reservation status");
        }
    }

    public async getReservationById(reservationId: string): Promise<IReservationWithAllDetails | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation by Id");
        }
    }
}

export class PriceBrakeDownRepo {
    public async createpriceBrakeDowns(priceBrakeDowns: IReservationPriceBrakeDownR[]) {
        try {
            return await prisma.reservationPriceBrakeDown.createMany({
                data: priceBrakeDowns
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create price breakdowns: ${error.message}`);
            }
            throw new Error("Failed to create Price Brake Downs");
        }
    }
}

export class AriManupulationRepo {
    public async decreaseAvailableRooms(ariManupulationRooms: IAriManulupulation) {
        try {
            return await prisma.$transaction(async (tx) => {
                for (const room of ariManupulationRooms.roomInfos) {
                    const result = await tx.inventory.updateMany({
                        where: {
                            propertyCode: ariManupulationRooms.propertyCode,
                            roomTypeCode: room.roomTypeCode,
                            date: {
                                in: ariManupulationRooms.dates
                            }
                        },
                        data: {
                            availability: {
                                decrement: room.numberOfRooms
                            }
                        }
                    });
                    console.log(`Decreased availability for ${room.roomTypeCode} in ${ariManupulationRooms.propertyCode}: ${result.count} records updated`);
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error("Failed to decrease Available Rooms:", error.message);
                throw new Error(`Failed to decrease Available Rooms: ${error.message}`);
            }
            throw new Error("Failed to decrease Available Rooms");
        }
    }

    public async increaseAvailableRooms(ariManupulationRooms: IAriManulupulation) {
        try {
            return await prisma.$transaction(async (tx) => {
                for (const room of ariManupulationRooms.roomInfos) {
                    const result = await tx.inventory.updateMany({
                        where: {
                            propertyCode: ariManupulationRooms.propertyCode,
                            roomTypeCode: room.roomTypeCode,
                            date: {
                                in: ariManupulationRooms.dates
                            }
                        },
                        data: {
                            availability: {
                                increment: room.numberOfRooms
                            }
                        }
                    });
                    console.log(`Increased availability for ${room.roomTypeCode}: ${result.count} records updated`);
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error("Failed to increase Available Rooms:", error.message);
                throw new Error(`Failed to increase Available Rooms: ${error.message}`);
            }
            throw new Error("Failed to increase Available Rooms");
        }
    }
}

// Guest Repository
export class GuestRepository {
    public async getGuestByEmail(email: string) {
        try {
            return await prisma.guests.findFirst({
                where: { email }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch guest: ${error.message}`);
            }
            throw new Error("Failed to fetch guest by email");
        }
    }

    public async createGuest(data: any) {
        try {
            return await prisma.guests.create({
                data
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create guest: ${error.message}`);
            }
            throw new Error("Failed to create guest");
        }
    }
}