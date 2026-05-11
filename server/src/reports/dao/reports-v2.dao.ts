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
                // Super: all properties in the system, optionally scoped by
                // group → brand → property override chain.
                if (overridePropertyId) {
                    // Narrowest filter wins — overridePropertyId is the Creation.id (PK)
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            id: overridePropertyId,
                        },
                        select: { propertyId: true },
                    });
                } else if (overrideBrandId) {
                    // Filter by a specific brand (brand owns its properties via brandId)
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            brandId: overrideBrandId,
                        },
                        select: { propertyId: true },
                    });
                } else if (overrideGroupId) {
                    // Filter by a specific group: properties directly under the group
                    // OR under any brand that belongs to the group
                    const groupBrands = await prisma.creation.findMany({
                        where: { type: 'brand', groupId: overrideGroupId },
                        select: { id: true },
                    });
                    const groupBrandIds = groupBrands.map(b => b.id);

                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            OR: [
                                { groupId: overrideGroupId },
                                ...(groupBrandIds.length > 0
                                    ? [{ brandId: { in: groupBrandIds } }]
                                    : []),
                            ],
                        },
                        select: { propertyId: true },
                    });
                } else {
                    // No override — return all properties
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                        },
                        select: { propertyId: true },
                    });
                }
                break;
            }
            case 'regional': {
                if (overridePropertyId) {
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            id: overridePropertyId,
                            regionalId: creation.id,
                        },
                        select: { propertyId: true },
                    });
                } else if (overrideBrandId) {
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            regionalId: creation.id,
                            brandId: overrideBrandId,
                        },
                        select: { propertyId: true },
                    });
                } else {
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            regionalId: creation.id,
                        },
                        select: { propertyId: true },
                    });
                }
                break;
            }
            case 'group': {
                // Properties can belong to a group either:
                //   (a) directly via groupId = creation.id
                //   (b) via a brand that belongs to the group (brandId = one of group's brands)
                // When filtering by brand, look for properties of that brand only
                // (brand must belong to this group for security).
                if (overridePropertyId) {
                    // Direct property override — still validate it belongs to this group scope
                    const groupBrands = await prisma.creation.findMany({
                        where: { type: 'brand', groupId: creation.id },
                        select: { id: true },
                    });
                    const groupBrandIds = groupBrands.map(b => b.id);

                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            id: overridePropertyId,
                            OR: [
                                { groupId: creation.id },
                                ...(groupBrandIds.length > 0
                                    ? [{ brandId: { in: groupBrandIds } }]
                                    : []),
                            ],
                        },
                        select: { propertyId: true },
                    });
                } else if (overrideBrandId) {
                    // Filter to a specific brand's properties (brand must belong to this group)
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            brandId: overrideBrandId,
                            // Validate brand belongs to this group
                            brand: { groupId: creation.id },
                        },
                        select: { propertyId: true },
                    });
                } else {
                    // No override — get all properties in this group scope (direct + via brands)
                    const groupBrands = await prisma.creation.findMany({
                        where: { type: 'brand', groupId: creation.id },
                        select: { id: true },
                    });
                    const groupBrandIds = groupBrands.map(b => b.id);

                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            OR: [
                                { groupId: creation.id },
                                ...(groupBrandIds.length > 0
                                    ? [{ brandId: { in: groupBrandIds } }]
                                    : []),
                            ],
                        },
                        select: { propertyId: true },
                    });
                }
                break;
            }
            case 'brand': {
                if (overridePropertyId) {
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            id: overridePropertyId,
                            brandId: creation.id,
                        },
                        select: { propertyId: true },
                    });
                } else {
                    propertyCreations = await prisma.creation.findMany({
                        where: {
                            type: 'property',
                            propertyId: { not: null },
                            brandId: creation.id,
                        },
                        select: { propertyId: true },
                    });
                }
                break;
            }
            case 'property': {
                // Property-level users are always fixed to their own property
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
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    },
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
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                addOns: {
                    select: { name: true, totalPrice: true, quantity: true },
                },
                agency: { select: { agencyName: true } },
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
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phoneNumber: true,
                    },
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
                    select: {
                        amount: true,
                        status: true,
                        paymentMethod: true,
                        createdAt: true,
                    },
                },
                AgencyCommission: {
                    select: {
                        commissionAmount: true,
                        commissionValue: true,
                        commissionType: true,
                    },
                },
            },
            orderBy: { bookedAt: 'desc' },
        });
    }

    // ── Property name map helper ───────────────────────────────────────────────
    public async getPropertyNames(
        propertyIds: string[]
    ): Promise<Map<string, string>> {
        const props = await prisma.property.findMany({
            where: { id: { in: propertyIds } },
            select: { id: true, propertyName: true, propertyCode: true },
        });
        const map = new Map<string, string>();
        props.forEach(p =>
            map.set(p.id, `${p.propertyName} (${p.propertyCode})`)
        );
        return map;
    }
}
