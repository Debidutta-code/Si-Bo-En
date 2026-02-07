import { prisma } from "../../../config";
import {
    IAgentAnalyticsData,
    IAgentReservationAnalytics,
    IAgentRevenueAnalytics,
    IAgentGuestAnalytics,
    IAgentBookingSourceAnalytics,
    IAgentPropertyAnalytics,
    IAgentDashboardFilters
} from "../types";

export class AgentDashboardRepository {
   
    public async getAgencyAnalytics(agencyId: string, filters?: IAgentDashboardFilters) {
        try {
            const whereClause: any = {
                agencyId: agencyId,
                bookingSource: 'agency'
            };

            if (filters?.propertyId) {
                whereClause.propertyId = filters.propertyId;
            }

            if (filters?.bookingStatus) {
                whereClause.bookingStatus = filters.bookingStatus;
            }

            if (filters?.startDate || filters?.endDate) {
                whereClause.bookedAt = {};
                if (filters.startDate) {
                    whereClause.bookedAt.gte = filters.startDate;
                }
                if (filters.endDate) {
                    whereClause.bookedAt.lte = filters.endDate;
                }
            }

            const [
                reservationStats,
                revenueStats,
                guestStats,
                bookingSourceStats,
                propertiesBreakdown
            ] = await Promise.all([
                this.getReservationAnalytics(agencyId, whereClause),
                this.getRevenueAnalytics(agencyId, whereClause),
                this.getGuestAnalytics(agencyId, whereClause),
                this.getBookingSourceAnalytics(agencyId, whereClause),
                this.getPropertiesBreakdown(agencyId, whereClause)
            ]);

            const analyticsData: IAgentAnalyticsData = {
                reservation: reservationStats,
                revenue: revenueStats,
                guest: guestStats,
                bookingSource: bookingSourceStats,
                propertiesBreakdown: propertiesBreakdown
            };

            return {
                success: true,
                data: analyticsData
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
                data: null
            };
        }
    }

