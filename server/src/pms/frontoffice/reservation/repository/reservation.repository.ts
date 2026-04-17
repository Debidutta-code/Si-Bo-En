

import { prisma } from '../../../../config';
import { CurrencyCode } from '../../../../tax-system/interfaces';
import { IPaginatedResponse } from '../../../../utils/return';
import {
    IReservation,
    IReservationWithAllDetails,
    IAriManulupulation,
    ICReservationR,
    IGuestCheckInDetails,
    ICPricingBreakDown,
    ICDailyPriceBrakeDown,
    ICTaxBrakeDown,
    ICAddonBreakdown,
    ICPromotionBrakeDown,
    IPricingBreakDown,
} from '../types';
import {
    BookingStatus,
    IBookingAddon,
    IBookingAddonCreate,
    IGuestDetail,
    IPropertyEmails,
    IReservationPromotion,
    IReservationPromotionCreate,
} from '../types/reservation.type';

export class ReservationRepository {
    public async createReservation(data: ICReservationR): Promise<IReservation> {
        try {
            return await prisma.reservation.create({ data });
        } catch (error) {
            throw this.wrap(error, 'Failed to create reservation');
        }
    }

    public async createReservationGuests(
        reservationId: string,
        guestDetails: IGuestDetail[]
    ) {
        try {
            return await prisma.reservationGuest.createMany({
                data: guestDetails.map((guest) => ({
                    reservationId,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    type: guest.type,
                    age: guest.age ?? null,
                    dateOfBirth: guest.dateOfBirth
                        ? new Date(guest.dateOfBirth)
                        : null,
                })),
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to create reservation guests');
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
                include: { primaryGuest: true, 
                    // priceBreakdowns: true 
                },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to update reservation');
        }
    }

    public async updateReservationWithTransaction(
        reservationId: string,
        updateData: Partial<ICReservationR>,
        guestDetails?: IGuestDetail[],
        addonDetails?: IBookingAddonCreate[],
        promotionDetails?: IReservationPromotionCreate[]
    ): Promise<IReservation> {
        try {
            return await prisma.$transaction(async (tx) => {
                const updatedReservation = await tx.reservation.update({
                    where: { id: reservationId },
                    data: updateData,
                    include: { primaryGuest: true, 
                    },
                });

                if (guestDetails && guestDetails.length > 0) {
                    await tx.reservationGuest.deleteMany({ where: { reservationId } });
                    await tx.reservationGuest.createMany({
                        data: guestDetails.map((guest) => ({
                            reservationId,
                            firstName: guest.firstName,
                            lastName: guest.lastName,
                            type: guest.type,
                            age: (guest as any).age ?? null,
                            dateOfBirth: guest.dateOfBirth
                                ? new Date(guest.dateOfBirth)
                                : null,
                        })),
                    });
                }

                await tx.bookingAddon.deleteMany({ where: { reservationId } });
                if (addonDetails && addonDetails.length > 0) {
                    await tx.bookingAddon.createMany({ data: addonDetails });
                }

                // Note: ReservationPromotion model is deprecated.
                // Promotions are now managed via PromotionBrakeDown
                // (handled by replacePricingBreakdown in the service layer).


                return updatedReservation;
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to update reservation in transaction');
        }
    }

    // ── NEW: link an existing payment record to a reservation ──
    public async linkPaymentToReservation(
        paymentIntentId: string,
        reservationId: string
    ): Promise<number> {
        try {
            const result = await prisma.payment.updateMany({
                where: { paymentIntentId },
                data: { reservationId },
            });
            return result.count;
        } catch (error) {
            throw this.wrap(error, 'Failed to link payment to reservation');
        }
    }

    // ── NEW: record a promo-code usage against a reservation ──
    public async createReservationPromoCode(data: {
        reservationId: string;
        promoCodeId: string;
        amount: number;
        currency: CurrencyCode;
    }) {
        try {
            return await prisma.reservationPromoCode.create({ data });
        } catch (error) {
            throw this.wrap(error, 'Failed to create reservation promo code');
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
                where: { propertyCode, roomTypeCode, date: { in: dates } },
            });

            for (const inventory of inventories) {
                if (inventory.availability < requiredRooms) return false;
            }
            return inventories.length === dates.length;
        } catch (error) {
            console.error('Error checking room availability:', error);
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

            const whereClause: any = { propertyId: { in: propertyIds } };

            if (dateFilterType === 'booking') {
                whereClause.bookedAt = { gte: start, lte: end };
            } else if (dateFilterType === 'modification') {
                whereClause.updatedAt = { gte: start, lte: end };
            } else {
                whereClause.OR = [
                    { reservationStartDate: { gte: start, lte: end } },
                    { reservationEndDate: { gte: start, lte: end } },
                    {
                        AND: [
                            { reservationStartDate: { lte: start } },
                            { reservationEndDate: { gte: end } },
                        ],
                    },
                ];
            }

            if (bookingStatus) whereClause.bookingStatus = bookingStatus;
            if (bookingSource) whereClause.bookingSource = bookingSource;
            if (deviceType) whereClause.deviceTypes = deviceType;
            if (bookingCode)
                whereClause.bookingCode = {
                    contains: bookingCode,
                    mode: 'insensitive',
                };
            if (guestName) {
                whereClause.AND = whereClause.AND || [];
                whereClause.AND.push({
                    primaryGuest: {
                        OR: [
                            {
                                firstName: {
                                    contains: guestName,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                lastName: {
                                    contains: guestName,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                });
            }
            if (promoCode && promoCode !== '') {
                whereClause.isPromoUsed = true;
            }
            if (countryCode) whereClause.countryCode = countryCode;

            const totalResults = await prisma.reservation.count({
                where: whereClause,
            });
            const totalPages = Math.ceil(totalResults / limit);
            const skip = (page - 1) * limit;

            const reservations = await prisma.reservation.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { reservationStartDate: 'asc' },
                include: {
                    primaryGuest: true,
                    addOns: true,
                    PricingBrakeDown: {
                        include:{
                            AddonBrakeDowns:true,
                            DailyPriceBrakeDown:true,
                            taxBrakeDown:true,
                            promotionBrakeDown:true,
                        }
                    },
                    property: {
                        select: { propertyName: true, propertyCode: true },
                    },
                    reservationGuests: true,
                },
            });

            return {
                data: reservations,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage: limit,
                },
            };
        } catch (error) {
            throw this.wrap(error, 'getReservationsForDateRange failed');
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
            const effectiveStart = start < today ? today : start;

            const whereClause: any = {
                propertyId: { in: propertyIds },
                checkInDate: { gte: effectiveStart, lte: end },
            };
            whereClause.bookingStatus = bookingStatus
                ? bookingStatus
                : { not: 'cancelled' };

            const totalResults = await prisma.reservation.count({
                where: whereClause,
            });
            const totalPages = Math.ceil(totalResults / limit);
            const skip = (page - 1) * limit;

            const arrivals = await prisma.reservation.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { reservationStartDate: 'asc' },
                include: {
                    primaryGuest: true,
                    // priceBreakdowns: true,
                    addOns: true,
                    property: {
                        select: { propertyName: true, propertyCode: true },
                    },
                },
            });

            return {
                data: arrivals,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage: limit,
                },
            };
        } catch (error) {
            throw this.wrap(error, 'getArrivals failed');
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
                checkOutDate: { gte: effectiveStart, lte: end },
            };
            whereClause.bookingStatus = bookingStatus
                ? bookingStatus
                : { not: 'cancelled' };

            const totalResults = await prisma.reservation.count({
                where: whereClause,
            });
            const totalPages = Math.ceil(totalResults / limit);
            const skip = (page - 1) * limit;

            const departures = await prisma.reservation.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { reservationEndDate: 'asc' },
                include: {
                    primaryGuest: true,
                    // priceBreakdowns: true,
                    addOns: true,
                    property: {
                        select: { propertyName: true, propertyCode: true },
                    },
                },
            });

