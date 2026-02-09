import { prisma } from "../../config";
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
    IComparisonPeriod
} from "../types";

export class DashBoardRepository {
    /**
     * Get comprehensive analytics data for given properties
     */
    public async getAnalyticsData(propertyIdsAndCodes: IPropertyCodeAndIds[], userLevel?: number) {
        try {
            const propertyIds = propertyIdsAndCodes.map(p => p.id);
            const propertyCodes = propertyIdsAndCodes.map(p => p.code);

            // Parallel fetch all analytics data
            const [
                reservationStats,
                revenueStats,
                // roomStats,
                guestStats,
                addonStats,
                bookingSourceStats,
                paymentMethodStats
            ] = await Promise.all([
                this.getReservationAnalytics(propertyIds),
                this.getRevenueAnalytics(propertyIds),
                // this.getRoomAnalytics(propertyIds),
                this.getGuestAnalytics(propertyIds),
                this.getAddonAnalytics(propertyIds),
                this.getBookingSourceAnalytics(propertyIds),
                this.getPaymentMethodAnalytics(propertyIds)
            ]);

            // Fetch top performing properties analytics for users with level > 1
            let topPropertiesStats: ITopPerformingProperties | undefined;
            if (userLevel && userLevel > 1) {
                topPropertiesStats = await this.getTopPerformingProperties(propertyIdsAndCodes);
            }

            const analyticsData: IAnalyticsData = {
                reservation: reservationStats,
                revenue: revenueStats,
                // room: roomStats,
                guest: guestStats,
                addon: addonStats,
                bookingSource: bookingSourceStats,
                paymentMethod: paymentMethodStats
            };

            if (topPropertiesStats) {
                analyticsData.topPerformingProperties = topPropertiesStats;
            }

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

    /**
     * Reservation & Booking Analytics
     */
    private async getReservationAnalytics(propertyIds: string[]): Promise<IReservationAnalytics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalReservations,
            reservations,
            todayCheckIns,
            todayCheckOuts,
            upcomingReservations,
            recentBookings
        ] = await Promise.all([
            // Total reservations
            prisma.reservation.count({
                where: { propertyId: { in: propertyIds } }
            }),
            // Get all reservations with status info
            prisma.reservation.findMany({
                where: { propertyId: { in: propertyIds } },
                select: {
                    bookingStatus: true,
                    checkInDate: true,
                    checkOutDate: true,
                    guests: true
                }
            }),
            // Today's check-ins
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    checkInDate: { gte: today, lt: tomorrow }
                }
            }),
            // Today's check-outs
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    checkOutDate: { gte: today, lt: tomorrow }
                }
            }),
            // Upcoming reservations (next 7 days)
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    checkInDate: { gte: today, lte: nextWeek }
                }
            }),
            // Last 30 days bookings
            prisma.reservation.count({
                where: {
                    propertyId: { in: propertyIds },
                    createdAt: { gte: thirtyDaysAgo }
                }
            })
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

        const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
            status,
            count
        }));

        const cancellationRate = totalReservations > 0 ? (cancelled / totalReservations) * 100 : 0;

        // Calculate additional metrics
        let totalStayDays = 0;
        let totalGuests = 0;

        reservations.forEach(reservation => {
            const checkIn = new Date(reservation.checkInDate);
            const checkOut = new Date(reservation.checkOutDate);
            const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
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

        const averageStayDuration = totalReservations > 0 ? (totalStayDays / totalReservations).toFixed(2) : '0';
        const averageGuestsPerBooking = totalReservations > 0 ? (totalGuests / totalReservations).toFixed(2) : '0';

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
            last30DaysBookings: recentBookings
        };
    }

    /**
     * Revenue Analytics - Based on Reservation amounts
     */
    private async getRevenueAnalytics(propertyIds: string[]): Promise<IRevenueAnalytics> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisWeekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const [
            totalRevenue,
            todayRevenue,
            weekRevenue,
            monthRevenue,
            lastMonthRevenue,
            avgRevenuePerBooking
        ] = await Promise.all([
            // Total revenue (confirmed bookings)
            prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed'
                },
                _sum: { amount: true }
            }),
            // Today's revenue
            prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed',
                    createdAt: { gte: today }
                },
                _sum: { amount: true }
            }),
            // This week's revenue
            prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed',
                    createdAt: { gte: thisWeekStart }
                },
                _sum: { amount: true }
            }),
            // This month's revenue
            prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed',
                    createdAt: { gte: thisMonthStart }
                },
                _sum: { amount: true }
            }),
            // Last month's revenue
            prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed',
                    createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
                },
                _sum: { amount: true }
            }),
            // Average revenue per booking
            prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed'
                },
                _avg: { amount: true }
            })
        ]);

        // Payment status breakdown based on booking status
        const paymentStatusBreakdown = await prisma.reservation.groupBy({
            by: ['bookingStatus'],
            where: { propertyId: { in: propertyIds } },
            _sum: { amount: true, paidAmount: true },
            _count: true
        });

        // Get pending payments
        const pendingPayments = await prisma.reservation.aggregate({
            where: {
                propertyId: { in: propertyIds },
                bookingStatus: 'pending'
            },
            _sum: { extraAmountToPay: true },
            _count: true
        });

        const thisMonthAmount = monthRevenue._sum.amount || 0;
        const lastMonthAmount = lastMonthRevenue._sum.amount || 0;
        const monthOverMonthGrowth = lastMonthAmount > 0
            ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100).toFixed(2)
            : '0';

        // Get total rooms for RevPAR calculation
        const totalRooms = await prisma.room.aggregate({
            where: { propertyId: { in: propertyIds } },
            _sum: { totalRoom: true }
        });

        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const totalRoomCount = totalRooms._sum.totalRoom || 0;
        const revPAR = totalRoomCount > 0 && daysInMonth > 0
            ? thisMonthAmount / (totalRoomCount * daysInMonth)
            : 0;

        // Get last 7 days revenue trend
        const last7DaysTrend = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date(today);
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const dayRevenue = await prisma.reservation.aggregate({
                where: {
                    propertyId: { in: propertyIds },
                    bookingStatus: 'confirmed',
                    createdAt: { gte: dayStart, lte: dayEnd }
                },
                _sum: { amount: true }
            });

            last7DaysTrend.push({
                date: dayStart.toISOString().split('T')[0],
                revenue: dayRevenue._sum.amount || 0
            });
        }

        return {
            totalRevenue: totalRevenue._sum.amount || 0,
            todayRevenue: todayRevenue._sum.amount || 0,
            weekRevenue: weekRevenue._sum.amount || 0,
            monthRevenue: thisMonthAmount,
            lastMonthRevenue: lastMonthAmount,
            monthOverMonthGrowth,
            revPAR: Number(revPAR.toFixed(2)),
            paymentStatusBreakdown: paymentStatusBreakdown.map(p => ({
                status: p.bookingStatus,
                amount: p._sum.amount || 0,
                count: p._count
            })),
            averageRevenuePerBooking: avgRevenuePerBooking._avg.amount || 0,
            pendingPayments: {
                amount: pendingPayments._sum.extraAmountToPay || 0,
                count: pendingPayments._count
            },
            last7DaysTrend
        };
    }

    /**
     * Room Analytics - Based on Room types and Inventory
     */
    // private async getRoomAnalytics(propertyIds: string[]): Promise<IRoomAnalytics> {
    //     const [roomTypeStats, inventoryData] = await Promise.all([
    //         // Room type statistics
    //         prisma.room.findMany({
    //             where: { propertyId: { in: propertyIds } },
    //             select: {
    //                 roomType: true,
    //                 roomName: true,
    //                 totalRoom: true
    //             }
    //         }),
    //         // Get current inventory availability
    //         prisma.inventory.findMany({
    //             where: {
    //                 propertyCode: { in: propertyIds },
    //                 date: new Date().toISOString().split('T')[0]
    //             }
    //         })
    //     ]);

    //     const totalRooms = roomTypeStats.reduce((sum, room) => sum + room.totalRoom, 0);
    //     const totalAvailable = inventoryData.reduce((sum, inv) => sum + inv.availability, 0);
    //     const occupiedRooms = Math.max(0, totalRooms - totalAvailable);
    //     const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    //     // Room type occupancy
    //     const roomTypeOccupancy = roomTypeStats.map(roomType => {
    //         const inventory = inventoryData.find(inv => inv.roomTypeCode === roomType.roomType);
    //         const available = inventory?.availability || roomType.totalRoom;
    //         const occupied = roomType.totalRoom - available;
    //         const occupancyRateForType = roomType.totalRoom > 0
    //             ? (occupied / roomType.totalRoom * 100).toFixed(2)
    //             : '0';

    //         return {
    //             roomType: roomType.roomType,
    //             roomName: roomType.roomName,
    //             totalRooms: roomType.totalRoom,
    //             occupiedRooms: occupied,
    //             availableRooms: available,
    //             occupancyRate: occupancyRateForType
    //         };
    //     });

    //     // Get reserved rooms from today's reservations
    //     const today = new Date();
    //     today.setHours(0, 0, 0, 0);
    //     const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    //     const reservedRooms = await prisma.reservation.count({
    //         where: {
    //             propertyId: { in: propertyIds },
    //             checkInDate: { gte: today, lt: tomorrow },
    //             bookingStatus: 'confirmed'
    //         }
    //     });

    //     const checkedInRooms = await prisma.reservation.count({
    //         where: {
    //             propertyId: { in: propertyIds },
    //             checkInDate: { lt: today },
    //             checkOutDate: { gte: today },
    //             bookingStatus: 'confirmed'
    //         }
    //     });

    //     return {
    //         totalRooms,
    //         occupiedRooms,
    //         availableRooms: totalAvailable,
    //         dirtyRooms: 0, // No longer tracked
    //         reservedRooms,
    //         checkedInRooms,
    //         tentativeRooms: 0, // No longer tracked
    //         occupancyRate: occupancyRate.toFixed(2),
    //         roomStatusBreakdown: [
    //             { status: 'available', count: totalAvailable },
    //             { status: 'occupied', count: occupiedRooms }
    //         ],
    //         roomTypeStats,
    //         roomTypeOccupancy
    //     };
    // }

    // Add this method to your DashBoardRepository class

