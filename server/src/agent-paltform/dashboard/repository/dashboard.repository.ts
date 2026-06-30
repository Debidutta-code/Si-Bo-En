import { prisma } from '../../../config';
import {
    IAgentAnalyticsData,
    IAgentReservationAnalytics,
    IAgentRevenueAnalytics,
    IAgentGuestAnalytics,
    IAgentBookingSourceAnalytics,
    IAgentPropertyAnalytics,
    IAgentDashboardFilters,
    IStoredGuest,
    IAgencyProperty,
} from '../types';
import { BookingStatus } from '../../../reservation/types/reservation.type';
import { CurrencyCode } from '../../../tax-system/interfaces';
import { convertCurrency, getCurrencyConverter } from '../../../currency-maping/utils';

interface IAnalyticsSuccess {
    success: true;
    data: IAgentAnalyticsData;
}
interface IAnalyticsError {
    success: false;
    message: string;
    data: null;
}
interface IPropertiesSuccess {
    success: true;
    data: IAgencyProperty[];
}
interface IPropertiesError {
    success: false;
    message: string;
    data: never[];
}

export class AgentDashboardRepository {
    private buildBaseWhere(
        agencyId: string,
        agentId: string,
        filters?: IAgentDashboardFilters
    ) {
        return {
            agencyId,
            AgencyCommission: { is: { agentId } },
            ...(filters?.propertyId && { propertyId: filters.propertyId }),
            ...(filters?.bookingStatus && {
                bookingStatus: filters.bookingStatus as BookingStatus,
            }),
            ...((filters?.startDate || filters?.endDate) && {
                bookedAt: {
                    ...(filters.startDate && { gte: filters.startDate }),
                    ...(filters.endDate && { lte: filters.endDate }),
                },
            }),
        };
    }