            return {
                data: departures,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage: limit,
                },
            };
        } catch (error) {
            throw this.wrap(error, 'getDepartures failed');
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
                checkInDate: { gte: start, lte: end },
                bookingStatus: 'confirmed' as const,
            };

            const totalResults = await prisma.reservation.count({
                where: whereClause,
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
                    PricingBrakeDown: {
                        include: {
                            AddonBrakeDowns: true,
                            DailyPriceBrakeDown: true,
                            taxBrakeDown: true,
                            promotionBrakeDown: true,
                        }
                    },
                    addOns: true,
                    reservationGuests:true,
                    property: {
                        select: { propertyName: true, propertyCode: true },
                    },
                },
            });

            return {
                data: checkIns,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage: limit,
                },
            };
        } catch (error) {
            throw this.wrap(error, 'getCheckIns failed');
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
                checkOutDate: { gte: start, lte: end },
                bookingStatus: 'confirmed' as const,
            };

            const totalResults = await prisma.reservation.count({
                where: whereClause,
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
                    // priceBreakdowns: true,
                    addOns: true,
                    property: {
                        select: { propertyName: true, propertyCode: true },
                    },
                },
            });

            return {
                data: checkOuts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                    resultsPerPage: limit,
                },
            };
        } catch (error) {
            throw this.wrap(error, 'getCheckouts failed');
        }
    }

    public async deleteReservation(
        reservationId: string,
        refundAmount?: number
    ): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: {
                    bookingStatus: 'cancelled',
                    cancelledAt: new Date(),
                    ...(refundAmount !== undefined && { refundAmount }),
                },
                include: { primaryGuest: true },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to cancel reservation');
        }
    }

    public async getReservaltionByCode(
        reservationCode: string,
        propertyCode: string
    ): Promise<IReservationWithAllDetails | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { bookingCode: reservationCode, propertyCode },
                include: {
                    primaryGuest: true,
                    addOns: true,
                    reservationGuests: true,
                    PricingBrakeDown: {
                        include: {
                            AddonBrakeDowns: true,
                            DailyPriceBrakeDown: true,
                            taxBrakeDown: true,
                            promotionBrakeDown: true,
                        }
                    },
                },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to fetch reservation by code');
        }
    }

    public async updateReservationStatus(
        reservationId: string,
        status: BookingStatus
    ): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: status },
                include: { primaryGuest: true, 
                    // priceBreakdowns: true 
                },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to update reservation status');
        }
    }

    public async getReservationById(
        reservationId: string
    ): Promise<IReservationWithAllDetails | null> {
        try {
            return await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: {
                    primaryGuest: true,
                    addOns: true,
                    PricingBrakeDown:{
                        include:{
                            AddonBrakeDowns:true,
                            DailyPriceBrakeDown:true,
                            taxBrakeDown:true,
                            promotionBrakeDown:true,
                        }
                    },
                    reservationGuests: true,
                },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to fetch reservation by Id');
        }
    }

    public async getPropertyEmails(
        propertyId: string
    ): Promise<IPropertyEmails[]> {
        try {
            return await prisma.propertyEmails.findMany({
                where: { id: propertyId },
                select: { email: true },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to fetch property emails');
        }
    }

    public async NoShow(reservationId: string): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: 'no_show' },
                include: { primaryGuest: true, 
                    // priceBreakdowns: true 
                },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to no-show reservation');
        }
    }

    public async getReservationByBookingCode(
        bookingCode: string
    ): Promise<IReservation | null> {
        try {
            return await prisma.reservation.findUnique({ where: { bookingCode } });
        } catch (error) {
            throw this.wrap(error, 'Failed to fetch reservation by booking code');
        }
    }

    public async makeCheckIn(
        reservationId: string,
        time: Date
    ): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: 'checked_in', checkInDate: time },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to check in reservation');
        }
    }

    public async makeCheckOut(
        reservationId: string,
        time: Date
    ): Promise<IReservation> {
        try {
            return await prisma.reservation.update({
                where: { id: reservationId },
                data: { bookingStatus: 'checked_out', checkOutDate: time },
            });
        } catch (error) {
            throw this.wrap(error, 'Failed to check out reservation');
        }
    }

    private wrap(error: unknown, msg: string): Error {
        return error instanceof Error
            ? new Error(`${msg}: ${error.message}`)
            : new Error(msg);
    }
}