public async getStatisticsComparison(
  propertyIds: string[],
  comparisonType: 'date' | 'month' | 'year',
  selectedDate: Date
): Promise<IStatisticsComparison> {
  // Calculate date ranges based on comparison type
  const periods = this.calculateComparisonPeriods(comparisonType, selectedDate);
  
  // Fetch data for both periods in parallel
  const [currentPeriodData, previousPeriodData] = await Promise.all([
    this.getStatisticsForPeriod(propertyIds, periods.current.start, periods.current.end),
    this.getStatisticsForPeriod(propertyIds, periods.previous.start, periods.previous.end)
  ]);
  
  // Calculate percentage changes
  return {
    bookings: this.calculateChange(currentPeriodData.bookings, previousPeriodData.bookings),
    cancelledBookings: this.calculateChange(currentPeriodData.cancelledBookings, previousPeriodData.cancelledBookings),
    revenue: this.calculateChange(currentPeriodData.revenue, previousPeriodData.revenue),
    averageBookingValue: this.calculateChange(currentPeriodData.averageBookingValue, previousPeriodData.averageBookingValue),
    roomNights: this.calculateChange(currentPeriodData.roomNights, previousPeriodData.roomNights),
    period: periods
  };
}

private calculateComparisonPeriods(type: 'date' | 'month' | 'year', selectedDate: Date): IComparisonPeriod {
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
    current.start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    current.end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
    current.label = current.start.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    previous.start = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    previous.end = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 0, 23, 59, 59, 999);
    previous.label = previous.start.toLocaleString('default', { month: 'long', year: 'numeric' });
  } else {
    // 12 months ending in selected month vs previous 12 months
    current.end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);
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

