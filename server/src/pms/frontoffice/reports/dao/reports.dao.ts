import { prisma } from '../../../../config';

export class ReportsRepository {
    public async getReservationDetails(bookingCode: string) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { bookingCode },
                include: {
                    addOns: {
                        include: {
                            addon: {
                                select: {
                                    images: true,
                                    name: true,
                                    description: true,
                                },
                            },
                        },
                    },
                    primaryGuest: true,
                    priceBreakdowns: true,
                    reservationGuests: true,
                    reservationPromotions: true,
                    property: {
                        include: {
                            propertyAddress: true,
                            propertyAmenities: {
                                include: {
                                    amenity: {
                                        select: { amenityName: true, icon: true },
                                    },
                                },
                            },
                            bookingEngineConfig: {
                                select: { logo: true, primaryColor: true },
                            },
                        },
                    },
                },
            });

            if (!reservation) return null;

            // ── Fetch room images ─────────────────────────────────────────────
            const room = reservation.roomTypeCode
                ? await prisma.room.findFirst({
                    where: {
                        propertyId: reservation.propertyId,
                        roomType: reservation.roomTypeCode,
                    },
                    select: {
                        roomName: true,
                        roomType: true,
                        image: true,
                        description: true,
                        maxOccupancy: true,
                        roomSize: true,
                        roomUnit: true,
                    },
                })
                : null;

            // ── Fetch rate plan name ──────────────────────────────────────────
            const ratePlan = reservation.ratePlanCode
                ? await prisma.ratePlan.findUnique({
                    where: { ratePlanCode: reservation.ratePlanCode },
                    select: { ratePlanName: true },
                })
                : null;

            return { ...reservation, room, ratePlanName: ratePlan?.ratePlanName ?? reservation.ratePlanCode };

        } catch (error) {
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Internal Server Error');
        }
    }

    public async getPropertyDetails(propertyId: string) {
        try {
            return await prisma.property.findUnique({
                where: {
                    id: propertyId,
                },
                include: {
                    propertyAddress: true,
                    propertyAmenities: {
                        include: {
                            amenity: {
                                select: {
                                    amenityName: true,
                                    icon: true,
                                },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Failed to fetch property details');
        }
    }

    public async getReservation(bookingCode: string) {
        return await prisma.reservation.findUnique({
            where: {
                bookingCode: bookingCode,
            },
            include: {
                addOns: {
                    include: {
                        addon: true,
                    },
                },
                primaryGuest: true,
                property: {
                    include: {
                        propertyAddress: true,
                    },
                },
            },
        });
    }

    // Note: This method needs significant rework as Folio and FolioTransaction don't exist
    // Commenting it out for now - you'll need to implement this differently
    /*
    public async getNightAuditSummary(
        propertyCode: string,
        propertyId: string,
        from: Date,
        to: Date
    ) {
        // This needs to be reimplemented based on your actual schema
        // You don't have Folio or FolioTransaction models
        throw new Error('Night audit functionality needs to be implemented based on your schema');
    }
    */

    // Additional methods for reports based on your actual schema

    public async getReservationsByDateRange(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ) {
        return await prisma.reservation.findMany({
            where: {
                propertyId,
                checkInDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                primaryGuest: true,
                addOns: {
                    include: {
                        addon: true,
                    },
                },
                priceBreakdowns: true,
            },
        });
    }

    public async getGuestsByProperty(propertyId: string) {
        return await prisma.guests.findMany({
            where: {
                propertyId,
            },
            include: {
                primaryReservations: {
                    select: {
                        id: true,
                        amount: true,
                        reservationStartDate: true,
                        reservationEndDate: true,
                    },
                },
            },
        });
    }

    public async getPropertyReservationStats(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ) {
        const reservations = await prisma.reservation.findMany({
            where: {
                propertyId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                id: true,
                amount: true,
                bookingStatus: true,
                bookingSource: true,
            },
        });

        const confirmed = reservations.filter(
            r => r.bookingStatus === 'confirmed'
        ).length;
        const cancelled = reservations.filter(
            r => r.bookingStatus === 'cancelled'
        ).length;
        const totalRevenue = reservations
            .filter(r => r.bookingStatus === 'confirmed')
            .reduce((sum, r) => sum + Number(r.amount), 0);

        return {
            total: reservations.length,
            confirmed,
            cancelled,
            totalRevenue,
            reservations,
        };
    }

    public async getArrivalsForDate(propertyId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.reservation.findMany({
            where: {
                propertyId,
                checkInDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                bookingStatus: {
                    in: ['confirmed', 'pending'],
                },
            },
            include: {
                primaryGuest: true,
            },
        });
    }

    public async getDeparturesForDate(propertyId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await prisma.reservation.findMany({
            where: {
                propertyId,
                checkOutDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                bookingStatus: {
                    in: ['confirmed', 'pending'],
                },
            },
            include: {
                primaryGuest: true,
            },
        });
    }
}