// ─────────────────────────────────────────────────────────────
// PRICE BREAKDOWN REPOSITORY
// ─────────────────────────────────────────────────────────────
export class PriceBrakeDownRepo {
    public async createpriceBrakeDowns(
        priceBrakeDowns: ICPricingBreakDown
    ) {
        try {
            return await prisma.pricingBreakdown.create({
                data: priceBrakeDowns,
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to create price breakdowns: ${error.message}`)
                : new Error('Failed to create Price Brake Downs');
        }
    }

    /**
     * Creates PricingBreakdown header + all child records
     * (DailyPriceBrakeDown, TaxBrakeDown, AddOnBrakeDown, PromotionBrakeDown)
     * in a single transaction AND links it back to the reservation.
     */
    public async createFullPricingBreakdown(
        reservationId: string,
        header: ICPricingBreakDown,
        dailyBreakdowns: ICDailyPriceBrakeDown[],
        taxBreakdowns: ICTaxBrakeDown[],
        addonBreakdowns: ICAddonBreakdown[],
        promotionBreakdowns: ICPromotionBrakeDown[]
    ): Promise<string> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Create PricingBreakdown header
                const pricingBreakdown = await tx.pricingBreakdown.create({
                    data: header,
                });

                const pricingId = pricingBreakdown.id;

                // 2. Create DailyPriceBrakeDown records
                if (dailyBreakdowns.length > 0) {
                    await tx.dailyPriceBrakeDown.createMany({
                        data: dailyBreakdowns.map((d: any) => ({
                            pricingBrakeDownId: pricingId,
                            roomNumber: String(d.roomNumber),
                            guestDistribution: d.guestDistribution,
                            date: new Date(d.date),
                            baseChargesAmount: d.baseChargesAmount || 0,
                            additionalChargesAmount: d.additionalChargesAmount || 0,
                            totalAmount: d.totalAmount || 0,
                            currencyCode: d.currencyCode,
                        })),
                    });
                }

                // 3. Create TaxBrakeDown records
                if (taxBreakdowns.length > 0) {
                    await tx.taxBrakeDown.createMany({
                        data: taxBreakdowns.map((t: any) => ({
                            pricingBrakeDownId: pricingId,
                            name: t.name,
                            taxedAmount: t.taxedAmount || 0,
                            currencyCode: t.currencyCode,
                        })),
                    });
                }

                // 4. Create AddOnBrakeDown records (linked to PricingBreakdown)
                if (addonBreakdowns.length > 0) {
                    await tx.addOnBrakeDown.createMany({
                        data: addonBreakdowns
                            .filter((a: any) => a.addonId)
                            .map((a: any) => ({
                                pricingBrakeDownId: pricingId,
                                addonId: a.addonId,
                                name: a.name,
                                amount: a.amount || 0,
                                quantity: a.quantity || 1,
                                totalAmount: a.totalAmount || 0,
                                currencyCode: a.currencyCode,
                                date: new Date(a.date),
                                type: a.type || 'selected',
                            })),
                    });
                }

                // 5. Create PromotionBrakeDown records
                if (promotionBreakdowns.length > 0) {
                    await tx.promotionBrakeDown.createMany({
                        data: promotionBreakdowns
                            .filter((p: any) => p.id)
                            .map((p: any) => ({
                                pricingBrakedownId: pricingId,
                                promotionType: p.promotionType || 'normal',
                                name: p.name,
                                discountType: p.discountType || 'percentage',
                                discountValue: p.discountValue || 0,
                                currencyCode: p.currencyCode || pricingBreakdown.currencyCode ||null,
                                discountAmount: p.discountAmount || 0,
                                restrictionType: p.restrictionType || 'decrease',
                                type: p.type || 'auto_applied',
                            })),
                    });
                }

                // 6. Link PricingBreakdown to Reservation
                await tx.reservation.update({
                    where: { id: reservationId },
                    data: { pricingBrakedownId: pricingId },
                });

                return pricingId;
            });
        } catch (error) {
            console.error('createFullPricingBreakdown error:', error);
            throw error instanceof Error
                ? new Error(`Failed to create full pricing breakdown: ${error.message}`)
                : new Error('Failed to create full pricing breakdown');
        }
    }

    /**
     * Deletes old PricingBreakdown (cascade removes children)
     * and creates a brand-new full breakdown for an update.
     */
    public async replacePricingBreakdown(
        reservationId: string,
        oldPricingBrakedownId: string | null,
        header: ICPricingBreakDown,
        dailyBreakdowns: ICDailyPriceBrakeDown[],
        taxBreakdowns: ICTaxBrakeDown[],
        addonBreakdowns: ICAddonBreakdown[],
        promotionBreakdowns: ICPromotionBrakeDown[]
    ): Promise<string> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 1. Unlink old breakdown from reservation
                if (oldPricingBrakedownId) {
                    await tx.reservation.update({
                        where: { id: reservationId },
                        data: { pricingBrakedownId: null },
                    });
                    // 2. Delete old PricingBreakdown (cascade removes children)
                    await tx.pricingBreakdown.delete({
                        where: { id: oldPricingBrakedownId },
                    });
                }

                // 3. Create new PricingBreakdown header
                const pricingBreakdown = await tx.pricingBreakdown.create({
                    data: header,
                });
                const pricingId = pricingBreakdown.id;

                // 4. Create child records
                if (dailyBreakdowns.length > 0) {
                    await tx.dailyPriceBrakeDown.createMany({
                        data: dailyBreakdowns.map((d: any) => ({
                            pricingBrakeDownId: pricingId,
                            roomNumber: String(d.roomNumber),
                            guestDistribution: d.guestDistribution,
                            date: new Date(d.date),
                            baseChargesAmount: d.baseChargesAmount || 0,
                            additionalChargesAmount: d.additionalChargesAmount || 0,
                            totalAmount: d.totalAmount || 0,
                            currencyCode: d.currencyCode,
                        })),
                    });
                }

                if (taxBreakdowns.length > 0) {
                    await tx.taxBrakeDown.createMany({
                        data: taxBreakdowns.map((t: any) => ({
                            pricingBrakeDownId: pricingId,
                            name: t.name,
                            taxedAmount: t.taxedAmount || 0,
                            currencyCode: t.currencyCode,
                        })),
                    });
                }

                if (addonBreakdowns.length > 0) {
                    await tx.addOnBrakeDown.createMany({
                        data: addonBreakdowns
                            .filter((a: any) => a.addonId)
                            .map((a: any) => ({
                                pricingBrakeDownId: pricingId,
                                addonId: a.addonId,
                                name: a.name,
                                amount: a.amount || 0,
                                quantity: a.quantity || 1,
                                totalAmount: a.totalAmount || 0,
                                currencyCode: a.currencyCode,
                                date: new Date(a.date),
                                type: a.type || 'selected',
                            })),
                    });
                }

                if (promotionBreakdowns.length > 0) {
                    await tx.promotionBrakeDown.createMany({
                        data: promotionBreakdowns
                            .filter((p: any) => p.id)
                            .map((p: any) => ({
                                pricingBrakedownId: pricingId,
                                promotionType: p.promotionType || 'normal',
                                name: p.name,
                                discountType: p.discountType || 'percentage',
                                discountValue: p.discountValue || 0,
                                currencyCode: p.currencyCode || null,
                                discountAmount: p.discountAmount || 0,
                                restrictionType: p.restrictionType || 'decrease',
                                type: p.type || 'auto_applied',
                            })),
                    });
                }

                // 5. Link new PricingBreakdown to Reservation
                await tx.reservation.update({
                    where: { id: reservationId },
                    data: { pricingBrakedownId: pricingId },
                });

                return pricingId;
            });
        } catch (error) {
            console.error('replacePricingBreakdown error:', error);
            throw error instanceof Error
                ? new Error(`Failed to replace pricing breakdown: ${error.message}`)
                : new Error('Failed to replace pricing breakdown');
        }
    }
}


// ─────────────────────────────────────────────────────────────
// ARI MANIPULATION REPOSITORY  (extended)
// ─────────────────────────────────────────────────────────────

export interface IPropertyConfig {
    selfAriActive: boolean;
    pmsIntegrationActive: boolean;
    channelManagerIntegrationActive: boolean;
}

export interface IActiveIntegration {
    type: 'channel_manager' | 'pms';
    name: string;                // e.g. "Rate Tiger"
    integrationId: string;       // propertyIntegration.id
}

export class AriManupulationRepo {
    // ── existing ──────────────────────────────────────────────

    public async decreaseAvailableRooms(
        ariManupulationRooms: IAriManulupulation
    ) {
        try {
            return await prisma.$transaction(async (tx) => {
                for (const room of ariManupulationRooms.roomInfos) {
                    await tx.inventory.updateMany({
                        where: {
                            propertyCode: ariManupulationRooms.propertyCode,
                            roomTypeCode: room.roomTypeCode,
                            date: { in: ariManupulationRooms.dates },
                        },
                        data: { availability: { decrement: room.numberOfRooms } },
                    });
                }
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to decrease Available Rooms: ${error.message}`)
                : new Error('Failed to decrease Available Rooms');
        }
    }

    public async increaseAvailableRooms(
        ariManupulationRooms: IAriManulupulation
    ) {
        try {
            return await prisma.$transaction(async (tx) => {
                for (const room of ariManupulationRooms.roomInfos) {
                    await tx.inventory.updateMany({
                        where: {
                            propertyCode: ariManupulationRooms.propertyCode,
                            roomTypeCode: room.roomTypeCode,
                            date: { in: ariManupulationRooms.dates },
                        },
                        data: { availability: { increment: room.numberOfRooms } },
                    });
                }
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to increase Available Rooms: ${error.message}`)
                : new Error('Failed to increase Available Rooms');
        }
    }

    public async getRatePlanName(ratePlanCode: string, propertyId: string) {
        try {
            return await prisma.ratePlan.findUnique({
                where: { ratePlanCode, propertyId },
                select: { ratePlanName: true },
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch rate plan: ${error.message}`)
                : new Error('Failed to fetch rate plan by code');
        }
    }

    public async getPropertyConfig(
        propertyId: string
    ): Promise<IPropertyConfig> {
        try {
            const config = await prisma.propertyConfigs.findUnique({
                where: { propertyId },
                select: {
                    selfAriActive: true,
                    pmsIntegrationActive: true,
                    channelManagerIntegrationActive: true,
                },
            });

            return {
                selfAriActive: config?.selfAriActive ?? true,
                pmsIntegrationActive: config?.pmsIntegrationActive ?? false,
                channelManagerIntegrationActive:
                    config?.channelManagerIntegrationActive ?? false,
            };
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch property config: ${error.message}`)
                : new Error('Failed to fetch property config');
        }
    }

    public async getActiveIntegration(
        propertyId: string,
        config: IPropertyConfig
    ): Promise<IActiveIntegration | null> {
        try {
            const isCmActive = config.channelManagerIntegrationActive;
            const isPmsActive = config.pmsIntegrationActive;

            if (!isCmActive && !isPmsActive) return null;

            const integrationType: 'channel_manager' | 'pms' = isCmActive
                ? 'channel_manager'
                : 'pms';

            const propertyIntegration =
                await prisma.propertyIntegrations.findFirst({
                    where: {
                        propertyId,
                        isActive: true,
                        MasterIntegration: {
                            type: integrationType,
                            isActive: true,
                        },
                    },
                    include: {
                        MasterIntegration: { select: { name: true } },
                    },
                });

            if (!propertyIntegration) return null;

            return {
                type: integrationType,
                name: propertyIntegration.MasterIntegration?.name ?? '',
                integrationId: propertyIntegration.id,
            };
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch active integration: ${error.message}`)
                : new Error('Failed to fetch active integration');
        }
    }
}

// ─────────────────────────────────────────────────────────────
// GUEST REPOSITORY
// ─────────────────────────────────────────────────────────────
export class GuestRepository {
    public async getGuestByEmail(email: string) {
        try {
            return await prisma.guests.findFirst({ where: { email } });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch guest: ${error.message}`)
                : new Error('Failed to fetch guest by email');
        }
    }

    public async createGuest(data: any) {
        try {
            return await prisma.guests.create({ data });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to create guest: ${error.message}`)
                : new Error('Failed to create guest');
        }
    }

