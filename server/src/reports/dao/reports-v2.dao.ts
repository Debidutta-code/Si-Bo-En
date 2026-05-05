import { prisma } from '../../config';

// ─── Creation Tree Resolver ────────────────────────────────────────────────────
// Resolves the list of propertyIds accessible to a user based on their creationId
export class CreationScopeResolver {
    public async resolvePropertyIds(
        creationId: string,
        overridePropertyId?: string,
        overrideBrandId?: string,
        overrideGroupId?: string
    ): Promise<string[]> {
        const creation = await prisma.creation.findUnique({
            where: { id: creationId },
            select: { id: true, type: true, propertyId: true },
        });

        if (!creation) return [];

        let propertyCreations: { propertyId: string | null }[] = [];

        switch (creation.type) {
            case 'super': {
                // Super: all properties in the system
                propertyCreations = await prisma.creation.findMany({
                    where: {
                        type: 'property',
                        propertyId: { not: null },
                        ...(overrideGroupId && { groupId: overrideGroupId }),
                        ...(overrideBrandId && { brandId: overrideBrandId }),
                        ...(overridePropertyId && { propertyId: overridePropertyId }),
                    },
                    select: { propertyId: true },
                });
                break;
            }
            case 'regional': {
                propertyCreations = await prisma.creation.findMany({
                    where: {
                        type: 'property',
                        propertyId: { not: null },
                        regionalId: creation.id,
                        ...(overrideBrandId && { brandId: overrideBrandId }),
                        ...(overridePropertyId && { propertyId: overridePropertyId }),
                    },
                    select: { propertyId: true },
                });
                break;
            }
            case 'group': {
                propertyCreations = await prisma.creation.findMany({
                    where: {
                        type: 'property',
                        propertyId: { not: null },
                        groupId: creation.id,
                        ...(overrideBrandId && { brandId: overrideBrandId }),
                        ...(overridePropertyId && { propertyId: overridePropertyId }),
                    },
                    select: { propertyId: true },
                });
                break;
            }
            case 'brand': {
                propertyCreations = await prisma.creation.findMany({
                    where: {
                        type: 'property',
                        propertyId: { not: null },
                        brandId: creation.id,
                        ...(overridePropertyId && { propertyId: overridePropertyId }),
                    },
                    select: { propertyId: true },
                });
                break;
            }
            case 'property': {
                // Level 0/1 — always fixed to their property
                if (creation.propertyId) {
                    return [creation.propertyId];
                }
                return [];
            }
        }

        return propertyCreations
            .map(c => c.propertyId)
            .filter((id): id is string => id !== null);
    }
}

// ─── Reports V2 DAO ────────────────────────────────────────────────────────────
export class ReportsV2Repository {
    // ── Helpers ────────────────────────────────────────────────────────────────
    private parseDate(dateStr?: string): Date {
        if (!dateStr) {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            return d;
        }
        return new Date(dateStr);
    }

    private parseEndDate(dateStr?: string): Date {
        if (!dateStr) {
            const d = new Date();
            d.setHours(23, 59, 59, 999);
            return d;
        }
        const d = new Date(dateStr);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    // ── Report 1: Comparison ───────────────────────────────────────────────────
    public async getComparisonData(
        propertyIds: string[],
        startDate: string,
        endDate: string,
        groupBy: 'day' | 'month' | 'year'
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        const reservations = await prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            select: {
                propertyId: true,
                propertyCode: true,
                hotelName: true,
                amount: true,
                bookingStatus: true,
                reservationStartDate: true,
                reservationEndDate: true,
                bookedAt: true,
            },
        });

