import { prisma } from '../../config';
import { IRawPricingBreakdown } from '../interfaces/reports.type';

export class ReportsRepository {
    /**
     * Single reservation fetch with ALL pricing relations included.
     * This is the only query needed for voucher & invoice generation.
     */
    public async getReservationDetails(bookingCode: string) {
        try {
            const reservation = await prisma.reservation.findUnique({
                where: { bookingCode },
                include: {
                    // ── Add-ons on the booking itself (carry images) ──────────
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

                    // ── Guests ────────────────────────────────────────────────
                    primaryGuest: true,
                    reservationGuests: true,

                    // ── Full pricing breakdown with ALL sub-relations ─────────
                    PricingBrakeDown: {
                        include: {
                            DailyPriceBrakeDown: true,   // nightly room charges
                            taxBrakeDown: true,           // tax lines
                            AddonBrakeDowns: true,        // per-day addon amounts
                            promotionBrakeDown: true,     // ← was missing before
                        },
                    },

                    // ── Property with everything the voucher needs ────────────
                    property: {
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
                            bookingEngineConfig: {
                                select: { logo: true, primaryColor: true },
                            },
                        },
                    },
                },
            });

            if (!reservation) return null;

            // ── Room details ─────────────────────────────────────────────────
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

            // ── Rate plan name ───────────────────────────────────────────────
            const ratePlan = reservation.ratePlanCode
                ? await prisma.ratePlan.findUnique({
                      where: { ratePlanCode: reservation.ratePlanCode },
                      select: { ratePlanName: true },
                  })
                : null;

            return {
                ...reservation,
                // Make the Prisma type explicit so service can rely on it
                PricingBrakeDown: reservation.PricingBrakeDown as
                    | IRawPricingBreakdown
                    | null,
                room,
                ratePlanName:
                    ratePlan?.ratePlanName ?? reservation.ratePlanCode,
            };
        } catch (error) {
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Internal Server Error');
        }
    }

    // ── Kept for backward-compat with other features ─────────────────────────

    public async getPropertyDetails(propertyId: string) {
        try {
            return await prisma.property.findUnique({
                where: { id: propertyId },
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
            if (error instanceof Error) throw new Error(error.message);
            throw new Error('Failed to fetch property details');
        }
    }

    public async getReservation(bookingCode: string) {
        return prisma.reservation.findUnique({
            where: { bookingCode },
            include: {
                addOns: { include: { addon: true } },
                primaryGuest: true,
                property: { include: { propertyAddress: true } },
            },
        });
    }

    public async getReservationsByDateRange(
        propertyId: string,
        startDate: Date,
        endDate: Date
    ) {
        return prisma.reservation.findMany({
            where: {
                propertyId,
                checkInDate: { gte: startDate, lte: endDate },
            },
            include: {
                primaryGuest: true,
                addOns: { include: { addon: true } },
            },
        });
    }

    public async getGuestsByProperty(propertyId: string) {
        return prisma.guests.findMany({
            where: { propertyId },
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
}