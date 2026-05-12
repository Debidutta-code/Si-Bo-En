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
        filters?: IAgentDashboardFilters
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
                this.getRevenueAnalytics(agencyId, agentId, baseWhere),
                this.getGuestAnalytics(baseWhere),
                this.getBookingSourceAnalytics(baseWhere),
                this.getPropertiesBreakdown(agencyId, agentId, baseWhere),
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
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>
    ): Promise<IAgentRevenueAnalytics> {
        const [revenueData, paymentMethodBreakdown, commissionData] =
            await Promise.all([
                prisma.reservation.aggregate({
                    where: baseWhere,
                    _sum: {
                        amount: true,
                        paidAmount: true,
                        extraAmountToPay: true,
                        refundAmount: true,
                    },
                    _avg: { amount: true },
                }),

                prisma.reservation.groupBy({
                    by: ['paymentMethod'],
                    where: baseWhere,
                    _sum: { amount: true },
                    _count: { _all: true },
                }),

                // ── agent's actual commission earned ──
                prisma.agencyCommission.aggregate({
                    where: { agentId, agencyId },
                    _sum: { commissionAmount: true },
                    _avg: { commissionAmount: true },
                }),
            ]);

        const revenueByPaymentMethod: IAgentRevenueAnalytics['revenueByPaymentMethod'] =
            {
                pay_at_hotel: 0,
                net_banking: 0,
                upi: 0,
                payment_gateway: 0,
            };

        paymentMethodBreakdown.forEach(pm => {
            const method =
                pm.paymentMethod as keyof typeof revenueByPaymentMethod;
            if (method in revenueByPaymentMethod) {
                revenueByPaymentMethod[method] = pm._sum?.amount ?? 0;
            }
        });

        return {
            totalRevenue: revenueData._sum?.amount ?? 0,
            paidAmount: revenueData._sum?.paidAmount ?? 0,
            pendingAmount: revenueData._sum?.extraAmountToPay ?? 0,
            refundedAmount: revenueData._sum?.refundAmount ?? 0,
            averageBookingValue: revenueData._avg?.amount ?? 0,
            totalCommissionEarned: commissionData._sum?.commissionAmount ?? 0,
            averageCommissionPerBooking:
                commissionData._avg?.commissionAmount ?? 0,
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
        baseWhere: ReturnType<AgentDashboardRepository['buildBaseWhere']>
    ): Promise<IAgentPropertyAnalytics[]> {
        const [propertiesData, commissionByProperty] = await Promise.all([
            prisma.reservation.groupBy({
                by: ['propertyId', 'propertyCode', 'hotelName'],
                where: baseWhere,
                _count: { _all: true },
                _sum: { amount: true },
                _avg: { amount: true },
            }),

            // ── per-property commission for this agent ──
            prisma.agencyCommission.groupBy({
                by: ['reservationId'],
                where: { agentId, agencyId },
                _sum: { commissionAmount: true },
            }),
        ]);

        // build a map reservationId → commission (for joining)
        // since groupBy gives us per-reservation, we need per-property
        // so instead query commission joined via reservation
        const commissionPerProperty = await prisma.agencyCommission.findMany({
            where: { agentId, agencyId },
            select: {
                commissionAmount: true,
                reservation: { select: { propertyId: true } },
            },
        });

        const commissionMap = new Map<string, number>();
        commissionPerProperty.forEach(c => {
            const pid = c.reservation.propertyId;
            commissionMap.set(
                pid,
                (commissionMap.get(pid) ?? 0) + c.commissionAmount
            );
        });

        return propertiesData.map(p => ({
            propertyId: p.propertyId,
            propertyName: p.hotelName ?? 'Unknown',
            propertyCode: p.propertyCode ?? 'N/A',
            totalReservations: p._count._all,
            totalRevenue: p._sum?.amount ?? 0,
            averageBookingValue: p._avg?.amount ?? 0,
            totalCommission: commissionMap.get(p.propertyId) ?? 0,
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