private async getStatisticsForPeriod(propertyIds: string[], startDate: Date, endDate: Date) {
  const [bookingsData, revenueData, roomNightsData] = await Promise.all([
    // Get bookings count and cancelled bookings
    prisma.reservation.findMany({
      where: {
        propertyId: { in: propertyIds },
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        bookingStatus: true,
        amount: true,
        checkInDate: true,
        checkOutDate: true
      }
    }),
    // Get confirmed revenue
    prisma.reservation.aggregate({
      where: {
        propertyId: { in: propertyIds },
        bookingStatus: 'confirmed', // ✅ correct
        createdAt: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      _count: true
    }),
    // Calculate room nights - only for confirmed bookings
    prisma.reservation.findMany({
      where: {
        propertyId: { in: propertyIds },
        bookingStatus: 'confirmed', // ✅ Changed: only confirmed bookings have room nights
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        checkInDate: true,
        checkOutDate: true
      }
    })
  ]);
  
  const totalBookings = bookingsData.length;
  const cancelledBookings = bookingsData.filter(b => b.bookingStatus === 'cancelled').length; // ✅ correct
  const revenue = revenueData._sum.amount || 0;
  const confirmedBookings = revenueData._count;
  const averageBookingValue = confirmedBookings > 0 ? revenue / confirmedBookings : 0;
  
  // Calculate total room nights
  const roomNights = roomNightsData.reduce((total, booking) => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return total + nights;
  }, 0);
  
  return {
    bookings: totalBookings,
    cancelledBookings,
    revenue,
    averageBookingValue,
    roomNights
  };
}