    public async getAgencyAnalytics(
        agencyId: string,
        agentId: string,
        targetCurrency: CurrencyCode,
        filters?: IAgentDashboardFilters,
    ): Promise<IAnalyticsSuccess | IAnalyticsError> {
        try {
            const baseWhere = this.buildBaseWhere(agencyId, agentId, filters);

            const [
                reservationStats,
                revenueStats,
                guestStats,
                bookingSourceStats,
                propertiesBreakdown,
            ] = await Promise.all([
                this.getReservationAnalytics(baseWhere),
                this.getRevenueAnalytics(agencyId, agentId, baseWhere, targetCurrency),
                this.getGuestAnalytics(baseWhere),
                this.getBookingSourceAnalytics(baseWhere),
                this.getPropertiesBreakdown(agencyId, agentId, baseWhere, targetCurrency),
            ]);

            return {
                success: true,
                data: {
                    reservation: reservationStats,
                    revenue: revenueStats,
                    guest: guestStats,
                    bookingSource: bookingSourceStats,
                    propertiesBreakdown,
                },
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

    private async getReservationAnalytics(
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>
    ): Promise<IAgentReservationAnalytics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const ago30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalReservations,
            statusCounts,
            todayCheckIns,
            todayCheckOuts,
            upcomingReservations,
            recentBookings,
        ] = await Promise.all([
            prisma.reservation.count({ where: baseWhere }),

            prisma.reservation.groupBy({
                by: ['bookingStatus'],
                where: baseWhere,
                _count: { _all: true },
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhere,
                    reservationStartDate: { gte: today, lt: tomorrow },
                },
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhere,
                    reservationEndDate: { gte: today, lt: tomorrow },
                },
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhere,
                    reservationStartDate: { gte: today, lte: in30Days },
                    bookingStatus: { in: ['confirmed', 'pending'] },
                },
            }),

            prisma.reservation.count({
                where: { ...baseWhere, bookedAt: { gte: ago30Days } },
            }),
        ]);

        const confirmedReservations =
            statusCounts.find(s => s.bookingStatus === 'confirmed')?._count
                ._all ?? 0;
        const pendingReservations =
            statusCounts.find(s => s.bookingStatus === 'pending')?._count
                ._all ?? 0;
        const cancelledReservations =
            statusCounts.find(s => s.bookingStatus === 'cancelled')?._count
                ._all ?? 0;

        const cancellationRate =
            totalReservations > 0
                ? (cancelledReservations / totalReservations) * 100
                : 0;

        return {
            totalReservations,
            confirmedReservations,
            pendingReservations,
            cancelledReservations,
            todayCheckIns,
            todayCheckOuts,
            upcomingReservations,
            recentBookings,
            cancellationRate: Number(cancellationRate.toFixed(2)),
        };
    }

    private async getRevenueAnalytics(
        agencyId: string,
        agentId: string,
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>,
        targetCurrency: CurrencyCode
    ): Promise<IAgentRevenueAnalytics> {

        const [reservations, commissionData] = await Promise.all([
            prisma.reservation.findMany({
                where: baseWhere,
                select: {
                    amount: true,
                    paidAmount: true,
                    extraAmountToPay: true,
                    refundAmount: true,
                    currencyCode: true,
                    paymentMethod: true,
                },
            }),
            prisma.agencyCommission.aggregate({
                where: { agentId, agencyId },
                _sum: { commissionAmount: true },
                _avg: { commissionAmount: true },
            }),
        ]);

        let totalRevenue = 0;
        let paidAmount = 0;
        let pendingAmount = 0;
        let refundedAmount = 0;
        const revenueByPaymentMethod = {
            pay_at_hotel: 0,
            net_banking: 0,
            upi: 0,
            payment_gateway: 0,
        };

        await Promise.all(
            reservations.map(async (r) => {
                try {
                    const from = r.currencyCode as CurrencyCode;
                    const to = targetCurrency as CurrencyCode;

                    const [
                        convertedAmount,
                        convertedPaid,
                        convertedPending,
                        convertedRefund,
                    ] = await Promise.all([
                        convertCurrency(r.amount, from, to),
                        convertCurrency(r.paidAmount, from, to),
                        convertCurrency(r.extraAmountToPay, from, to),
                        convertCurrency(r.refundAmount, from, to),
                    ]);

                    totalRevenue += convertedAmount;
                    paidAmount += convertedPaid;
                    pendingAmount += convertedPending;
                    refundedAmount += convertedRefund;

                    const method = r.paymentMethod as keyof typeof revenueByPaymentMethod;
                    if (method in revenueByPaymentMethod) {
                        revenueByPaymentMethod[method] += convertedAmount;
                    }
                } catch {
                    // fallback if rate not in Redis — add raw
                    totalRevenue += r.amount;
                    paidAmount += r.paidAmount;
                    pendingAmount += r.extraAmountToPay;
                    refundedAmount += r.refundAmount;

                    const method = r.paymentMethod as keyof typeof revenueByPaymentMethod;
                    if (method in revenueByPaymentMethod) {
                        revenueByPaymentMethod[method] += r.amount;
                    }
                }
            })
        );

        // Commission is always stored in USD per your AgencyCommission table
        const rawCommission = commissionData._sum?.commissionAmount ?? 0;
        const rawAvgCommission = commissionData._avg?.commissionAmount ?? 0;

        const [totalCommissionEarned, averageCommissionPerBooking] = await Promise.all([
            convertCurrency(rawCommission, 'USD', targetCurrency as CurrencyCode),
            convertCurrency(rawAvgCommission, 'USD', targetCurrency as CurrencyCode),
        ]).catch(() => [rawCommission, rawAvgCommission]);

        return {
            totalRevenue,
            paidAmount,
            pendingAmount,
            refundedAmount,
            averageBookingValue: reservations.length > 0
                ? Math.round((totalRevenue / reservations.length) * 100) / 100
                : 0,
            totalCommissionEarned,
            averageCommissionPerBooking,
            revenueByPaymentMethod,
        };
    }

    private async getGuestAnalytics(
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>
    ): Promise<IAgentGuestAnalytics> {
        const reservations = await prisma.reservation.findMany({
            where: baseWhere,
            select: { guests: true, bookingUserEmail: true },
        });

        let totalGuests = 0;
        let adults = 0;
        let children = 0;
        let infants = 0;
        const guestEmails = new Set<string>();

        reservations.forEach(reservation => {
            const raw = reservation.guests;
            if (!Array.isArray(raw)) return;

            const guestsData = raw as IStoredGuest[];
            totalGuests += guestsData.length;

            guestsData.forEach(guest => {
                const guestType = guest.type ?? guest.userType ?? '';
                if (guestType === 'adult') adults++;
                else if (guestType === 'child') children++;
                else if (guestType === 'infant') infants++;
                if (guest.email) guestEmails.add(guest.email);
            });
        });

        return {
            totalGuests,
            adults,
            children,
            infants,
            repeatGuests: Math.max(0, reservations.length - guestEmails.size),
        };
    }

    private async getBookingSourceAnalytics(
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>
    ): Promise<IAgentBookingSourceAnalytics> {
        const bookingSources = await prisma.reservation.groupBy({
            by: ['bookingSource'],
            where: baseWhere,
            _count: { _all: true },
        });

        const analytics: IAgentBookingSourceAnalytics = {
            direct: 0,
            google: 0,
            trip_adviser: 0,
            trivago: 0,
            social_media: 0,
            agency: 0,
        };

        bookingSources.forEach(source => {
            const key =
                source.bookingSource as keyof IAgentBookingSourceAnalytics;
            if (key in analytics) analytics[key] = source._count._all;
        });

        return analytics;
    }

    private async getPropertiesBreakdown(
        agencyId: string,
        agentId: string,
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>,
        targetCurrency: CurrencyCode
    ): Promise<IAgentPropertyAnalytics[]> {

        const [reservations, commissionPerProperty] = await Promise.all([
            prisma.reservation.findMany({
                where: baseWhere,
                select: {
                    propertyId: true,
                    amount: true,
                    currencyCode: true,
                    property: {               // join to the actual property
                        select: {
                            propertyCode: true,
                            propertyName: true,   // use the real name from property table
                        },
                    },
                },
            }),
            prisma.agencyCommission.findMany({
                where: { agentId, agencyId },
                select: {
                    commissionAmount: true,
                    currencyCode: true,
                    reservation: { select: { propertyId: true } },
                },
            }),
        ]);

        // Convert all reservation amounts concurrently, then group synchronously
        const convertedReservations = await Promise.all(
            reservations.map(async (r) => {
                let convertedAmount = r.amount;
                try {
                    convertedAmount = await convertCurrency(
                        r.amount,
                        r.currencyCode as CurrencyCode,
                        targetCurrency as CurrencyCode
                    );
                } catch { /* use raw on failure */ }
                return { ...r, convertedAmount };
            })
        );

        const propertyMap = new Map<string, {
            propertyCode: string;
            hotelName: string;
            totalRevenue: number;
            count: number;
        }>();

        for (const r of convertedReservations) {
            const existing = propertyMap.get(r.propertyId);
            if (existing) {
                existing.totalRevenue += r.convertedAmount;
                existing.count += 1;
            } else {
                propertyMap.set(r.propertyId, {
                    propertyCode: r.property.propertyCode ?? 'N/A',
                    hotelName: r.property.propertyName ?? 'Unknown',
                    totalRevenue: r.convertedAmount,
                    count: 1,
                });
            }
        }

        // Convert all commission amounts concurrently, then group synchronously
        const convertedCommissions = await Promise.all(
            commissionPerProperty.map(async (c) => {
                let convertedAmount = c.commissionAmount;
                try {
                    convertedAmount = await convertCurrency(
                        c.commissionAmount,
                        c.currencyCode as CurrencyCode,
                        targetCurrency as CurrencyCode
                    );
                } catch { /* use raw on failure */ }
                return { propertyId: c.reservation.propertyId, convertedAmount };
            })
        );

        const commissionMap = new Map<string, number>();

        for (const c of convertedCommissions) {
            commissionMap.set(c.propertyId, (commissionMap.get(c.propertyId) ?? 0) + c.convertedAmount);
        }

        return Array.from(propertyMap.entries()).map(([propertyId, data]) => ({
            propertyId,
            propertyName: data.hotelName,
            propertyCode: data.propertyCode,
            totalReservations: data.count,
            totalRevenue: data.totalRevenue,
            averageBookingValue: data.count > 0
                ? Math.round((data.totalRevenue / data.count) * 100) / 100
                : 0,
            totalCommission: commissionMap.get(propertyId) ?? 0,
        }));
    }

    public async getAgencyProperties(
        agencyId: string
    ): Promise<IPropertiesSuccess | IPropertiesError> {
        try {
            const properties = await prisma.agenticProperty.findMany({
                where: { agencyId, isActive: true, isDeleted: false },
                select: {
                    propertyId: true,
                    propertyCode: true,
                    propertyName: true,
                },
            });
            return { success: true, data: properties };
        } catch (error) {
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch properties',
                data: [],
            };
        }
    }
}