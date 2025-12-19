import { prisma } from "../../../../config";

import {
    BookingSource, ICReservation,
    IReservation,
    IReservationWithAllDetails,
    ReservationStatus,
    ICPartialReservationRoom,
    IPartialReservationRoom,
    IReservationPriceBrakeDownR,
    IAriManulupulation
} from "../types";

export class ReservationRepository {
    public async createReservation(reservationData: ICReservation, guestIds?: string[]): Promise<IReservation | Error> {
        try {
            const result = await prisma.reservation.create({
                data: {
                    ...reservationData,
                    ...(guestIds && guestIds.length > 0 && {
                        Guests: {
                            connect: guestIds.map(id => ({ id }))
                        }
                    })
                },
                include: {
                    Guests: true,
                }
            })
            return result ;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to create Reservations")
        }
    }
    public async getReservationForADate(propertyCode: string, date: Date): Promise<IReservationWithAllDetails[] | Error> {
        try {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start)

            return await prisma.reservation.findMany({
                where: {
                    propertyCode,
                    from: {
                        gte: start,
                        lt: end // exclusive upper bound
                    }
                },
                orderBy: { createdAt: 'desc' },

                include: {
                    Guests: true,
                   
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
    public async getArrivals(propertyCode: string, arrivalDate: Date): Promise<IReservationWithAllDetails[] | Error> {

        try {
            const start = new Date(arrivalDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start)
            return await prisma.reservation.findMany({
                where: {
                    propertyCode,
                    from: {
                        gte: start,
                        lt: end //debug here
                    },
                    reservationStatus: "reserved"
                }, orderBy: { createdAt: 'desc' },
                include: {
                    Guests: true,
                    
                    addOns: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getReservationForADate failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Arrivals");
        }
    }
    public async getDepartures(propertyCode: string, departureDate: Date): Promise<IReservationWithAllDetails[] | Error> {

        try {
            const start = new Date(departureDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start)
            return await prisma.reservation.findMany({
                where: {
                    propertyCode,
                    to: {
                        gte: start,
                        lt: end //debug here
                    },
                    reservationStatus: "checked_in"
                }, 
                orderBy: { createdAt: 'desc' },
                include: {
                    Guests: true,
                    addOns: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getReservationForADate failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Arrivals");
        }
    }
    public async getCheckIns(propertyCode: string, checkInDate: Date): Promise<IReservationWithAllDetails[] | Error> {

        try {
            const start = new Date(checkInDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start)
            return await prisma.reservation.findMany({
                where: {
                    propertyCode,
                    from: {
                        gte: start,
                        lt: end //debug here
                    },
                    reservationStatus: "checked_in"
                }, 
                                orderBy: { createdAt: 'desc' },

                include: {
                    Guests: true,
                    
                    addOns: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getReservationForADate failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Arrivals");
        }
    }
    public async getCheckouts(propertyCode: string, checOutDate: Date): Promise<IReservationWithAllDetails[] | Error> {

        try {
            const start = new Date(checOutDate);
            start.setHours(0, 0, 0, 0);
            const end = this.getNextDate(start)
            return await prisma.reservation.findMany({
                where: {
                    propertyCode,
                    to: {
                        gte: start,
                        lt: end //debug here
                    },
                    reservationStatus: "checked_out"
                },         
                       orderBy: { createdAt: 'desc' },

 include: {
                    Guests: true,
                    
                    addOns: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`getReservationForADate failed: ${error.message}`);
            }
            throw new Error("Failed to fetch Arrivals");
        }
    }
    private getNextDate(currentDate: Date): Date {
        const start = new Date(currentDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        return end
    }
    public async amendReservation(reservationId: string, newCheckoutDate: Date): Promise<IReservation | Error> {
        try {
            return await prisma.reservation.update({
                where: {
                    id: reservationId
                }, data: {
                    to: newCheckoutDate
                }, include: {
                    Guests: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to extend ReservationDate")
        }
    }
    public async deleteReservation(reservationId: string): Promise<IReservation | Error> {
        try {
            return await prisma.reservation.update({
                where: {
                    id: reservationId
                }, data: {
                    reservationStatus: "cancelled"
                }, include: {
                    Guests: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to delete ReservationDate")
        }
    }
    public async getReservaltionByCode(reservationCode: string): Promise<IReservationWithAllDetails | null | Error> {
        try {
            return await prisma.reservation.findUnique({
                where: {
                    bookingCode: reservationCode
                },
                include: {
                    Guests: true,
                    addOns: true,
                },
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to fetch reservation by code")
        }
    }

    public async updateReservationStatus(reservationId: string, status: ReservationStatus): Promise<IReservation | Error> {
        try {
            return await prisma.reservation.update({
                where: {
                    id: reservationId
                },
                data: {
                    reservationStatus: status
                },
                include: {
                    Guests: true,
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to update reservation status")
        }
    }
    public async getReservationById(resvationId: string): Promise<IReservationWithAllDetails | null | Error> {
        try {
            return await prisma.reservation.findUnique({
                where: {
                    id: resvationId
                },

                include: {
                    Guests: true,
                    
                    addOns: true
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message)
            }
            throw new Error("Failed to fetch reservation by Id")
        }
    }
}


// export class PartialReservationRoomsRepository {
//     public async createPartialReservationRooms(partialReservationRoomsData: ICPartialReservationRoom[]): Promise<IPartialReservationRoom[] | any | Error> {
//         try {
//             return await prisma.partialReservationRoom.createMany({
//                 data: partialReservationRoomsData
//             })
//         } catch (error) {
//             throw new Error("Failed to create Partial Reservation Rooms")
//         }
//     }
// }

export class PriceBrakeDownRepo {
    public async createpriceBrakeDowns(priceBrakeDowns: IReservationPriceBrakeDownR[]) {
        // console.log("Creating Price Brake Downs:", priceBrakeDowns);
        try {
            return await prisma.reservationPriceBrakeDown.createMany({
                data: priceBrakeDowns
            })
        } catch (error) {
            // console.log(error)
            throw new Error("Failed to create Price Brake Downs")
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
                        }, data: {
                            availability: {
                                decrement: room.numberOfRooms
                            }
                        }
                    })
                    console.log(`Decreased availability for ${room.roomTypeCode} in ${ariManupulationRooms.propertyCode} where dates: ${ariManupulationRooms.dates}: ${result.count} records updated`);
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                console.error("Failed to decrease Available Rooms:", error.message);
                throw new Error(`Failed to decrease Available Rooms: ${error.message}`);
            }
            throw new Error("Failed to decrease Available Rooms")
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
                        }, data: {
                            availability: {
                                increment: room.numberOfRooms
                            }
                        }
                    })
                    console.log(`Increased availability for ${room.roomTypeCode}: ${result.count} records updated`);
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                console.error("Failed to increase Available Rooms:", error.message);
                throw new Error(`Failed to increase Available Rooms: ${error.message}`);
            }
            throw new Error("Failed to increase Available Rooms")
        }
    }
}