        return { reservations, groupBy, start, end };
    }

    // ── Report 2: Reservation Overview ────────────────────────────────────────
    public async getReservationOverview(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            include: {
                primaryGuest: {
                    select: { firstName: true, lastName: true, email: true, phoneNumber: true },
                },
            },
            orderBy: { reservationStartDate: 'asc' },
        });
    }

    // ── Report 3: Revenue Analytics ───────────────────────────────────────────
    public async getRevenueAnalytics(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            select: {
                propertyId: true,
                hotelName: true,
                propertyCode: true,
                amount: true,
                paidAmount: true,
                refundAmount: true,
                extraAmountToPay: true,
                bookingStatus: true,
                bookingSource: true,
                paymentMethod: true,
                roomTypeCode: true,
                ratePlanCode: true,
                ratePlanName: true,
                reservationStartDate: true,
                reservationEndDate: true,
                addOns: { select: { totalPrice: true } },
            },
            orderBy: { reservationStartDate: 'asc' },
        });
    }

    // ── Report 4: Additional Insights ─────────────────────────────────────────
    public async getInsightsData(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            select: {
                propertyId: true,
                hotelName: true,
                deviceTypes: true,
                platforms: true,
                bookingSource: true,
                isPromoUsed: true,
                bookedAt: true,
                checkInDate: true,
                countryCode: true,
                addOns: { select: { totalPrice: true } },
            },
        });
    }

    // ── Report 5: Top Performing Properties ───────────────────────────────────
    public async getTopPropertiesData(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            select: {
                propertyId: true,
                hotelName: true,
                propertyCode: true,
                amount: true,
                bookingStatus: true,
                reservationStartDate: true,
                reservationEndDate: true,
            },
        });
    }

    // ── Report 6: All Reservations ────────────────────────────────────────────
    public async getAllReservations(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            include: {
                primaryGuest: {
                    select: { firstName: true, lastName: true, email: true, phoneNumber: true },
                },
                addOns: { select: { name: true, totalPrice: true, quantity: true } },
                agency: { select: { agencyName:true } },
            },
            orderBy: { bookedAt: 'desc' },
        });
    }

    // ── Report 7: Check-In / Check-Out ────────────────────────────────────────
    public async getCheckInOutData(
        propertyIds: string[],
        startDate: string,
        endDate: string,
        mode: 'checkin' | 'checkout'
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        const dateField = mode === 'checkin' ? 'checkInDate' : 'checkOutDate';

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                [dateField]: { gte: start, lte: end },
            },
            include: {
                primaryGuest: {
                    select: { firstName: true, lastName: true, email: true, phoneNumber: true },
                },
            },
            orderBy: { [dateField]: 'asc' },
        });
    }

    // ── Report 8: Status Breakdown ────────────────────────────────────────────
    public async getStatusBreakdown(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            select: {
                propertyId: true,
                hotelName: true,
                propertyCode: true,
                bookingStatus: true,
                amount: true,
            },
        });
    }

    // ── Report 9: Loyalty Guest ───────────────────────────────────────────────
    public async getLoyaltyGuests(propertyIds: string[]) {
        return prisma.guests.findMany({
            where: {
                propertyId: { in: propertyIds },
                isALoyalityGuest: true,
            },
            include: {
                primaryReservations: {
                    select: {
                        id: true,
                        amount: true,
                        reservationStartDate: true,
                        bookingStatus: true,
                    },
                },
                loyalityGuests: {
                    select: {
                        createdAt: true,
                    },
                },
                property: {
                    select: { propertyName: true, propertyCode: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    // ── Report 10: Payment Status ──────────────────────────────────────────────
    public async getPaymentStatus(
        propertyIds: string[],
        startDate: string,
        endDate: string
    ) {
        const start = this.parseDate(startDate);
        const end = this.parseEndDate(endDate);

        return prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                reservationStartDate: { gte: start, lte: end },
            },
            include: {
                primaryGuest: {
                    select: { firstName: true, lastName: true, email: true },
                },
                payments: {
                    select: { amount: true, status: true, paymentMethod: true, createdAt: true },
                },
                AgencyCommission: {
                    select: { commissionAmount: true, commissionValue: true, commissionType: true },
                },
            },
            orderBy: { bookedAt: 'desc' },
        });
    }

    // ── Property name map helper ───────────────────────────────────────────────
    public async getPropertyNames(propertyIds: string[]): Promise<Map<string, string>> {
        const props = await prisma.property.findMany({
            where: { id: { in: propertyIds } },
            select: { id: true, propertyName: true, propertyCode: true },
        });
        const map = new Map<string, string>();
        props.forEach(p => map.set(p.id, `${p.propertyName} (${p.propertyCode})`));
        return map;
    }
}