private calculateChange(current: number, previous: number) {
  const percentageChange = previous > 0 
    ? ((current - previous) / previous) * 100 
    : current > 0 ? 100 : 0;
    
  return {
    current,
    previous,
    percentageChange: Number(percentageChange.toFixed(2))
  };
}
    /**
     * Guest Analytics
     */
    private async getGuestAnalytics(propertyIds: string[]): Promise<IGuestAnalytics> {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalGuests,
            guestTypeBreakdown,
            repeatGuests,
            countryBreakdown,
            recentGuests,
            verifiedGuests
        ] = await Promise.all([
            prisma.guests.count({
                where: { propertyId: { in: propertyIds } }
            }),
            prisma.guests.groupBy({
                by: ['userType'],
                where: { propertyId: { in: propertyIds } },
                _count: true
            }),
            prisma.guests.groupBy({
                by: ['email'],
                where: {
                    propertyId: { in: propertyIds },
                    email: { not: null }
                },
                _count: true,
                having: { email: { _count: { gt: 1 } } }
            }),
            prisma.guests.groupBy({
                by: ['country'],
                where: {
                    propertyId: { in: propertyIds },
                    country: { not: null }
                },
                _count: true,
                orderBy: { _count: { country: 'desc' } },
                take: 10
            }),
            prisma.guests.count({
                where: {
                    propertyId: { in: propertyIds },
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            prisma.guests.count({
                where: {
                    propertyId: { in: propertyIds },
                    identityCardNumber: { not: null }
                }
            })
        ]);

        return {
            totalGuests,
            guestTypeBreakdown: guestTypeBreakdown.map(g => ({ type: g.userType, count: g._count })),
            repeatGuestsCount: repeatGuests.length,
            repeatGuestRate: totalGuests > 0 ? ((repeatGuests.length / totalGuests) * 100).toFixed(2) : '0',
            topCountries: countryBreakdown.map(c => ({ country: c.country || 'Unknown', count: c._count })),
            recentGuests,
            verifiedGuests,
            verificationRate: totalGuests > 0 ? ((verifiedGuests / totalGuests) * 100).toFixed(2) : '0'
        };
    }

    /**
     * Add-on Analytics
     */
    private async getAddonAnalytics(propertyIds: string[]): Promise<IAddonAnalytics> {
        const [totalAddonRevenue, popularAddons, addonCount] = await Promise.all([
            prisma.bookingAddon.aggregate({
                where: {
                    Reservation: {
                        propertyId: { in: propertyIds }
                    }
                },
                _sum: { totalPrice: true }
            }),
            prisma.bookingAddon.groupBy({
                by: ['addonId','name'],
                where: {
                    Reservation: {
                        propertyId: { in: propertyIds }
                    }
                },
                _sum: { totalPrice: true },
                _count: true,
                orderBy: { _count: { addonId: 'desc' } },
                take: 5
            }),
            prisma.bookingAddon.count({
                where: {
                    Reservation: {
                        propertyId: { in: propertyIds }
                    }
                }
            })
        ]);

        return {
            totalAddonRevenue: totalAddonRevenue._sum.totalPrice || 0,
            addonCount,
            popularAddons: popularAddons.map(a => ({
                addonId: a.addonId,
                addonName:a.name,
                revenue: a._sum.totalPrice || 0,
                bookingCount: a._count
            }))
        };
    }

    /**
     * Booking Source Analytics
     */
    
    private async getBookingSourceAnalytics(propertyIds: string[]): Promise<IBookingSourceAnalytics> {
        const sourceBreakdown = await prisma.reservation.groupBy({
            by: ['bookingSource'],
            where: {
                propertyId: { in: propertyIds }
            },
            _count: true,
            _sum: { amount: true }
        });

        return {
            sourceBreakdown: sourceBreakdown.map(s => ({
                source: s.bookingSource,
                count: s._count,
                revenue: s._sum.amount || 0
            }))
        };
    }

    /**
     * Payment Method Analytics
     */
    private async getPaymentMethodAnalytics(propertyIds: string[]): Promise<IPaymentMethodAnalytics> {
        const methodBreakdown = await prisma.reservation.groupBy({
            by: ['paymentMethod'],
            where: {
                propertyId: { in: propertyIds },
                bookingStatus: 'confirmed'
            },
            _sum: { paidAmount: true },
            _count: true
        });

        return {
            methodBreakdown: methodBreakdown.map(m => ({
                method: m.paymentMethod,
                amount: m._sum.paidAmount || 0,
                count: m._count
            }))
        };
    }

    /**
     * Top Performing Properties Analytics
     */
   private async getTopPerformingProperties(propertyIdsAndCodes: IPropertyCodeAndIds[]): Promise<ITopPerformingProperties> {
    try {
        const propertyIds = propertyIdsAndCodes.map(p => p.id);
        
        // ✅ FIX: Create proper date for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Revenue by property
        const revenueByProperty = await prisma.reservation.groupBy({
            by: ['propertyId'],
            where: {
                propertyId: { in: propertyIds },
                bookingStatus: 'confirmed'
            },
            _sum: { amount: true }
        });

        // Bookings by property
        const bookingsByProperty = await prisma.reservation.groupBy({
            by: ['propertyId'],
            where: {
                propertyId: { in: propertyIds }
            },
            _count: true
        });

        // Occupancy by property
        const roomsByProperty = await prisma.room.groupBy({
            by: ['propertyId'],
            where: {
                propertyId: { in: propertyIds }
            },
            _sum: { totalRoom: true }
        });

        // ✅ FIX: Use Date object instead of string
        const inventoryByProperty = await prisma.inventory.groupBy({
            by: ['propertyCode'],
            where: {
                propertyCode: { in: propertyIdsAndCodes.map(p => p.code) },
                date: today  // ✅ Changed from string to Date
            },
            _sum: { availability: true }
        });

        // Create property map
        const propertyMap = new Map(propertyIdsAndCodes.map(p => [p.id, p]));

        // Top by revenue
        const topByRevenue = revenueByProperty
            .map(r => {
                const prop = propertyMap.get(r.propertyId);
                return {
                    propertyId: r.propertyId,
                    propertyCode: prop?.code || '',
                    propertyName: prop?.name || '',
                    totalRevenue: r._sum.amount || 0
                };
            })
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);

        // Top by bookings
        const topByBookings = bookingsByProperty
            .map(b => {
                const prop = propertyMap.get(b.propertyId);
                return {
                    propertyId: b.propertyId,
                    propertyCode: prop?.code || '',
                    propertyName: prop?.name || '',
                    totalBookings: b._count
                };
            })
            .sort((a, b) => b.totalBookings - a.totalBookings)
            .slice(0, 5);

        // Top by occupancy
        const topByOccupancy = roomsByProperty
            .map(r => {
                const prop = propertyMap.get(r.propertyId);
                const inventory = inventoryByProperty.find(i => i.propertyCode === prop?.code);
                const totalRooms = r._sum.totalRoom || 0;
                const available = inventory?._sum.availability || totalRooms;
                const occupied = totalRooms - available;
                const occupancyRate = totalRooms > 0 ? (occupied / totalRooms) * 100 : 0;

                return {
                    propertyId: r.propertyId,
                    propertyCode: prop?.code || '',
                    propertyName: prop?.name || '',
                    occupancyRate: Number(occupancyRate.toFixed(2)),
                    totalRooms,
                    occupiedRooms: occupied
                };
            })
            .sort((a, b) => b.occupancyRate - a.occupancyRate)
            .slice(0, 5);

        return {
            topByRevenue,
            topByBookings,
            topByOccupancy
        };
    } catch (error) {
        console.error("Error in getTopPerformingProperties:", error); // ✅ Added logging
        return {
            topByRevenue: [],
            topByBookings: [],
            topByOccupancy: []
        };
    }
}
}