    public async addGuestDetails(
        guestId: string,
        details: IGuestCheckInDetails
    ) {
        try {
            return await prisma.guests.update({
                where: { id: guestId },
                data: { ...details },
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to add guest details: ${error.message}`)
                : new Error('Failed to add guest details');
        }
    }
}

// ─────────────────────────────────────────────────────────────
// BOOKING ADDON REPOSITORY
// ─────────────────────────────────────────────────────────────
export class BookingAddonRepository {
    public async createBookingAddons(addons: IBookingAddonCreate[]): Promise<any> {
        try {
            return await prisma.bookingAddon.createMany({ data: addons });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to create booking addons: ${error.message}`)
                : new Error('Failed to create booking addons');
        }
    }

    public async getBookingAddonsByReservationId(
        reservationId: string
    ): Promise<IBookingAddon[]> {
        try {
            return await prisma.bookingAddon.findMany({ where: { reservationId } });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch booking addons: ${error.message}`)
                : new Error('Failed to fetch booking addons');
        }
    }
}

export interface ILoyaltyLevel {
    id: string;
    level: number;
    discountPercentage: number;
    noOfReservations: number;
    creationLoyaltyConfigId: string;
}

export interface ICreationGuest {
    id: string;
    loyalityGuestId: string;
    creationLoyaltyConfigId: string;
    noOfBookings: number;
    guestLevel: number;
    metaData: any;
}

export class LoyaltyRepository {
    /**
     * Find the CreationGuest record that ties a LoyalityGuest to a
     * specific loyalty programme (creationLoyaltyConfigId).
     */
    public async getCreationGuest(
        loyalityGuestId: string,
        creationLoyaltyConfigId: string
    ): Promise<ICreationGuest | null> {
        try {
            return await prisma.creationGuest.findUnique({
                where: {
                    creationLoyaltyConfigId_loyalityGuestId: {
                        creationLoyaltyConfigId,
                        loyalityGuestId,
                    },
                },
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch creation guest: ${error.message}`)
                : new Error('Failed to fetch creation guest');
        }
    }