    private async getReservationAnalytics(
        agencyId: string,
        baseWhereClause: any
    ): Promise<IAgentReservationAnalytics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalReservations,
            statusCounts,
            todayCheckIns,
            todayCheckOuts,
            upcomingReservations,
            recentBookings
        ] = await Promise.all([
            prisma.reservation.count({
                where: baseWhereClause
            }),

            prisma.reservation.groupBy({
                by: ['bookingStatus'],
                where: baseWhereClause,
                _count: {
                    id: true
                }
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhereClause,
                    checkInDate: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhereClause,
                    checkOutDate: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhereClause,
                    checkInDate: {
                        gte: today,
                        lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
                    },
                    bookingStatus: {
                        in: ['confirmed', 'pending']
                    }
                }
            }),

            prisma.reservation.count({
                where: {
                    ...baseWhereClause,
                    bookedAt: {
                        gte: thirtyDaysAgo
                    }
                }
            })
        ]);

        const confirmedReservations = statusCounts.find(s => s.bookingStatus === 'confirmed')?._count.id || 0;
        const pendingReservations = statusCounts.find(s => s.bookingStatus === 'pending')?._count.id || 0;
        const cancelledReservations = statusCounts.find(s => s.bookingStatus === 'cancelled')?._count.id || 0;

        const cancellationRate = totalReservations > 0 
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
            cancellationRate: Number(cancellationRate.toFixed(2))
        };
    }

    private async getRevenueAnalytics(
        agencyId: string,
        baseWhereClause: any
    ): Promise<IAgentRevenueAnalytics> {
        const [
            revenueData,
            paymentMethodBreakdown
        ] = await Promise.all([
            prisma.reservation.aggregate({
                where: baseWhereClause,
                _sum: {
                    amount: true,
                    paidAmount: true,
                    extraAmountToPay: true,
                    refundAmount: true
                },
                _avg: {
                    amount: true
                }
            }),

            prisma.reservation.groupBy({
                by: ['paymentMethod'],
                where: baseWhereClause,
                _sum: {
                    amount: true
                }
            })
        ]);

        const totalRevenue = revenueData._sum.amount || 0;
        const paidAmount = revenueData._sum.paidAmount || 0;
        const pendingAmount = revenueData._sum.extraAmountToPay || 0;
        const refundedAmount = revenueData._sum.refundAmount || 0;
        const averageBookingValue = revenueData._avg.amount || 0;

        const revenueByPaymentMethod = {
            pay_at_hotel: 0,
            net_banking: 0,
            upi: 0,
            payment_gateway: 0
        };

        paymentMethodBreakdown.forEach(pm => {
            const method = pm.paymentMethod as keyof typeof revenueByPaymentMethod;
            if (method in revenueByPaymentMethod) {
                revenueByPaymentMethod[method] = pm._sum.amount || 0;
            }
        });

        return {
            totalRevenue,
            paidAmount,
            pendingAmount,
            refundedAmount,
            averageBookingValue,
            revenueByPaymentMethod
        };
    }

    private async getGuestAnalytics(
        agencyId: string,
        baseWhereClause: any
    ): Promise<IAgentGuestAnalytics> {
        const reservations = await prisma.reservation.findMany({
            where: baseWhereClause,
            select: {
                guests: true,
                bookingUserEmail: true
            }
        });

        let totalGuests = 0;
        let adults = 0;
        let children = 0;
        let infants = 0;
        const guestEmails = new Set<string>();

        reservations.forEach(reservation => {
            const guestsData = reservation.guests as any;
            if (Array.isArray(guestsData)) {
                totalGuests += guestsData.length;
                guestsData.forEach((guest: any) => {
                    if (guest.userType === 'adult') adults++;
                    else if (guest.userType === 'child') children++;
                    else if (guest.userType === 'infant') infants++;
                    
                    if (guest.email) {
                        guestEmails.add(guest.email);
                    }
                });
            }
        });

        const repeatGuests = reservations.length - guestEmails.size;

        return {
            totalGuests,
            adults,
            children,
            infants,
            repeatGuests: repeatGuests > 0 ? repeatGuests : 0
        };
    }

    private async getBookingSourceAnalytics(
        agencyId: string,
        baseWhereClause: any
    ): Promise<IAgentBookingSourceAnalytics> {
        const bookingSources = await prisma.reservation.groupBy({
            by: ['bookingSource'],
            where: baseWhereClause,
            _count: {
                id: true
            }
        });

        const analytics: IAgentBookingSourceAnalytics = {
            direct: 0,
            google: 0,
            trip_adviser: 0,
            trivago: 0,
            social_media: 0,
            agency: 0
        };

        bookingSources.forEach(source => {
            const sourceName = source.bookingSource as keyof IAgentBookingSourceAnalytics;
            if (sourceName in analytics) {
                analytics[sourceName] = source._count.id;
            }
        });

        return analytics;
    }

    private async getPropertiesBreakdown(
        agencyId: string,
        baseWhereClause: any
    ): Promise<IAgentPropertyAnalytics[]> {
        const propertiesData = await prisma.reservation.groupBy({
            by: ['propertyId', 'propertyCode', 'hotelName'],
            where: baseWhereClause,
            _count: {
                id: true
            },
            _sum: {
                amount: true
            },
            _avg: {
                amount: true
            }
        });

        return propertiesData.map(property => ({
            propertyId: property.propertyId,
            propertyName: property.hotelName || 'Unknown',
            propertyCode: property.propertyCode || 'N/A',
            totalReservations: property._count.id,
            totalRevenue: property._sum.amount || 0,
            averageBookingValue: property._avg.amount || 0
        }));
    }

    public async getAgencyProperties(agencyId: string) {
        try {
            const properties = await prisma.agenticProperty.findMany({
                where: {
                    agencyId: agencyId,
                    isActive: true,
                    isDeleted: false
                },
                select: {
                    propertyId: true,
                    propertyCode: true,
                    propertyName: true
                }
            });

            return {
                success: true,
                data: properties
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch properties",
                data: []
            };
        }
    }
}
