import { prisma } from '../../config';
import { convertCurrency } from '../../currency-maping/utils';
import { CurrencyCode } from '../../tax-system/interfaces';
import {
    IPropertyCodeAndIds,
    IAnalyticsData,
    IReservationAnalytics,
    IRevenueAnalytics,
    IRoomAnalytics,
    IGuestAnalytics,
    IAddonAnalytics,
    IBookingSourceAnalytics,
    IPaymentMethodAnalytics,
    ITopPerformingProperties,
    IStatisticsComparison,
    IComparisonPeriod,
} from '../types';

export class DashBoardRepository {
    public async getAnalyticsData(
        propertyIdsAndCodes: IPropertyCodeAndIds[],
        userLevel?: number,
        currencyCode?: CurrencyCode
    ) {
        try {
            const propertyIds = propertyIdsAndCodes.map(p => p.id);
            const targetCurrency = currencyCode || 'USD';

            const [
                reservationStats,
                revenueStats,
                guestStats,
                addonStats,
                bookingSourceStats,
                paymentMethodStats,
            ] = await Promise.all([
                this.getReservationAnalytics(propertyIds),
                this.getRevenueAnalytics(propertyIds, targetCurrency), // <-- pass it
                this.getGuestAnalytics(propertyIds),
                this.getAddonAnalytics(propertyIds, targetCurrency), // <-- pass it
                this.getBookingSourceAnalytics(propertyIds, targetCurrency), // <-- pass it
                this.getPaymentMethodAnalytics(propertyIds, targetCurrency), // <-- pass it
            ]);

            // Fetch top performing properties analytics for users with level > 1
            let topPropertiesStats: ITopPerformingProperties | undefined;
            if (userLevel && userLevel > 1) {
                topPropertiesStats = await this.getTopPerformingProperties(
                    propertyIdsAndCodes,
                    targetCurrency
                );
            }

            const analyticsData: IAnalyticsData = {
                currencyCode: targetCurrency,
                reservation: reservationStats,
                revenue: revenueStats,
                guest: guestStats,
                addon: addonStats,
                bookingSource: bookingSourceStats,
                paymentMethod: paymentMethodStats,
            };

            if (topPropertiesStats) {
                analyticsData.topPerformingProperties = topPropertiesStats;
            }

            return {
                success: true,
                data: analyticsData,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                data: null,
            };
        }
    }

    /**
     * Reservation & Booking Analytics
     */
    private async getReservationAnalytics(
        propertyIds: string[]
    ): Promise<IReservationAnalytics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(
            today.getTime() - 30 * 24 * 60 * 60 * 1000
        );