    /**
     * Fetch all loyalty levels for a programme, ordered ascending by level
     * number so we can walk them in order.
     */
    public async getLoyaltyLevels(
        creationLoyaltyConfigId: string
    ): Promise<ILoyaltyLevel[]> {
        try {
            return await prisma.loyalityLevel.findMany({
                where: { creationLoyaltyConfigId },
                orderBy: { level: 'asc' },
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(`Failed to fetch loyalty levels: ${error.message}`)
                : new Error('Failed to fetch loyalty levels');
        }
    }

    /**
     * Increment noOfBookings by 1.
     * Then check whether the NEXT level exists and its threshold is now met.
     * If so, also bump guestLevel to that next level.
     *
     * Logic:
     *   newBookings = currentGuest.noOfBookings + 1
     *   nextLevel   = levels.find(l => l.level === currentGuest.guestLevel + 1)
     *   if nextLevel && newBookings >= nextLevel.noOfReservations → upgrade
     */
    public async incrementBookingsAndMaybeUpgrade(
        creationGuestId: string,
        currentNoOfBookings: number,
        currentGuestLevel: number,
        levels: ILoyaltyLevel[]
    ): Promise<ICreationGuest> {
        try {
            const newBookings = currentNoOfBookings + 1;

            const nextLevel = levels.find(
                (l) => l.level === currentGuestLevel + 1
            );

            const shouldUpgrade =
                !!nextLevel && newBookings >= nextLevel.noOfReservations;

            return await prisma.creationGuest.update({
                where: { id: creationGuestId },
                data: {
                    noOfBookings: newBookings,
                    ...(shouldUpgrade && { guestLevel: nextLevel!.level }),
                },
            });
        } catch (error) {
            throw error instanceof Error
                ? new Error(
                      `Failed to increment loyalty bookings: ${error.message}`
                  )
                : new Error('Failed to increment loyalty bookings');
        }
    }

    /**
     * Convenience method: resolves the LoyalityGuest by email, then
     * increments + maybe upgrades.  Silently skips if the guest or
     * CreationGuest record does not exist yet (they may not be enrolled).
     */
    public async handlePostBookingLoyalty(
        guestEmail: string,
        creationLoyaltyConfigId: string
    ): Promise<void> {
        try {
            // 1. find the loyalty account by email
            const loyalityGuest = await prisma.loyalityGuest.findUnique({
                where: { guestEmail },
            });
            if (!loyalityGuest) return; // not enrolled – nothing to do

            // 2. find the programme-specific record
            const creationGuest = await this.getCreationGuest(
                loyalityGuest.id,
                creationLoyaltyConfigId
            );
            if (!creationGuest) return; // enrolled globally but not in this programme

            // 3. fetch all levels for this programme
            const levels = await this.getLoyaltyLevels(creationLoyaltyConfigId);
            if (levels.length === 0) return; // no levels defined yet

            // 4. increment + conditionally upgrade
            await this.incrementBookingsAndMaybeUpgrade(
                creationGuest.id,
                creationGuest.noOfBookings,
                creationGuest.guestLevel,
                levels
            );
        } catch (error) {
            // loyalty is non-critical – log but don't bubble up
            console.error('handlePostBookingLoyalty error:', error);
        }
    }
}