export class DashUtilsRepo {
    public async getPropertyIdsAndCodesForLevel4(creationId: string) {
        try {
            const propertyData: Array<{ id: string; code: string, name: string }> = [];

            const level4Creation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    // Direct property (if level4 somehow has a direct property)
                    property: {
                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true
                        }
                    },
                    // Everything under super (level 4) is in superChildren
                    superChildren: {
                        where: {
                            isActive: true,
                            isDeleted: false,
                        },
                        include: {
                            property: {
                                select: {
                                    id: true,
                                    propertyCode: true,
                                    propertyName: true

                                }
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
                                            propertyName: true
                                        }
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
                                                    propertyName: true
                                                }
                                            },
                                            // Level 1 properties
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
                                                            propertyName: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!level4Creation) {
                return {
                    success: false,
                    message: "Creation not found or inactive",
                    data: []
                };
            }
            // Collect property from level 4 itself (if exists)
            if (level4Creation.property) {
                propertyData.push({
                    id: level4Creation.property.id,
                    code: level4Creation.property.propertyCode,
                    name: level4Creation.property.propertyName
                });
            }

            // Traverse superChildren (everything under super/level 4)
            for (const superChild of level4Creation.superChildren) {
                // Collect property from this super child (could be group/brand/property)
                if (superChild.property) {
                    propertyData.push({
                        id: superChild.property.id,
                        code: superChild.property.propertyCode,
                        name: superChild.property.propertyName
                    });
                }

                // Traverse groupChildren (everything under group/level 3)
                for (const groupChild of superChild.groupChildren) {
                    // Collect property from this group child
                    if (groupChild.property) {
                        propertyData.push({
                            id: groupChild.property.id,
                            code: groupChild.property.propertyCode,
                            name: groupChild.property.propertyName
                        });
                    }

                    // Traverse brandChildren (everything under brand/level 2)
                    for (const brandChild of groupChild.brandChildren) {
                        // Collect property from this brand child
                        if (brandChild.property) {
                            propertyData.push({
                                id: brandChild.property.id,
                                code: brandChild.property.propertyCode,
                                name: brandChild.property.propertyName
                            });
                        }

                        // Traverse level 1 properties under brand
                        for (const level1 of brandChild.groupChildren) {
                            if (level1.property) {
                                propertyData.push({
                                    id: level1.property.id,
                                    code: level1.property.propertyCode,
                                    name: level1.property.propertyName
                                });
                            }
                        }
                    }
                }
            }