        const [
            totalReservations,
            reservations,
            todayCheckIns,
            todayCheckOuts,
            upcomingReservations,
            recentBookings,
        ] = await Promise.all([
            // Total reservations
            prisma.reservation.count({
                where: { propertyId: { in: propertyIds } },
            }),
            prisma.reservation.findMany({
                where: { propertyId: { in: propertyIds } },
                select: {
                    bookingStatus: true,
                    reservationStartDate: true,
                    reservationEndDate: true,
                    guests: true,
                },
            }),
            // Today's check-ins
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    reservationStartDate: { gte: today, lt: tomorrow },
                },
            }),
            // Today's check-outs
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    reservationEndDate: { gte: today, lt: tomorrow },
                },
            }),
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    reservationStartDate: { gte: today, lte: nextWeek },
                },
            }),
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
        ]);

        // Calculate status breakdown
        const statusMap = new Map<string, number>();
        let cancelled = 0;

        reservations.forEach(reservation => {
            const status = reservation.bookingStatus;
            statusMap.set(status, (statusMap.get(status) || 0) + 1);
            if (status === 'cancelled') {
                cancelled++;
            }
        });

        const statusBreakdown = Array.from(statusMap.entries()).map(
            ([status, count]) => ({
                status,
                count,
            })
        );

        const cancellationRate =
            totalReservations > 0 ? (cancelled / totalReservations) * 100 : 0;

        // Calculate additional metrics
        let totalStayDays = 0;
        let totalGuests = 0;

        reservations.forEach(reservation => {
            const checkIn = new Date(reservation.reservationStartDate);
            const checkOut = new Date(reservation.reservationEndDate);
            const stayDuration = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );
            totalStayDays += stayDuration;

            // Parse guests JSON to count
            try {
                const guestsData = reservation.guests as any;
                if (Array.isArray(guestsData)) {
                    totalGuests += guestsData.length;
                }
            } catch (e) {
                // Skip if guests data is malformed
            }
        });

        const averageStayDuration =
            totalReservations > 0
                ? (totalStayDays / totalReservations).toFixed(2)
                : '0';
        const averageGuestsPerBooking =
            totalReservations > 0
                ? (totalGuests / totalReservations).toFixed(2)
                : '0';

        return {
            totalReservations,
            statusBreakdown,
            todayCheckIns,
            todayCheckOuts,
            upcomingReservations,
            cancellationRate: cancellationRate.toFixed(2),
            averageStayDuration,
            averageGuestsPerBooking,
            totalGuests,
            last30DaysBookings: recentBookings,
        };
    }

    /**
     * Revenue Analytics - Based on Reservation amounts
     */
    private async getRevenueAnalytics(
        propertyIds: string[],
        targetCurrency: CurrencyCode
    ): Promise<IRevenueAnalytics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisMonthStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
        const thisWeekStart = new Date(
            today.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        const lastMonthStart = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );
        const lastMonthEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
            23,
            59,
            59,
            999
        );

        // Fetch raw reservations with currency instead of aggregating directly
        const allConfirmed = await prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                bookingStatus: 'confirmed',
            },
            select: {
                amount: true,
                paidAmount: true,
                currencyCode: true,
                createdAt: true,
            },
        });

        const sumInUSD = async (
            rows: { amount: number; currencyCode: string }[]
        ) => {
            const converted = await Promise.all(
                rows.map(r =>
                    convertCurrency(
                        r.amount,
                        r.currencyCode as CurrencyCode,
                        targetCurrency
                    )
                )
            );
            return converted.reduce((a, b) => a + b, 0);
        };

        const [
            totalRevenue,
            todayRevenue,
            weekRevenue,
            monthRevenue,
            lastMonthRevenue,
        ] = await Promise.all([
            sumInUSD(allConfirmed),
            sumInUSD(allConfirmed.filter(r => r.createdAt >= today)),
            sumInUSD(allConfirmed.filter(r => r.createdAt >= thisWeekStart)),
            sumInUSD(allConfirmed.filter(r => r.createdAt >= thisMonthStart)),
            sumInUSD(
                allConfirmed.filter(
                    r =>
                        r.createdAt >= lastMonthStart &&
                        r.createdAt <= lastMonthEnd
                )
            ),
        ]);

        const avgRevenuePerBooking =
            allConfirmed.length > 0 ? totalRevenue / allConfirmed.length : 0;

        // Payment status breakdown
        const allReservations = await prisma.reservation.findMany({
            where: { propertyId: { in: propertyIds } },
            select: {
                bookingStatus: true,
                amount: true,
                paidAmount: true,
                currencyCode: true,
            },
        });

        const statusGroups = new Map<string, typeof allReservations>();
        for (const r of allReservations) {
            if (!statusGroups.has(r.bookingStatus))
                statusGroups.set(r.bookingStatus, []);
            statusGroups.get(r.bookingStatus)!.push(r);
        }

        const paymentStatusBreakdown = await Promise.all(
            Array.from(statusGroups.entries()).map(async ([status, rows]) => ({
                status,
                amount: await sumInUSD(rows),
                count: rows.length,
            }))
        );

        // Pending payments
        const pendingRows = await prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                bookingStatus: 'pending',
            },
            select: { extraAmountToPay: true, currencyCode: true },
        });

        const pendingAmount = (
            await Promise.all(
                pendingRows.map(
                    r =>
                        convertCurrency(
                            r.extraAmountToPay,
                            r.currencyCode as CurrencyCode,
                            targetCurrency
                        ) // ✅
                )
            )
        ).reduce((a, b) => a + b, 0);

        const thisMonthAmount = monthRevenue;
        const lastMonthAmount = lastMonthRevenue;
        const monthOverMonthGrowth =
            lastMonthAmount > 0
                ? (
                    ((thisMonthAmount - lastMonthAmount) / lastMonthAmount) *
                    100
                ).toFixed(2)
                : '0';

        const totalRooms = await prisma.room.aggregate({
            where: { propertyId: { in: propertyIds } },
            _sum: { totalRoom: true },
        });

        const daysInMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
        ).getDate();
        const totalRoomCount = totalRooms._sum.totalRoom || 0;
        const revPAR =
            totalRoomCount > 0 && daysInMonth > 0
                ? thisMonthAmount / (totalRoomCount * daysInMonth)
                : 0;

        // Last 7 days trend
        const last7DaysTrend = await Promise.all(
            Array.from({ length: 7 }, (_, i) => {
                const dayStart = new Date(today);
                dayStart.setDate(dayStart.getDate() - (6 - i));
                dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);
                return { dayStart, dayEnd };
            }).map(async ({ dayStart, dayEnd }) => {
                const rows = allConfirmed.filter(
                    r => r.createdAt >= dayStart && r.createdAt <= dayEnd
                );
                return {
                    date: dayStart.toISOString().split('T')[0],
                    revenue: await sumInUSD(rows),
                };
            })
        );

        return {
            totalRevenue,
            todayRevenue,
            weekRevenue,
            monthRevenue: thisMonthAmount,
            lastMonthRevenue: lastMonthAmount,
            monthOverMonthGrowth,
            revPAR: Number(revPAR.toFixed(2)),
            paymentStatusBreakdown,
            averageRevenuePerBooking: avgRevenuePerBooking,
            pendingPayments: {
                amount: pendingAmount,
                count: pendingRows.length,
            },
            last7DaysTrend,
        };
    }
    public async getStatisticsComparison(
        propertyIds: string[],
        comparisonType: 'date' | 'month' | 'year',
        selectedDate: Date,
        currencyCode: CurrencyCode
    ): Promise<IStatisticsComparison> {
        const targetCurrency = currencyCode;
        const periods = this.calculateComparisonPeriods(
            comparisonType,
            selectedDate
        );

        const [currentPeriodData, previousPeriodData] = await Promise.all([
            this.getStatisticsForPeriod(
                propertyIds,
                periods.current.start,
                periods.current.end,
                targetCurrency
            ), // ✅ pass it
            this.getStatisticsForPeriod(
                propertyIds,
                periods.previous.start,
                periods.previous.end,
                targetCurrency
            ), // ✅ pass it
        ]);

        return {
            currencyCode: targetCurrency, // ✅ expose to frontend
            bookings: this.calculateChange(
                currentPeriodData.bookings,
                previousPeriodData.bookings
            ),
            cancelledBookings: this.calculateChange(
                currentPeriodData.cancelledBookings,
                previousPeriodData.cancelledBookings
            ),
            revenue: this.calculateChange(
                currentPeriodData.revenue,
                previousPeriodData.revenue
            ),
            averageBookingValue: this.calculateChange(
                currentPeriodData.averageBookingValue,
                previousPeriodData.averageBookingValue
            ),
            roomNights: this.calculateChange(
                currentPeriodData.roomNights,
                previousPeriodData.roomNights
            ),
            period: periods,
        };
    }

    private async getStatisticsForPeriod(
        propertyIds: string[],
        startDate: Date,
        endDate: Date,
        targetCurrency: CurrencyCode // ✅ added param
    ) {
        const [bookingsData, revenueRows, roomNightsData] = await Promise.all([
            prisma.reservation.findMany({
                where: {
                    propertyId: { in: propertyIds },
                    createdAt: { gte: startDate, lte: endDate },
                },
                select: {
                    bookingStatus: true,
                    amount: true,
                    reservationStartDate: true,
                    reservationEndDate: true,
                },
            }),
            prisma.reservation.findMany({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: {
                        notIn: ["cancelled", "no_show",]
                    },
                    createdAt: { gte: startDate, lte: endDate },
                },
                select: { amount: true, currencyCode: true },
            }),
            prisma.reservation.findMany({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: {
                        notIn: ["cancelled", "no_show",]
                    },
                    createdAt: { gte: startDate, lte: endDate },
                },
                select: {
                    reservationStartDate: true,
                    reservationEndDate: true,
                },
            }),
        ]);

        const totalBookings = bookingsData.length;
        const cancelledBookings = bookingsData.filter(
            b => b.bookingStatus === 'cancelled' || b.bookingStatus === "no_show"
        ).length;

        const revenue = (
            await Promise.all(
                revenueRows.map(
                    r =>
                        convertCurrency(
                            r.amount,
                            r.currencyCode as CurrencyCode,
                            targetCurrency
                        ) // ✅ was hardcoded 'USD'
                )
            )
        ).reduce((a, b) => a + b, 0);

        const confirmedBookings = revenueRows.length;
        const averageBookingValue =
            confirmedBookings > 0 ? revenue / confirmedBookings : 0;

        const roomNights = roomNightsData.reduce((total, booking) => {
            const checkIn = new Date(booking.reservationStartDate);
            const checkOut = new Date(booking.reservationEndDate);
            const nights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
            );
            return total + nights;
        }, 0);

        return {
            bookings: totalBookings,
            cancelledBookings,
            revenue,
            averageBookingValue,
            roomNights,
        };
    }

    private calculateComparisonPeriods(
        type: 'date' | 'month' | 'year',
        selectedDate: Date
    ): IComparisonPeriod {
        const current = { start: new Date(), end: new Date(), label: '' };
        const previous = { start: new Date(), end: new Date(), label: '' };

        if (type === 'date') {
            // Today vs Yesterday
            current.start = new Date(selectedDate);
            current.start.setHours(0, 0, 0, 0);
            current.end = new Date(selectedDate);
            current.end.setHours(23, 59, 59, 999);
            current.label = 'Today';

            previous.start = new Date(selectedDate);
            previous.start.setDate(previous.start.getDate() - 1);
            previous.start.setHours(0, 0, 0, 0);
            previous.end = new Date(selectedDate);
            previous.end.setDate(previous.end.getDate() - 1);
            previous.end.setHours(23, 59, 59, 999);
            previous.label = 'Yesterday';
        } else if (type === 'month') {
            // Selected month vs previous month
            current.start = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
            );
            current.end = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );
            current.label = current.start.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            });

            previous.start = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() - 1,
                1
            );
            previous.end = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                0,
                23,
                59,
                59,
                999
            );
            previous.label = previous.start.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            });
        } else {
            // 12 months ending in selected month vs previous 12 months
            current.end = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0,
                23,
                59,
                59,
                999
            );
            current.start = new Date(current.end);
            current.start.setMonth(current.start.getMonth() - 11);
            current.start.setDate(1);
            current.start.setHours(0, 0, 0, 0);
            current.label = `${current.start.toLocaleString('default', { month: 'short', year: 'numeric' })} - ${current.end.toLocaleString('default', { month: 'short', year: 'numeric' })}`;

            previous.end = new Date(current.start);
            previous.end.setDate(previous.end.getDate() - 1);
            previous.end.setHours(23, 59, 59, 999);
            previous.start = new Date(previous.end);
            previous.start.setMonth(previous.start.getMonth() - 11);
            previous.start.setDate(1);
            previous.start.setHours(0, 0, 0, 0);
            previous.label = `${previous.start.toLocaleString('default', { month: 'short', year: 'numeric' })} - ${previous.end.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
        }

        return { current, previous };
    }

    private calculateChange(current: number, previous: number) {
        const percentageChange =
            previous > 0
                ? ((current - previous) / previous) * 100
                : current > 0
                    ? 100
                    : 0;

        return {
            current,
            previous,
            percentageChange: Number(percentageChange.toFixed(2)),
        };
    }
    /**
     * Guest Analytics
     */
    private async getGuestAnalytics(
        propertyIds: string[]
    ): Promise<IGuestAnalytics> {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalGuests,
            guestTypeBreakdown,
            repeatGuests,
            countryBreakdown,
            recentGuests,
            verifiedGuests,
        ] = await Promise.all([
            prisma.guests.count({
                where: { propertyId: { in: propertyIds } },
            }),
            prisma.guests.groupBy({
                by: ['userType'],
                where: { propertyId: { in: propertyIds } },
                _count: true,
            }),
            prisma.guests.groupBy({
                by: ['email'],
                where: {
                    propertyId: { in: propertyIds },
                    email: { not: null },
                },
                _count: true,
                having: { email: { _count: { gt: 1 } } },
            }),
            prisma.guests.groupBy({
                by: ['country'],
                where: {
                    propertyId: { in: propertyIds },
                    country: { not: null },
                },
                _count: true,
                orderBy: { _count: { country: 'desc' } },
                take: 10,
            }),
            prisma.guests.count({
                where: {
                    propertyId: { in: propertyIds },
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
            prisma.guests.count({
                where: {
                    propertyId: { in: propertyIds },
                    identityCardNumber: { not: null },
                },
            }),
        ]);

        return {
            totalGuests,
            guestTypeBreakdown: guestTypeBreakdown.map(g => ({
                type: g.userType,
                count: g._count,
            })),
            repeatGuestsCount: repeatGuests.length,
            repeatGuestRate:
                totalGuests > 0
                    ? ((repeatGuests.length / totalGuests) * 100).toFixed(2)
                    : '0',
            topCountries: countryBreakdown.map(c => ({
                country: c.country || 'Unknown',
                count: c._count,
            })),
            recentGuests,
            verifiedGuests,
            verificationRate:
                totalGuests > 0
                    ? ((verifiedGuests / totalGuests) * 100).toFixed(2)
                    : '0',
        };
    }

    private async getAddonAnalytics(
        propertyIds: string[],
        targetCurrency: CurrencyCode
    ): Promise<IAddonAnalytics> {
        const [allAddons, addonCount] = await Promise.all([
            prisma.bookingAddon.findMany({
                where: {
                    Reservation: {
                        propertyId: { in: propertyIds },
                    },
                },
                select: {
                    addonId: true,
                    name: true,
                    totalPrice: true,
                    currencyCode: true,
                },
            }),
            prisma.bookingAddon.count({
                where: {
                    Reservation: {
                        propertyId: { in: propertyIds },
                    },
                },
            }),
        ]);

        // Convert all addon prices to USD
        const allAddonsInUSD = await Promise.all(
            allAddons.map(async a => ({
                ...a,
                totalPriceUSD: await convertCurrency(
                    a.totalPrice,
                    a.currencyCode as CurrencyCode,
                    targetCurrency
                ),
            }))
        );

        // Total addon revenue in USD
        const totalAddonRevenue = allAddonsInUSD.reduce(
            (sum, a) => sum + a.totalPriceUSD,
            0
        );

        // Group by addonId for popular addons
        const addonGroups = new Map<
            string,
            { name: string; revenue: number; count: number }
        >();
        for (const a of allAddonsInUSD) {
            const existing = addonGroups.get(a.addonId);
            if (existing) {
                existing.revenue += a.totalPriceUSD;
                existing.count += 1;
            } else {
                addonGroups.set(a.addonId, {
                    name: a.name,
                    revenue: a.totalPriceUSD,
                    count: 1,
                });
            }
        }

        const popularAddons = Array.from(addonGroups.entries())
            .map(([addonId, data]) => ({
                addonId,
                addonName: data.name,
                revenue: data.revenue,
                bookingCount: data.count,
            }))
            .sort((a, b) => b.bookingCount - a.bookingCount)
            .slice(0, 5);

        return {
            totalAddonRevenue,
            addonCount,
            popularAddons,
        };
    }

    private async getBookingSourceAnalytics(
        propertyIds: string[],
        targetCurrency: CurrencyCode
    ): Promise<IBookingSourceAnalytics> {
        const rows = await prisma.reservation.findMany({
            where: { propertyId: { in: propertyIds } },
            select: {
                bookingSource: true,
                amount: true,
                currencyCode: true,
            },
        });

        const sourceGroups = new Map<string, typeof rows>();
        for (const r of rows) {
            if (!sourceGroups.has(r.bookingSource))
                sourceGroups.set(r.bookingSource, []);
            sourceGroups.get(r.bookingSource)!.push(r);
        }

        const sourceBreakdown = await Promise.all(
            Array.from(sourceGroups.entries()).map(
                async ([source, sourceRows]) => ({
                    source,
                    count: sourceRows.length,
                    revenue: (
                        await Promise.all(
                            sourceRows.map(r =>
                                convertCurrency(
                                    r.amount,
                                    r.currencyCode as CurrencyCode,
                                    targetCurrency
                                )
                            )
                        )
                    ).reduce((a, b) => a + b, 0),
                })
            )
        );

        return { sourceBreakdown };
    }

    private async getPaymentMethodAnalytics(
        propertyIds: string[],
        targetCurrency: CurrencyCode
    ): Promise<IPaymentMethodAnalytics> {
        const rows = await prisma.reservation.findMany({
            where: {
                propertyId: { in: propertyIds },
                bookingStatus: 'confirmed',
            },
            select: {
                paymentMethod: true,
                paidAmount: true,
                currencyCode: true,
            },
        });

        // Group by paymentMethod
        const methodGroups = new Map<string, typeof rows>();
        for (const r of rows) {
            if (!methodGroups.has(r.paymentMethod))
                methodGroups.set(r.paymentMethod, []);
            methodGroups.get(r.paymentMethod)!.push(r);
        }

        const methodBreakdown = await Promise.all(
            Array.from(methodGroups.entries()).map(
                async ([method, methodRows]) => ({
                    method,
                    count: methodRows.length,
                    amount: (
                        await Promise.all(
                            methodRows.map(r =>
                                convertCurrency(
                                    r.paidAmount,
                                    r.currencyCode as CurrencyCode,
                                    targetCurrency
                                )
                            )
                        )
                    ).reduce((a, b) => a + b, 0),
                })
            )
        );

        return { methodBreakdown };
    }

    public async getTopPerformingProperties(
        propertyIdsAndCodes: IPropertyCodeAndIds[],
        targetCurrency: CurrencyCode
    ): Promise<ITopPerformingProperties> {
        try {
            const propertyIds = propertyIdsAndCodes.map(p => p.id);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const confirmedReservations = await prisma.reservation.findMany({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed',
                },
                select: {
                    propertyId: true,
                    amount: true,
                    currencyCode: true,
                },
            });

            const revenueByProperty = new Map<string, number>();
            await Promise.all(
                confirmedReservations.map(async r => {
                    const converted = await convertCurrency(
                        r.amount,
                        r.currencyCode as CurrencyCode,
                        targetCurrency
                    );
                    revenueByProperty.set(
                        r.propertyId,
                        (revenueByProperty.get(r.propertyId) || 0) + converted
                    );
                })
            );

            const bookingsByProperty = await prisma.reservation.groupBy({
                by: ['propertyId'],
                where: { propertyId: { in: propertyIds } },
                _count: true,
            });

            // Occupancy by property
            const roomsByProperty = await prisma.room.groupBy({
                by: ['propertyId'],
                where: { propertyId: { in: propertyIds } },
                _sum: { totalRoom: true },
            });

            const inventoryByProperty = await prisma.inventory.groupBy({
                by: ['propertyCode'],
                where: {
                    propertyCode: { in: propertyIdsAndCodes.map(p => p.code) },
                    date: today,
                },
                _sum: { availability: true },
            });

            const propertyMap = new Map(
                propertyIdsAndCodes.map(p => [p.id, p])
            );

            // Top by revenue
            const topByRevenue = Array.from(revenueByProperty.entries())
                .map(([propertyId, totalRevenue]) => {
                    const prop = propertyMap.get(propertyId);
                    return {
                        propertyId,
                        propertyCode: prop?.code || '',
                        propertyName: prop?.name || '',
                        totalRevenue,
                    };
                })
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 5);

            // Top by bookings — unchanged, no currency involved
            const topByBookings = bookingsByProperty
                .map(b => {
                    const prop = propertyMap.get(b.propertyId);
                    return {
                        propertyId: b.propertyId,
                        propertyCode: prop?.code || '',
                        propertyName: prop?.name || '',
                        totalBookings: b._count,
                    };
                })
                .sort((a, b) => b.totalBookings - a.totalBookings)
                .slice(0, 5);

            // Top by occupancy — unchanged, no currency involved
            const topByOccupancy = roomsByProperty
                .map(r => {
                    const prop = propertyMap.get(r.propertyId);
                    const inventory = inventoryByProperty.find(
                        i => i.propertyCode === prop?.code
                    );
                    const totalRooms = r._sum.totalRoom || 0;
                    const available =
                        inventory?._sum.availability || totalRooms;
                    const occupied = totalRooms - available;
                    const occupancyRate =
                        totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;
                    return {
                        propertyId: r.propertyId,
                        propertyCode: prop?.code || '',
                        propertyName: prop?.name || '',
                        occupancyRate: Number(occupancyRate.toFixed(2)),
                        totalRooms,
                        occupiedRooms: occupied,
                    };
                })
                .sort((a, b) => b.occupancyRate - a.occupancyRate)
                .slice(0, 5);

            return { topByRevenue, topByBookings, topByOccupancy };
        } catch (error) {
            console.error('Error in getTopPerformingProperties:', error);
            return { topByRevenue: [], topByBookings: [], topByOccupancy: [] };
        }
    }
}

export class DashUtilsRepo {
    public async getPropertyIdsAndCodesForLevel4(creationId: string) {
        try {
            const propertyData: Array<{
                id: string;
                code: string;
                name: string;
                currencyCode: CurrencyCode;
                isLoyaltyProgramEnabled: boolean;
            }> = [];

            const level4Creation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true,
                            propertyConfigs: {
                                select: {
                                    baseCurrency: true,
                                    isLoyaltyProgramEnabled: true,
                                },
                            },
                        },
                    },
                    superChildren: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        include: {
                            property: {
                                // where: {
                                //     propertyConfigs: {
                                //         isLoyaltyProgramEnabled: true
                                //     }

                                // },
                                select: {
                                    id: true,
                                    propertyCode: true,
                                    propertyName: true,
                                    propertyConfigs: {
                                        select: {
                                            baseCurrency: true,
                                            isLoyaltyProgramEnabled: true,

                                        },
                                    },
                                },
                            },
                            // Everything under group (level 3) is in groupChildren
                            groupChildren: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                include: {
                                    property: {
                                        select: {
                                            id: true,
                                            propertyCode: true,
                                            propertyName: true,
                                            propertyConfigs: {
                                                select: {
                                                    baseCurrency: true,
                                                    isLoyaltyProgramEnabled: true,

                                                },
                                            },
                                        },
                                    },
                                    // Everything under brand (level 2) is in brandChildren
                                    brandChildren: {
                                        where: {
                                            isActive: true,
                                            isDeleted: false,
                                        },
                                        include: {
                                            property: {

                                                select: {
                                                    id: true,
                                                    propertyCode: true,
                                                    propertyName: true,
                                                    propertyConfigs: {
                                                        select: {
                                                            baseCurrency: true,
                                                            isLoyaltyProgramEnabled: true,

                                                        },
                                                    },
                                                },
                                            },
                                            // Level 1 properties
                                            groupChildren: {
                                                where: {
                                                    isActive: true,
                                                    isDeleted: false,
                                                },
                                                include: {
                                                    property: {
                                                        // where: {
                                                        //     propertyConfigs: {
                                                        //         isLoyaltyProgramEnabled: true
                                                        //     }

                                                        // },

                                                        select: {
                                                            id: true,
                                                            propertyCode: true,
                                                            propertyName: true,
                                                            propertyConfigs: {
                                                                select: {
                                                                    baseCurrency: true,
                                                                    isLoyaltyProgramEnabled: true,

                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            brandChildren: {
                                where: { isActive: true, isDeleted: false },
                                include: {
                                    property: {
                                        // where: {
                                        //     propertyConfigs: {
                                        //         isLoyaltyProgramEnabled: true
                                        //     }

                                        // },

                                        select: {
                                            id: true,
                                            propertyCode: true,
                                            propertyName: true,
                                            propertyConfigs: {
                                                select: {
                                                    baseCurrency: true,
                                                    isLoyaltyProgramEnabled: true,

                                                },
                                            },
                                        },
                                    },
                                    groupChildren: {
                                        where: {
                                            isActive: true,
                                            isDeleted: false,
                                        },
                                        include: {
                                            property: {
                                                // where: {
                                                //     propertyConfigs: {
                                                //         isLoyaltyProgramEnabled: true
                                                //     }

                                                // },

                                                select: {
                                                    id: true,
                                                    propertyCode: true,
                                                    propertyName: true,
                                                    propertyConfigs: {
                                                        select: {
                                                            baseCurrency: true,
                                                            isLoyaltyProgramEnabled: true,

                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!level4Creation) {
                return {
                    success: false,
                    message: 'Creation not found or inactive',
                    data: [],
                };
            }
            // Collect property from level 4 itself (if exists)
            if (level4Creation.property) {
                propertyData.push({
                    id: level4Creation.property.id,
                    code: level4Creation.property.propertyCode,
                    name: level4Creation.property.propertyName,
                    currencyCode: (level4Creation.property.propertyConfigs
                        ?.baseCurrency ?? 'USD') as CurrencyCode,
                    isLoyaltyProgramEnabled: level4Creation.property.propertyConfigs
                        ?.isLoyaltyProgramEnabled ?? false,
                });
            }

            // Traverse superChildren (everything under super/level 4)
            for (const superChild of level4Creation.superChildren) {
                // Collect property from this super child (could be group/brand/property)
                if (superChild.property) {
                    propertyData.push({
                        id: superChild.property.id,
                        code: superChild.property.propertyCode,
                        name: superChild.property.propertyName,
                        currencyCode: (superChild.property.propertyConfigs
                            ?.baseCurrency ?? 'USD') as CurrencyCode,
                        isLoyaltyProgramEnabled: superChild.property.propertyConfigs
                            ?.isLoyaltyProgramEnabled ?? false,

                    });
                }

                // Traverse groupChildren (everything under group/level 3)
                for (const groupChild of superChild.groupChildren) {
                    // Collect property from this group child
                    if (groupChild.property) {
                        propertyData.push({
                            id: groupChild.property.id,
                            code: groupChild.property.propertyCode,
                            name: groupChild.property.propertyName,
                            currencyCode: (groupChild.property.propertyConfigs
                                ?.baseCurrency ?? 'USD') as CurrencyCode,
                            isLoyaltyProgramEnabled: groupChild.property.propertyConfigs
                                ?.isLoyaltyProgramEnabled ?? false,

                        });
                    }

                    // Traverse brandChildren (everything under brand/level 2)
                    for (const brandChild of groupChild.brandChildren) {
                        // Collect property from this brand child
                        if (brandChild.property) {
                            propertyData.push({
                                id: brandChild.property.id,
                                code: brandChild.property.propertyCode,
                                name: brandChild.property.propertyName,
                                currencyCode: (brandChild.property
                                    .propertyConfigs?.baseCurrency ??
                                    'USD') as CurrencyCode,
                                isLoyaltyProgramEnabled: brandChild.property.propertyConfigs
                                    ?.isLoyaltyProgramEnabled ?? false,

                            });
                        }

                        // Traverse level 1 properties under brand
                        for (const level1 of brandChild.groupChildren) {
                            if (level1.property) {
                                propertyData.push({
                                    id: level1.property.id,
                                    code: level1.property.propertyCode,
                                    name: level1.property.propertyName,
                                    currencyCode: (level1.property
                                        .propertyConfigs?.baseCurrency ??
                                        'USD') as CurrencyCode,
                                    isLoyaltyProgramEnabled: level1.property
                                        .propertyConfigs
                                        ?.isLoyaltyProgramEnabled ?? false,

                                });
                            }
                        }
                    }
                }

                for (const brandChild of superChild.brandChildren) {
                    if (brandChild.property) {
                        propertyData.push({
                            id: brandChild.property.id,
                            code: brandChild.property.propertyCode,
                            name: brandChild.property.propertyName,
                            currencyCode: (brandChild.property.propertyConfigs
                                ?.baseCurrency ?? 'USD') as CurrencyCode,
                            isLoyaltyProgramEnabled: brandChild.property.propertyConfigs
                                ?.isLoyaltyProgramEnabled ?? false,

                        });
                    }
                    for (const level1 of brandChild.groupChildren) {
                        if (level1.property) {
                            propertyData.push({
                                id: level1.property.id,
                                code: level1.property.propertyCode,
                                name: level1.property.propertyName,
                                currencyCode: (level1.property.propertyConfigs
                                    ?.baseCurrency ?? 'USD') as CurrencyCode,
                                isLoyaltyProgramEnabled: level1.property?.propertyConfigs
                                    ?.isLoyaltyProgramEnabled ?? false,

                            });
                        }
                    }
                }
            }

            return {
                success: true,
                message: 'Properties fetched successfully',
                data: propertyData,
                count: propertyData.length,
            };
        } catch (error) {
            console.error('Error fetching properties for level 4:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                data: [],
            };
        }
    }
    public async getPropertyIdsAndCodesForLevel3(creationId: string) {
        try {
            const propertyData: Array<{
                id: string;
                code: string;
                name: string;
                currencyCode: CurrencyCode;
                isLoyaltyProgramEnabled: boolean;
            }> = [];

            const level3Creation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    property: {
                        // where: {
                        //     propertyConfigs: {
                        //         isLoyaltyProgramEnabled: true
                        //     }

                        // },

                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true,
                            propertyConfigs: {
                                select: {
                                    baseCurrency: true,
                                    isLoyaltyProgramEnabled: true,

                                },
                            },
                        },
                    },
                    // Everything under group (level 3) is in groupChildren
                    groupChildren: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        include: {
                            property: {
                                // where: {
                                //     propertyConfigs: {
                                //         isLoyaltyProgramEnabled: true
                                //     }
                                // },
                                select: {
                                    id: true,
                                    propertyCode: true,
                                    propertyName: true,
                                    propertyConfigs: {
                                        select: {
                                            baseCurrency: true,
                                            isLoyaltyProgramEnabled: true,

                                        },
                                    },
                                },
                            },
                            // Everything under brand (level 2) is in brandChildren
                            brandChildren: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                include: {

                                    property: {
                                        // where: {
                                        //     propertyConfigs: {
                                        //         isLoyaltyProgramEnabled: true
                                        //     }

                                        // },

                                        select: {
                                            id: true,
                                            propertyCode: true,
                                            propertyName: true,
                                            propertyConfigs: {
                                                select: {
                                                    baseCurrency: true,
                                                    isLoyaltyProgramEnabled: true,
                                                },
                                            },
                                        },
                                    },
                                    // Level 1 properties
                                    groupChildren: {
                                        where: {
                                            isActive: true,
                                            isDeleted: false,
                                        },
                                        include: {
                                            property: {
                                                // where: {
                                                //     propertyConfigs: {
                                                //         isLoyaltyProgramEnabled: true
                                                //     }

                                                // },

                                                select: {
                                                    id: true,
                                                    propertyCode: true,
                                                    propertyName: true,
                                                    propertyConfigs: {
                                                        select: {
                                                            baseCurrency: true,
                                                            isLoyaltyProgramEnabled: true,

                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!level3Creation) {
                return {
                    success: false,
                    message: 'Creation not found or inactive',
                    data: [],
                };
            }
            // Collect property from level 3 itself (if exists)
            if (level3Creation.property) {
                propertyData.push({
                    id: level3Creation.property.id,
                    code: level3Creation.property.propertyCode,
                    name: level3Creation.property.propertyName,
                    currencyCode: level3Creation.property.propertyConfigs
                        ?.baseCurrency as CurrencyCode,
                    isLoyaltyProgramEnabled: level3Creation.property?.propertyConfigs
                        ?.isLoyaltyProgramEnabled as boolean,

                });
            }

            // Traverse groupChildren (everything under group/level 3)
            for (const groupChild of level3Creation.groupChildren) {
                // Collect property from this group child
                if (groupChild.property) {
                    propertyData.push({
                        id: groupChild.property.id,
                        code: groupChild.property.propertyCode,
                        name: groupChild.property.propertyName,
                        currencyCode: groupChild.property.propertyConfigs
                            ?.baseCurrency as CurrencyCode,
                        isLoyaltyProgramEnabled: groupChild.property?.propertyConfigs
                            ?.isLoyaltyProgramEnabled as boolean,

                    });
                }

                // Traverse brandChildren (everything under brand/level 2)
                for (const brandChild of groupChild.brandChildren) {
                    // Collect property from this brand child
                    if (brandChild.property) {
                        propertyData.push({
                            id: brandChild.property.id,
                            code: brandChild.property.propertyCode,
                            name: brandChild.property.propertyName,
                            currencyCode: brandChild.property.propertyConfigs
                                ?.baseCurrency as CurrencyCode,
                            isLoyaltyProgramEnabled: brandChild.property?.propertyConfigs
                                ?.isLoyaltyProgramEnabled as boolean,

                        });
                    }

                    // Traverse level 1 properties under brand
                    for (const level1 of brandChild.groupChildren) {
                        if (level1.property) {
                            propertyData.push({
                                id: level1.property.id,
                                code: level1.property.propertyCode,
                                name: level1.property.propertyName,
                                currencyCode: level1.property.propertyConfigs
                                    ?.baseCurrency as CurrencyCode,
                                isLoyaltyProgramEnabled: level1.property?.propertyConfigs
                                    ?.isLoyaltyProgramEnabled as boolean,

                            });
                        }
                    }
                }
            }

            return {
                success: true,
                message: 'Properties fetched successfully',
                data: propertyData,
                count: propertyData.length,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                data: [],
            };
        }
    }
    public async getPropertyIdsAndCodesForLevel2(creationId: string) {
        try {
            const propertyData: Array<{
                id: string;
                code: string;
                name: string;
                currencyCode: CurrencyCode;
                isLoyaltyProgramEnabled: boolean;

            }> = [];

            const level2Creation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    // Direct property (if level2 has a direct property)
                    property: {
                        // where: {
                        //     propertyConfigs: {
                        //         isLoyaltyProgramEnabled: true
                        //     }

                        // },

                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true,
                            propertyConfigs: {
                                select: {
                                    baseCurrency: true,
                                    isLoyaltyProgramEnabled: true,

                                },
                            },
                        },
                    },
                    // Everything under brand (level 2) is in brandChildren
                    brandChildren: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        include: {
                            property: {
                                // where: {
                                //     propertyConfigs: {
                                //         isLoyaltyProgramEnabled: true
                                //     }

                                // },

                                select: {
                                    id: true,
                                    propertyCode: true,
                                    propertyName: true,
                                    propertyConfigs: {
                                        select: {
                                            baseCurrency: true,
                                            isLoyaltyProgramEnabled: true,

                                        },
                                    },
                                },
                            },
                            // Level 1 properties
                            groupChildren: {
                                where: {
                                    isActive: true,
                                    isDeleted: false,
                                },
                                include: {
                                    property: {
                                        // where: {
                                        //     propertyConfigs: {
                                        //         isLoyaltyProgramEnabled: true
                                        //     }

                                        // },

                                        select: {
                                            id: true,
                                            propertyCode: true,
                                            propertyName: true,
                                            propertyConfigs: {
                                                select: {
                                                    baseCurrency: true,
                                                    isLoyaltyProgramEnabled: true,

                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (!level2Creation) {
                return {
                    success: false,
                    message: 'Creation not found or inactive',
                    data: [],
                };
            }
            // Collect property from level 2 itself (if exists)
            if (level2Creation.property) {
                propertyData.push({
                    id: level2Creation.property.id,
                    code: level2Creation.property.propertyCode,
                    name: level2Creation.property.propertyName,
                    currencyCode: (level2Creation.property.propertyConfigs
                        ?.baseCurrency ?? 'USD') as CurrencyCode,
                    isLoyaltyProgramEnabled: (level2Creation.property.propertyConfigs
                        ?.isLoyaltyProgramEnabled ?? false) as boolean,
                });
            }

            // Traverse brandChildren (everything under brand/level 2)
            for (const brandChild of level2Creation.brandChildren) {
                // Collect property from this brand child
                if (brandChild.property) {
                    propertyData.push({
                        id: brandChild.property.id,
                        code: brandChild.property.propertyCode,
                        name: brandChild.property.propertyName,
                        currencyCode: brandChild.property.propertyConfigs
                            ?.baseCurrency as CurrencyCode,
                        isLoyaltyProgramEnabled: (brandChild.property.propertyConfigs
                            ?.isLoyaltyProgramEnabled ?? false) as boolean,
                    });
                }

                // Traverse level 1 properties under brand
                for (const level1 of brandChild.groupChildren) {
                    if (level1.property) {
                        propertyData.push({
                            id: level1.property.id,
                            code: level1.property.propertyCode,
                            name: level1.property.propertyName,
                            currencyCode: level1.property.propertyConfigs
                                ?.baseCurrency as CurrencyCode,
                            isLoyaltyProgramEnabled: (level1.property.propertyConfigs
                                ?.isLoyaltyProgramEnabled ?? false) as boolean,
                        });
                    }
                }
            }

            return {
                success: true,
                message: 'Properties fetched successfully',
                data: propertyData,
                count: propertyData.length,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                data: [],
            };
        }
    }
    public async getPropertyIdAndCodeForLevel0And1(creationId: string) {
        try {
            const propertyCreation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    property: {
                        // where: {
                        //     propertyConfigs: {
                        //         isLoyaltyProgramEnabled: true
                        //     }
                        // },

                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true,
                            propertyConfigs: {
                                select: {
                                    baseCurrency: true,
                                    isLoyaltyProgramEnabled: true,

                                },
                            },
                        },
                    },
                },
            });
            return {
                success: true,
                message: '',
                data: [
                    {
                        id: propertyCreation?.property?.id,
                        code: propertyCreation?.property?.propertyCode,
                        name: propertyCreation?.property?.propertyName,
                        currencyCode: propertyCreation?.property
                            ?.propertyConfigs?.baseCurrency as CurrencyCode,
                        isLoyaltyProgramEnabled: propertyCreation?.property
                    },
                ],
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Unknown error occurred',
                data: [],
            };
        }
    }
    public async getCreationByCreationId(creationId: string) {
        const creation = await prisma.creation.findUnique({
            where: { id: creationId },
            select: { type: true },
        });
        return creation;
    }
}
