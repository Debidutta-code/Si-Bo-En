import { prisma } from "../../../../config";
import { IPaginatedResponse } from "../../../../utils/return";
import {
    IReservation,
    IReservationWithAllDetails,
    IReservationPriceBrakeDownR,
    IAriManulupulation,
    ICReservationR,
    IGuestCheckInDetails
} from "../types";
import { BookingStatus, IBookingAddon, IBookingAddonCreate, IGuestDetail, IPropertyEmails, IReservationPromotion, IReservationPromotionCreate } from "../types/reservation.type";

export class ReservationRepository {
    public async createReservation(data: ICReservationR): Promise<IReservation> {   
        try {
            return await prisma.reservation.create({
                data
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create reservation: ${error.message}`);
            }
            throw new Error("Failed to create reservation");
        }
    }
    public async createReservationGuests(reservationId: string, guestDetails: IGuestDetail[]) {
        try {
            return await prisma.reservationGuest.createMany({
                data: guestDetails.map((guest) => ({
                    reservationId,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    type: guest.type,
                    age: guest.age ?? null,
                    dateOfBirth: guest.dateOfBirth ? new Date(guest.dateOfBirth) : null,
                })),
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create reservation guests: ${error.message}`);
            }
            throw new Error("Failed to create reservation guests");
        }
    }
    public async updateReservation(
        reservationId: string,
        updateData: Partial<ICReservationR>
    ): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: updateData,
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update reservation: ${error.message}`);
            }
            throw new Error("Failed to update reservation");
        }
    }

    public async updateReservationWithTransaction(
        reservationId: string,
        updateData: Partial<ICReservationR>,
        priceBreakdownData?: Partial<IReservationPriceBrakeDownR>,
        guestDetails?: IGuestDetail[],
        addonDetails?: IBookingAddonCreate[],
        promotionDetails?: IReservationPromotionCreate[]
    ): Promise<IReservation> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Update reservation
                const updatedReservation = await tx.reservation.update({
                    where: { id: reservationId },
                    data: updateData,
                    include: { primaryGuest: true, priceBreakdowns: true }
                });

                // 2. Update price breakdown
                if (priceBreakdownData) {
                    await tx.reservationPriceBrakeDown.updateMany({
                        where: { reservationId },
                        data: priceBreakdownData
                    });
                }

                // 3. Sync reservation guests
                if (guestDetails && guestDetails.length > 0) {
                    await tx.reservationGuest.deleteMany({ where: { reservationId } });
                    await tx.reservationGuest.createMany({
                        data: guestDetails.map((guest) => ({
                            reservationId,
                            firstName: guest.firstName,
                            lastName: guest.lastName,
                            type: guest.type,
                            age: (guest as any).age ?? null,
                            dateOfBirth: guest.dateOfBirth ? new Date(guest.dateOfBirth) : null,
                        }))
                    });
                }

                // 4. Sync booking addons
                await tx.bookingAddon.deleteMany({ where: { reservationId } });
                if (addonDetails && addonDetails.length > 0) {
                    await tx.bookingAddon.createMany({ data: addonDetails });
                }

                // 5. Sync reservation promotions
                await tx.reservationPromotion.deleteMany({ where: { bookingId: reservationId } });
                if (promotionDetails && promotionDetails.length > 0) {
                    await tx.reservationPromotion.createMany({ data: promotionDetails });
                }

                return updatedReservation;
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update reservation in transaction: ${error.message}`);
            }
            throw new Error("Failed to update reservation in transaction");
        }
    }

    public async checkRoomAvailability(
        propertyCode: string,
        roomTypeCode: string,
        dates: Date[],
        requiredRooms: number
    ): Promise<boolean> {
        try {
            const inventories = await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    date: { in: dates }
                }
            });

            // Check if all dates have enough availability
            for (const inventory of inventories) {
                if (inventory.availability < requiredRooms) {
                    return false;
                }
            }

            return inventories.length === dates.length; // All dates must exist
        } catch (error) {
            console.error("Error checking room availability:", error);
            return false;
        }
    }
    public async getReservationsForDateRange(
        propertyIds: string[],
        startDate: Date,
        endDate: Date,
        page: number,
        limit: number,
        bookingStatus?: string,
        bookingSource?: string,        
        deviceType?: string,           
        bookingCode?: string,          
        guestName?: string,            
        promoCode?: string,            
        countryCode?: string,          
        dateFilterType?: 'checkin' | 'booking' | 'modification'  
    ): Promise<IPaginatedResponse<IReservationWithAllDetails>> {
        try {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const whereClause: any = {
                propertyId: { in: propertyIds }
            };

            // Date filtering based on dateFilterType
            if (dateFilterType === 'booking') {
                whereClause.bookedAt = {
                    gte: start,
                    lte: end
                };
            } else if (dateFilterType === 'modification') {
                whereClause.updatedAt = {
                    gte: start,
                    lte: end
                };
            } else {
                // Default: checkin date
                whereClause.OR = [
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
                ];
            }

            // Add bookingStatus filter
            if (bookingStatus) {
                whereClause.bookingStatus = bookingStatus;
            }

            // Add bookingSource filter
            if (bookingSource) {
                whereClause.bookingSource = bookingSource;
            }

            // Add deviceType filter
            if (deviceType) {
                whereClause.deviceTypes = deviceType;
            }

            // Add bookingCode filter
            if (bookingCode) {
                whereClause.bookingCode = {
                    contains: bookingCode,
                    mode: 'insensitive'
                };
            }

            // Add guestName filter (search in primaryGuest or guests JSON)
            if (guestName) {
                whereClause.AND = whereClause.AND || [];
                whereClause.AND.push({
                    primaryGuest: {
                        OR: [
                            { firstName: { contains: guestName, mode: 'insensitive' } },
                            { lastName: { contains: guestName, mode: 'insensitive' } }
                        ]
                    }
                });
            }

            // Add promoCode filter (if you have a promo field)
            if (promoCode && promoCode !== '') {
                whereClause.isPromoUsed = true;
                // Add promo code matching logic if you store it
            }

            // Add countryCode filter
            if (countryCode) {
                whereClause.countryCode = countryCode;
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
                    },
                    reservationPromotions: true,
                    reservationGuests: true,
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

    public async getReservaltionByCode(reservationCode: string, propertyCode: string): Promise<IReservationWithAllDetails | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { bookingCode: reservationCode, propertyCode: propertyCode },
                include: {
                    primaryGuest: true,
                    priceBreakdowns: true,
                    addOns: true,
                    reservationGuests: true,
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
                    addOns: true,
                    reservationGuests: true,
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation by Id");
        }
    }
    public async getPropertyEmails(propertyId: string): Promise<IPropertyEmails[]> {
        try {
            const property = await prisma.propertyEmails.findMany({
                where: { id: propertyId },
                select: { email: true }
            });
            return property;
        } catch (error) {
            throw new Error(`Failed to fetch property emails`);
        }
    }
    public async NoShow(reservationId: string): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: "no_show" },
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
    public async getReservationByBookingCode(bookingCode: string): Promise<IReservation | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { bookingCode },
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation by booking code");
        }
    }

    public async makeCheckIn(reservationId: string,time: Date): Promise<IReservation > {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: "checked_in", checkInDate: time },
            });
        } catch (error) {
            throw new Error("Failed to check in reservation");
        }
    }
    public async makeCheckOut(reservationId: string,time: Date): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: "checked_out", checkOutDate: time },
            });
        } catch (error) {
            throw new Error("Failed to check out reservation");
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
                    ////console.log(`Decreased availability for ${room.roomTypeCode} in ${ariManupulationRooms.propertyCode}: ${result.count} records updated`);
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
                    //console.log(`Increased availability for ${room.roomTypeCode}: ${result.count} records updated`);
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

    public async getRatePlanName(ratePlanCode: string, propertyId: string) {
        try {
            return await prisma.ratePlan.findUnique({
                where: { ratePlanCode, propertyId },
                select: { ratePlanName: true }
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch rate plan: ${error.message}`);
            }
            throw new Error("Failed to fetch rate plan by code");
        }
    }
}


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
    public async addGuestDetails(guestId:string, details: IGuestCheckInDetails) {
        try {
            return await prisma.guests.update({
                where: { id: guestId },
                data: {
                    ...details
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add guest details: ${error.message}`);
            }
            throw new Error("Failed to add guest details");
        }
    }
}
// ==================== BOOKING ADDON REPOSITORY ====================
export class BookingAddonRepository {
    public async createBookingAddons(addons: IBookingAddonCreate[]): Promise<any> {
        try {
            return await prisma.bookingAddon.createMany({
                data: addons
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create booking addons: ${error.message}`);
            }
            throw new Error("Failed to create booking addons");
        }
    }

    public async getBookingAddonsByReservationId(reservationId: string): Promise<IBookingAddon[]> {
        try {
            return await prisma.bookingAddon.findMany({
                where: { reservationId }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch booking addons: ${error.message}`);
            }
            throw new Error("Failed to fetch booking addons");
        }
    }
}

// ==================== RESERVATION PROMOTION REPOSITORY ====================
export class ReservationPromotionRepository {
    public async createReservationPromotions(promotions: IReservationPromotionCreate[]): Promise<any> {
        try {
            return await prisma.reservationPromotion.createMany({
                data: promotions
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create reservation promotions: ${error.message}`);
            }
            throw new Error("Failed to create reservation promotions");
        }
    }

    public async getPromotionsByReservationId(reservationId: string): Promise<IReservationPromotion[]> {
        try {
            return await prisma.reservationPromotion.findMany({
                where: { bookingId: reservationId },
                include: {
                    Promotion: true,
                    RatePlanRule: true
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch reservation promotions: ${error.message}`);
            }
            throw new Error("Failed to fetch reservation promotions");
        }
    }
}