            return {
                success: true,
                message: "Properties fetched successfully",
                data: propertyData,
                count: propertyData.length
            };

        } catch (error) {
            console.error("Error fetching properties for level 4:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
                data: []
            };
        }
    }
    public async getPropertyIdsAndCodesForLevel3(creationId: string) {
        try {
            const propertyData: Array<{ id: string; code: string; name: string }> = [];

            const level3Creation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    property: {
                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true

                        }
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
                                    propertyName: true
                                }
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
                                            propertyName: true
                                        }
                                    },
                                    // Level 1 properties
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
                                                    propertyName: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
            });

            if (!level3Creation) {
                return {
                    success: false,
                    message: "Creation not found or inactive",
                    data: []
                };
            }
            // Collect property from level 3 itself (if exists)
            if (level3Creation.property) {
                propertyData.push({
                    id: level3Creation.property.id,
                    code: level3Creation.property.propertyCode,
                    name: level3Creation.property.propertyName
                });
            }

            // Traverse groupChildren (everything under group/level 3)
            for (const groupChild of level3Creation.groupChildren) {
                // Collect property from this group child
                if (groupChild.property) {
                    propertyData.push({
                        id: groupChild.property.id,
                        code: groupChild.property.propertyCode,
                        name: groupChild.property.propertyName
                    });
                }

                // Traverse brandChildren (everything under brand/level 2)
                for (const brandChild of groupChild.brandChildren) {
                    // Collect property from this brand child
                    if (brandChild.property) {
                        propertyData.push({
                            id: brandChild.property.id,
                            code: brandChild.property.propertyCode,
                            name: brandChild.property.propertyName
                        });
                    }

                    // Traverse level 1 properties under brand
                    for (const level1 of brandChild.groupChildren) {
                        if (level1.property) {
                            propertyData.push({
                                id: level1.property.id,
                                code: level1.property.propertyCode,
                                name: level1.property.propertyName
                            });
                        }
                    }
                }
            }

            return {
                success: true,
                message: "Properties fetched successfully",
                data: propertyData,
                count: propertyData.length
            };

        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
                data: []
            };
        }
    }
    public async getPropertyIdsAndCodesForLevel2(creationId: string) {
        try {
            const propertyData: Array<{ id: string; code: string, name: string }> = [];

            const level2Creation = await prisma.creation.findUnique({
                where: {
                    id: creationId,
                },
                include: {
                    // Direct property (if level2 has a direct property)
                    property: {
                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true
                        }
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
                                    propertyName: true
                                }
                            },
                            // Level 1 properties
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
                                            propertyName: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!level2Creation) {
                return {
                    success: false,
                    message: "Creation not found or inactive",
                    data: []
                };
            }
            // Collect property from level 2 itself (if exists)
            if (level2Creation.property) {
                propertyData.push({
                    id: level2Creation.property.id,
                    code: level2Creation.property.propertyCode,

                    name: level2Creation.property.propertyName
                });
            }

            // Traverse brandChildren (everything under brand/level 2)
            for (const brandChild of level2Creation.brandChildren) {
                // Collect property from this brand child
                if (brandChild.property) {
                    propertyData.push({
                        id: brandChild.property.id,
                        code: brandChild.property.propertyCode,
                        name: brandChild.property.propertyName
                    });
                }

                // Traverse level 1 properties under brand
                for (const level1 of brandChild.groupChildren) {
                    if (level1.property) {
                        propertyData.push({
                            id: level1.property.id,
                            code: level1.property.propertyCode,
                            name: level1.property.propertyName
                        });
                    }
                }
            }

            return {
                success: true,
                message: "Properties fetched successfully",
                data: propertyData,
                count: propertyData.length
            };

        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
                data: []
            };
        }
    }
    public async getPropertyIdAndCodeForLevel0And1(creationId: string) {
        try {
            const propertyCreation = await prisma.creation.findUnique({
                where: {
                    id: creationId
                }, include: {
                    property: {
                        select: {
                            id: true,
                            propertyCode: true,
                            propertyName: true
                        }
                    }
                }
            })
            return {
                success: true,
                message: "",
                data: [{ id: propertyCreation?.property?.id, code: propertyCreation?.property?.propertyCode, name: propertyCreation?.property?.propertyName }]
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Unknown error occurred",
                data: []
            };
        }
    }

}