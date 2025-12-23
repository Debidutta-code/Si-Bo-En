import { prisma } from "../../../../config";
import { BookingStatus, Reservation } from "../../../../generated/prisma";
import {
    ICReservation,
    IReservation,
    IReservationWithAllDetails,
    IReservationPriceBrakeDownR,
    IAriManulupulation
} from "../types";

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

    public async getReservationForADate(propertyId: string, date: Date): Promise<IReservationWithAllDetails[]> {
        try {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start);

            return await prisma.reservation.findMany({
                where: {
                    propertyId,
                    checkInDate: {
                        gte: start,
                        lt: end
                    }
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getReservationForADate failed: ${error.message}`);
            }
            throw new Error("Failed to fetch reservations");
        }
    }

    public async getArrivals(propertyId: string, arrivalDate: Date): Promise<IReservationWithAllDetails[]> {
        try {
            const start = new Date(arrivalDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start);

            return await prisma.reservation.findMany({
                where: {
                    propertyId,
                    checkInDate: {
                        gte: start,
                        lt: end
                    },
                    bookingStatus: "confirmed"
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getArrivals failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Arrivals");
        }
    }

    public async getDepartures(propertyId: string, departureDate: Date): Promise<IReservationWithAllDetails[]> {
        try {
            const start = new Date(departureDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start);

            return await prisma.reservation.findMany({
                where: {
                    propertyId,
                    checkOutDate: {
                        gte: start,
                        lt: end
                    },
                    bookingStatus: "confirmed"
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getDepartures failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Departures");
        }
    }

    public async getCheckIns(propertyId: string, checkInDate: Date): Promise<IReservationWithAllDetails[]> {
        try {
            const start = new Date(checkInDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start);

            return await prisma.reservation.findMany({
                where: {
                    propertyId,
                    checkInDate: {
                        gte: start,
                        lt: end
                    },
                    bookingStatus: "confirmed"
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getCheckIns failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Check-ins");
        }
    }

    public async getCheckouts(propertyId: string, checkOutDate: Date): Promise<IReservationWithAllDetails[]> {
        try {
            const start = new Date(checkOutDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start);

            return await prisma.reservation.findMany({
                where: {
                    propertyId,
                    checkOutDate: {
                        gte: start,
                        lt: end
                    },
                    bookingStatus: "confirmed"
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getCheckouts failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Check-outs");
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