// import { prisma } from "../../config";
// import {
//     IPropertyCodeAndIds,
//     IAnalyticsData,
//     IReservationAnalytics,
//     IRevenueAnalytics,
//     IRoomAnalytics,
//     IGuestAnalytics,
//     IHousekeepingAnalytics,
//     IAddonAnalytics,
//     IBookingSourceAnalytics,
//     IPaymentMethodAnalytics,
//     ITopPerformingProperties
// } from "../types";
// import { Decimal } from "@prisma/client/runtime/library";

// export class DashBoardRepository {
//     /**
//      * Get comprehensive analytics data for given properties
//      * @param propertyIdsAndCodes - Array of property IDs and codes
//      * @param userLevel - User level to determine if top properties should be included
//      */
//     public async getAnalyticsData(propertyIdsAndCodes: IPropertyCodeAndIds[], userLevel?: number) {
//         try {
//             const propertyIds = propertyIdsAndCodes.map(p => p.id);
//             const propertyCodes = propertyIdsAndCodes.map(p => p.code);

//             // Parallel fetch all analytics data
//             const [
//                 reservationStats,
//                 revenueStats,
//                 roomStats,
//                 guestStats,
//                 housekeepingStats,
//                 addonStats,
//                 bookingSourceStats,
//                 paymentMethodStats
//             ] = await Promise.all([
//                 this.getReservationAnalytics(propertyIds),
//                 this.getRevenueAnalytics(propertyIds),
//                 this.getRoomAnalytics(propertyIds),
//                 this.getGuestAnalytics(propertyIds),
//                 this.getHousekeepingAnalytics(propertyIds),
//                 this.getAddonAnalytics(propertyIds),
//                 this.getBookingSourceAnalytics(propertyIds),
//                 this.getPaymentMethodAnalytics(propertyIds)
//             ]);

//             // Fetch top performing properties analytics for users with level > 1
//             let topPropertiesStats: ITopPerformingProperties | undefined;
//             if (userLevel && userLevel > 1) {
//                 topPropertiesStats = await this.getTopPerformingProperties(propertyIdsAndCodes);
//             }

//             const analyticsData: IAnalyticsData = {
//                 reservation: reservationStats,
//                 revenue: revenueStats,
//                 room: roomStats,
//                 guest: guestStats,
//                 housekeeping: housekeepingStats,
//                 addon: addonStats,
//                 bookingSource: bookingSourceStats,
//                 paymentMethod: paymentMethodStats
//             };

//             // Include top properties only if userLevel > 1
//             if (topPropertiesStats) {
//                 analyticsData.topPerformingProperties = topPropertiesStats;
//             }

//             return {
//                 success: true,
//                 data: analyticsData
//             };
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error instanceof Error ? error.message : "Unknown error occurred",
//                 data: null
//             };
//         }
//     }

//     /**
//      * Reservation & Booking Analytics
//      */
//     private async getReservationAnalytics(propertyIds: string[]): Promise<IReservationAnalytics> {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
//         const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

//         const [totalReservations, reservations, todayCheckIns, todayCheckOuts, upcomingReservations] = await Promise.all([
//             // Total reservations
//             // prisma.reservationRoom.count({
//             //     where: { propertyId: { in: propertyIds } }
//             // }),
//             // Get all reservations with status info
//             // prisma.reservationRoom.findMany({
//             //     where: { propertyId: { in: propertyIds } },
//             //     include: {
//             //         reservation: {
//             //             select: {
//             //                 reservationStatus: true
//             //             }
//             //         }
//             //     }
//             // }),
//             // Today's check-ins
//             // prisma.reservationRoom.count({
//             //     where: {
//             //         propertyId: { in: propertyIds },
//             //         reservationFrom: { gte: today, lt: tomorrow }
//             //     }
//             // }),
//             // Today's check-outs
//             // prisma.reservationRoom.count({
//             //     where: {
//             //         propertyId: { in: propertyIds },
//             //         reservationTo: { gte: today, lt: tomorrow }
//             //     }
//             // }),
//             // Upcoming reservations (next 7 days)
//             // prisma.reservationRoom.count({
//             //     where: {
//             //         propertyId: { in: propertyIds },
//             //         reservationFrom: { gte: today, lte: nextWeek }
//             //     }
//             // })
//         ]);

//         // Calculate status breakdown from reservation status
//         const statusMap = new Map<string, number>();
//         let cancelled = 0;

//         // reservations.forEach(room => {
//         //     const status = room.reservation.reservationStatus;
//         //     statusMap.set(status, (statusMap.get(status) || 0) + 1);
//         //     if (status === 'cancelled') {
//         //         cancelled++;
//         //     }
//         // });

//         const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({
//             status,
//             count
//         }));

//         // const cancellationRate = totalReservations > 0 ? (cancelled / totalReservations) * 100 : 0;

//         // Calculate additional metrics
//         let totalStayDays = 0;
//         let totalGuests = 0;

//         // reservations.forEach(room => {
//         //     const checkIn = new Date(room.reservationFrom);
//         //     const checkOut = new Date(room.reservationTo);
//         //     const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
//         //     totalStayDays += stayDuration;
//         //     totalGuests += (room.noOfAdults + room.noOfChildren + room.noOfInfants);
//         // });

//         // const averageStayDuration = totalReservations > 0 ? (totalStayDays / totalReservations).toFixed(2) : '0';
//         // const averageGuestsPerBooking = totalReservations > 0 ? (totalGuests / totalReservations).toFixed(2) : '0';

//         // Get booking trends (last 30 days)
//         const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
//         // const recentBookings = await prisma.reservationRoom.count({
//         //     where: {
//         //         propertyId: { in: propertyIds },
//         //         createdAt: { gte: thirtyDaysAgo }
//         //     }
//         // });

//         return {
//             // totalReservations,
//             statusBreakdown,
//             // todayCheckIns,
//             // todayCheckOuts,
//             // upcomingReservations,
//             // cancellationRate: cancellationRate.toFixed(2),
//             // averageStayDuration,
//             // averageGuestsPerBooking,
//             totalGuests,
//             // last30DaysBookings: recentBookings
//         };
//     }

//     /**
//      * Revenue Analytics
//      */
//     private async getRevenueAnalytics(propertyIds: string[]): Promise<IRevenueAnalytics> {
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//         const thisWeekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

//         const [totalRevenue, todayRevenue, weekRevenue, monthRevenue, paymentStatusBreakdown, avgRevenuePerBooking] = await Promise.all([
//             // Total revenue (confirmed payments)
//             // prisma.payments.aggregate({
//             //     where: {
//             //         folio: { propertyId: { in: propertyIds } },
//             //         paymentStatus: 'confirmed'
//             //     },
//             //     _sum: { amount: true }
//             // }),
//             // // Today's revenue
//             // prisma.payments.aggregate({
//             //     where: {
//             //         folio: { propertyId: { in: propertyIds } },
//             //         paymentStatus: 'confirmed',
//             //         createdAt: { gte: today }
//             //     },
//             //     _sum: { amount: true }
//             // }),
//             // This week's revenue
//             // prisma.payments.aggregate({
//             //     where: {
//             //         folio: { propertyId: { in: propertyIds } },
//             //         paymentStatus: 'confirmed',
//             //         createdAt: { gte: thisWeekStart }
//             //     },
//             //     _sum: { amount: true }
//             // }),
//             // This month's revenue
//             // prisma.payments.aggregate({
//             //     where: {
//             //         folio: { propertyId: { in: propertyIds } },
//             //         paymentStatus: 'confirmed',
//             //         createdAt: { gte: thisMonthStart }
//             //     },
//             //     _sum: { amount: true }
//             // }),
//             // Payment status breakdown
//             // prisma.payments.groupBy({
//             //     by: ['paymentStatus'],
//             //     where: { folio: { propertyId: { in: propertyIds } } },
//             //     _sum: { amount: true },
//             //     _count: true
//             // }),
//             // Average revenue per booking
//             // prisma.payments.aggregate({
//             //     where: {
//             //         folio: { propertyId: { in: propertyIds } },
//             //         paymentStatus: 'confirmed'
//             //     },
//             //     _avg: { amount: true }
//             // })
//         ]);

//         const convertDecimal = (value: Decimal | null | undefined): number => {
//             return value ? Number(value.toString()) : 0;
//         };

//         // Get total available rooms for RevPAR calculation
//         // const totalRooms = await prisma.individualRooms.count({
//         //     where: { propertyId: { in: propertyIds } }
//         // });

//         // Calculate RevPAR (Revenue Per Available Room) for the month
//         const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
//         // const revPAR = totalRooms > 0 && daysInMonth > 0
//         //     ? convertDecimal(monthRevenue._sum.amount) / (totalRooms * daysInMonth)
//         //     : 0;

//         // Get pending payments
//         // const pendingPayments = await prisma.payments.aggregate({
//         //     where: {
//         //         folio: { propertyId: { in: propertyIds } },
//         //         paymentStatus: 'pending'
//         //     },
//         //     _sum: { amount: true },
//         //     _count: true
//         // });

//         // Get last month's revenue for comparison
//         const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
//         const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
//         // const lastMonthRevenue = await prisma.payments.aggregate({
//         //     where: {
//         //         folio: { propertyId: { in: propertyIds } },
//         //         paymentStatus: 'confirmed',
//         //         createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
//         //     },
//         //     _sum: { amount: true }
//         // });

//         // const thisMonthAmount = convertDecimal(monthRevenue._sum.amount);
//         // const lastMonthAmount = convertDecimal(lastMonthRevenue._sum.amount);
//         // const monthOverMonthGrowth = lastMonthAmount > 0
//         //     ? ((thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100).toFixed(2)
//         //     : '0';

//         // Get last 7 days revenue trend
//         const last7DaysTrend = [];
//         for (let i = 6; i >= 0; i--) {
//             const dayStart = new Date(today);
//             dayStart.setDate(dayStart.getDate() - i);
//             dayStart.setHours(0, 0, 0, 0);

//             const dayEnd = new Date(dayStart);
//             dayEnd.setHours(23, 59, 59, 999);

//             const dayRevenue = await prisma.payments.aggregate({
//                 where: {
//                     folio: { propertyId: { in: propertyIds } },
//                     paymentStatus: 'confirmed',
//                     createdAt: { gte: dayStart, lte: dayEnd }
//                 },
//                 _sum: { amount: true }
//             });

//             last7DaysTrend.push({
//                 date: dayStart.toISOString().split('T')[0],
//                 revenue: convertDecimal(dayRevenue._sum.amount)
//             });
//         }

//         return {
//             totalRevenue: convertDecimal(totalRevenue._sum.amount),
//             todayRevenue: convertDecimal(todayRevenue._sum.amount),
//             weekRevenue: convertDecimal(weekRevenue._sum.amount),
//             monthRevenue: thisMonthAmount,
//             lastMonthRevenue: lastMonthAmount,
//             monthOverMonthGrowth,
//             revPAR: Number(revPAR.toFixed(2)),
//             paymentStatusBreakdown: paymentStatusBreakdown.map(p => ({
//                 status: p.paymentStatus,
//                 amount: convertDecimal(p._sum.amount),
//                 count: p._count
//             })),
//             averageRevenuePerBooking: convertDecimal(avgRevenuePerBooking._avg.amount),
//             pendingPayments: {
//                 amount: convertDecimal(pendingPayments._sum.amount),
//                 count: pendingPayments._count
//             },
//             last7DaysTrend
//         };
//     }

//     /**
//      * Room Analytics
//      */
//     private async getRoomAnalytics(propertyIds: string[]): Promise<IRoomAnalytics> {
//         const [totalRooms, roomStatusBreakdown, roomTypeStats] = await Promise.all([
//             // Total rooms
//             prisma.individualRooms.count({
//                 where: { propertyId: { in: propertyIds } }
//             }),
//             // Room status breakdown
//             prisma.individualRooms.groupBy({
//                 by: ['roomStatus'],
//                 where: { propertyId: { in: propertyIds } },
//                 _count: true
//             }),
//             // Room type statistics
//             prisma.room.findMany({
//                 where: { propertyId: { in: propertyIds } },
//                 select: {
//                     roomType: true,
//                     roomName: true,
//                     totalRoom: true,
//                     IndividualRooms: {
//                         select: { roomStatus: true }
//                     }
//                 }
//             })
//         ]);

//         // Calculate occupancy rate
//         const occupiedRooms = roomStatusBreakdown.filter(s =>
//             s.roomStatus === 'checked_in' || s.roomStatus === 'reserved'
//         ).reduce((acc, curr) => acc + curr._count, 0);

//         const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

//         // Calculate room type occupancy rates
//         const roomTypeOccupancy = roomTypeStats.map(roomType => {
//             const totalRoomsForType = roomType.IndividualRooms.length;
//             const occupiedForType = roomType.IndividualRooms.filter(
//                 r => r.roomStatus === 'checked_in' || r.roomStatus === 'reserved'
//             ).length;
//             const occupancyRateForType = totalRoomsForType > 0
//                 ? (occupiedForType / totalRoomsForType * 100).toFixed(2)
//                 : '0';

//             return {
//                 roomType: roomType.roomType,
//                 roomName: roomType.roomName,
//                 totalRooms: totalRoomsForType,
//                 occupiedRooms: occupiedForType,
//                 availableRooms: roomType.IndividualRooms.filter(r => r.roomStatus === 'available').length,
//                 occupancyRate: occupancyRateForType
//             };
//         });

//         // Get rooms by status counts
//         const reservedRooms = roomStatusBreakdown.find(s => s.roomStatus === 'reserved')?._count || 0;
//         const checkedInRooms = roomStatusBreakdown.find(s => s.roomStatus === 'checked_in')?._count || 0;
//         const tentativeRooms = roomStatusBreakdown.find(s => s.roomStatus === 'tentive')?._count || 0;

//         return {
//             totalRooms,
//             occupiedRooms,
//             availableRooms: roomStatusBreakdown.find(s => s.roomStatus === 'available')?._count || 0,
//             dirtyRooms: roomStatusBreakdown.find(s => s.roomStatus === 'dirty')?._count || 0,
//             reservedRooms,
//             checkedInRooms,
//             tentativeRooms,
//             occupancyRate: occupancyRate.toFixed(2),
//             roomStatusBreakdown: roomStatusBreakdown.map(s => ({ status: s.roomStatus, count: s._count })),
//             roomTypeStats,
//             roomTypeOccupancy
//         };
//     }

//     /**
//      * Guest Analytics
//      */
//     private async getGuestAnalytics(propertyIds: string[]) {
//         const [totalGuests, guestTypeBreakdown, repeatGuests, countryBreakdown, recentGuests] = await Promise.all([
//             // Total guests
//             prisma.guests.count({
//                 where: { propertyId: { in: propertyIds } }
//             }),
//             // Guest type breakdown
//             prisma.guests.groupBy({
//                 by: ['userType'],
//                 where: { propertyId: { in: propertyIds } },
//                 _count: true
//             }),
//             // Repeat guests (guests with multiple bookings)
//             prisma.guests.groupBy({
//                 by: ['email'],
//                 where: {
//                     propertyId: { in: propertyIds },
//                     email: { not: null }
//                 },
//                 _count: true,
//                 having: { email: { _count: { gt: 1 } } }
//             }),
//             // Guest nationality/country breakdown
//             prisma.guests.groupBy({
//                 by: ['country'],
//                 where: {
//                     propertyId: { in: propertyIds },
//                     country: { not: null }
//                 },
//                 _count: true,
//                 orderBy: { _count: { country: 'desc' } },
//                 take: 10
//             }),
//             // Recent guests (last 30 days)
//             prisma.guests.count({
//                 where: {
//                     propertyId: { in: propertyIds },
//                     createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
//                 }
//             })
//         ]);

//         // Get guests with verified identity
//         const verifiedGuests = await prisma.guests.count({
//             where: {
//                 propertyId: { in: propertyIds },
//                 identityCardNumber: { not: null }
//             }
//         });

//         return {
//             totalGuests,
//             guestTypeBreakdown: guestTypeBreakdown.map(g => ({ type: g.userType, count: g._count })),
//             repeatGuestsCount: repeatGuests.length,
//             repeatGuestRate: totalGuests > 0 ? ((repeatGuests.length / totalGuests) * 100).toFixed(2) : 0,
//             topCountries: countryBreakdown.map(c => ({ country: c.country || 'Unknown', count: c._count })),
//             recentGuests,
//             verifiedGuests,
//             verificationRate: totalGuests > 0 ? ((verifiedGuests / totalGuests) * 100).toFixed(2) : '0'
//         };
//     }

//     /**
//      * Housekeeping Analytics
//      */
//     private async getHousekeepingAnalytics(propertyIds: string[]): Promise<IHousekeepingAnalytics> {
//         const [taskStatusBreakdown, priorityBreakdown, totalTasks] = await Promise.all([
//             // Task status breakdown
//             prisma.houseKeepingTask.groupBy({
//                 by: ['assignmentStatus'],
//                 where: {
//                     IndividualRoom: { propertyId: { in: propertyIds } }
//                 },
//                 _count: true
//             }),
//             // Priority breakdown
//             prisma.houseKeepingTask.groupBy({
//                 by: ['taskPriority'],
//                 where: {
//                     IndividualRoom: { propertyId: { in: propertyIds } }
//                 },
//                 _count: true
//             }),
//             // Total tasks
//             prisma.houseKeepingTask.count({
//                 where: {
//                     IndividualRoom: { propertyId: { in: propertyIds } }
//                 }
//             })
//         ]);

//         // Get completed tasks details
//         const completedTasks = taskStatusBreakdown.find(t => t.assignmentStatus === 'completed')?._count || 0;
//         const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : '0';

//         // Get tasks with completion time
//         const tasksWithTime = await prisma.houseKeepingTask.findMany({
//             where: {
//                 IndividualRoom: { propertyId: { in: propertyIds } },
//                 assignmentStatus: 'completed',
//                 completedAt: { not: null }
//             },
//             select: {
//                 assignedAt: true,
//                 completedAt: true
//             },
//             take: 100
//         });

//         // Calculate average completion time in minutes
//         let totalCompletionTime = 0;
//         tasksWithTime.forEach(task => {
//             if (task.completedAt) {
//                 const completionTime = task.completedAt.getTime() - task.assignedAt.getTime();
//                 totalCompletionTime += completionTime;
//             }
//         });

//         const averageCompletionTime = tasksWithTime.length > 0
//             ? Math.round(totalCompletionTime / tasksWithTime.length / (1000 * 60))
//             : 0;

//         // Today's tasks
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
//         const todayTasks = await prisma.houseKeepingTask.count({
//             where: {
//                 IndividualRoom: { propertyId: { in: propertyIds } },
//                 createdAt: { gte: today }
//             }
//         });

//         return {
//             totalTasks,
//             taskStatusBreakdown: taskStatusBreakdown.map(t => ({ status: t.assignmentStatus, count: t._count })),
//             priorityBreakdown: priorityBreakdown.map(p => ({ priority: p.taskPriority, count: p._count })),
//             completedTasks,
//             completionRate,
//             averageCompletionTimeMinutes: averageCompletionTime,
//             todayTasks
//         };
//     }

//     /**
//      * Add-on Analytics
//      */
//     private async getAddonAnalytics(propertyIds: string[]): Promise<IAddonAnalytics> {
//         const [totalAddonRevenue, popularAddons, addonCount] = await Promise.all([
//             // Total add-on revenue
//             prisma.bookingAddon.aggregate({
//                 where: {
//                     Reservation: {
//                         ReservationRooms: {
//                             some: { propertyId: { in: propertyIds } }
//                         }
//                     }
//                 },
//                 _sum: { totalPrice: true }
//             }),
//             // Popular add-ons
//             prisma.bookingAddon.groupBy({
//                 by: ['addonId'],
//                 where: {
//                     Reservation: {
//                         ReservationRooms: {
//                             some: { propertyId: { in: propertyIds } }
//                         }
//                     }
//                 },
//                 _sum: { totalPrice: true },
//                 _count: true,
//                 orderBy: { _count: { addonId: 'desc' } },
//                 take: 5
//             }),
//             // Total add-on count
//             prisma.bookingAddon.count({
//                 where: {
//                     Reservation: {
//                         ReservationRooms: {
//                             some: { propertyId: { in: propertyIds } }
//                         }
//                     }
//                 }
//             })
//         ]);

//         return {
//             totalAddonRevenue: totalAddonRevenue._sum.totalPrice || 0,
//             addonCount,
//             popularAddons: popularAddons.map(a => ({
//                 addonId: a.addonId,
//                 revenue: a._sum.totalPrice || 0,
//                 bookingCount: a._count
//             }))
//         };
//     }

//     /**
//      * Booking Source Analytics
//      */
//     private async getBookingSourceAnalytics(propertyIds: string[]): Promise<IBookingSourceAnalytics> {
//         const sourceBreakdown = await prisma.reservation.groupBy({
//             by: ['source'],
//             where: {
//                 ReservationRooms: {
//                     some: { propertyId: { in: propertyIds } }
//                 }
//             },
//             _count: true
//         });

//         // Get revenue by booking source
//         const reservationsWithRevenue = await prisma.reservation.findMany({
//             where: {
//                 ReservationRooms: {
//                     some: { propertyId: { in: propertyIds } }
//                 },
//                 folioId: { not: null }
//             },
//             select: {
//                 source: true,
//                 folioId: true,
//                 folio: {
//                     select: {
//                         payments: {
//                             where: { paymentStatus: 'confirmed' },
//                             select: { amount: true }
//                         }
//                     }
//                 }
//             }
//         });

//         // Calculate revenue by source
//         const revenueBySource = new Map<string, number>();
//         reservationsWithRevenue.forEach(res => {
//             const revenue = res.folio?.payments.reduce((sum, payment) => {
//                 return sum + Number(payment.amount.toString());
//             }, 0) || 0;

//             const currentRevenue = revenueBySource.get(res.source) || 0;
//             revenueBySource.set(res.source, currentRevenue + revenue);
//         });

//         return {
//             sourceBreakdown: sourceBreakdown.map(s => ({
//                 source: s.source,
//                 count: s._count,
//                 revenue: revenueBySource.get(s.source) || 0
//             }))
//         };
//     }

//     /**
//      * Payment Method Analytics
//      */
//     private async getPaymentMethodAnalytics(propertyIds: string[]): Promise<IPaymentMethodAnalytics> {
//         const methodBreakdown = await prisma.payments.groupBy({
//             by: ['paymentMethod'],
//             where: {
//                 folio: { propertyId: { in: propertyIds } },
//                 paymentStatus: 'confirmed'
//             },
//             _sum: { amount: true },
//             _count: true
//         });

//         const convertDecimal = (value: Decimal | null | undefined): number => {
//             return value ? Number(value.toString()) : 0;
//         };

//         return {
//             methodBreakdown: methodBreakdown.map(m => ({
//                 method: m.paymentMethod,
//                 amount: convertDecimal(m._sum.amount),
//                 count: m._count
//             }))
//         };
//     }

//     /**
//      * Top Performing Properties Analytics (for users with level > 1)
//      * Shows top 5 properties by revenue, bookings, and occupancy rate
//      */
//     private async getTopPerformingProperties(propertyIdsAndCodes: IPropertyCodeAndIds[]): Promise<ITopPerformingProperties> {
//         try {
//             const propertyIds = propertyIdsAndCodes.map(p => p.id);

//             // Create a map for quick lookup of property codes and names
//             const propertyMap = new Map<string, { code: string; name: string }>();

//             const properties = await prisma.property.findMany({
//                 where: {
//                     id: { in: propertyIds },
//                     isDeleted: false,
//                     isAvailable: true
//                 },
//                 select: {
//                     id: true,
//                     propertyCode: true,
//                     propertyName: true
//                 }
//             });

//             properties.forEach(p => {
//                 propertyMap.set(p.id, { code: p.propertyCode, name: p.propertyName });
//             });

//             // Fetch revenue by property
//             // const revenueByProperty = await prisma.payments.groupBy({
//             //     by: ['folioId'],
//             //     where: {
//             //         folio: { propertyId: { in: propertyIds } },
//             //         paymentStatus: 'confirmed'
//             //     },
//             //     _sum: { amount: true }
//             // });

//             // Get folio to property mapping
//             // const folioIds = revenueByProperty.map(r => r.folioId);
//             // const folios = await prisma.folio.findMany({
//             //     where: { id: { in: folioIds } },
//             //     select: { id: true, propertyId: true }
//             // });

//             const folioToPropertyMap = new Map<string, string>();
//             // folios.forEach(f => folioToPropertyMap.set(f.id, f.propertyId));

//             // Aggregate revenue by property
//             const propertyRevenueMap = new Map<string, number>();
//             // revenueByProperty.forEach(r => {
//             //     const propertyId = folioToPropertyMap.get(r.folioId);
//             //     if (propertyId) {
//             //         const currentRevenue = propertyRevenueMap.get(propertyId) || 0;
//             //         const amount = r._sum.amount ? Number(r._sum.amount.toString()) : 0;
//             //         propertyRevenueMap.set(propertyId, currentRevenue + amount);
//             //     }
//             // });

//             // Top 5 by revenue
//             const topByRevenue = Array.from(propertyRevenueMap.entries())
//                 .map(([propertyId, totalRevenue]) => {
//                     const propInfo = propertyMap.get(propertyId);
//                     return {
//                         propertyId,
//                         propertyCode: propInfo?.code || '',
//                         propertyName: propInfo?.name || '',
//                         totalRevenue
//                     };
//                 })
//                 .sort((a, b) => b.totalRevenue - a.totalRevenue)
//                 .slice(0, 5);

//             // Fetch bookings by property
//             // const bookingsByProperty = await prisma.reservationRoom.groupBy({
//             //     by: ['propertyId'],
//             //     where: {
//             //         propertyId: { in: propertyIds }
//             //     },
//             //     _count: true
//             // });

//             // Top 5 by bookings
//             // const topByBookings = bookingsByProperty
//             //     .map(b => {
//             //         const propInfo = propertyMap.get(b.propertyId);
//             //         return {
//             //             propertyId: b.propertyId,
//             //             propertyCode: propInfo?.code || '',
//             //             propertyName: propInfo?.name || '',
//             //             totalBookings: b._count
//             //         };
//             //     })
//             //     .sort((a, b) => b.totalBookings - a.totalBookings)
//             //     .slice(0, 5);

//             // Fetch occupancy by property
//             // const roomsByProperty = await prisma.individualRooms.groupBy({
//             //     by: ['propertyId', 'roomStatus'],
//             //     where: {
//             //         propertyId: { in: propertyIds }
//             //     },
//             //     _count: true
//             // });

//             // Calculate occupancy rate per property
//             const occupancyMap = new Map<string, { total: number; occupied: number }>();

//             // roomsByProperty.forEach(r => {
//             //     const current = occupancyMap.get(r.propertyId) || { total: 0, occupied: 0 };
//             //     current.total += r._count;

//             //     if (r.roomStatus === 'checked_in' || r.roomStatus === 'reserved') {
//             //         current.occupied += r._count;
//             //     }

//             //     occupancyMap.set(r.propertyId, current);
//             // });

//             // Top 5 by occupancy rate
//             const topByOccupancy = Array.from(occupancyMap.entries())
//                 .map(([propertyId, stats]) => {
//                     const propInfo = propertyMap.get(propertyId);
//                     const occupancyRate = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
//                     return {
//                         propertyId,
//                         propertyCode: propInfo?.code || '',
//                         propertyName: propInfo?.name || '',
//                         occupancyRate: Number(occupancyRate.toFixed(2)),
//                         totalRooms: stats.total,
//                         occupiedRooms: stats.occupied
//                     };
//                 })
//                 .sort((a, b) => b.occupancyRate - a.occupancyRate)
//                 .slice(0, 5);

//             return {
//                 topByRevenue,
//                 topByBookings,
//                 topByOccupancy
//             };

//         } catch (error) {
//             // Return empty arrays on error
//             return {
//                 topByRevenue: [],
//                 topByBookings: [],
//                 topByOccupancy: []
//             };
//         }
//     }
// }

// export class DashUtilsRepo {
//     public async getPropertyIdsAndCodesForLevel4(creationId: string) {
//         try {
//             const propertyData: Array<{ id: string; code: string, name: string }> = [];

//             const level4Creation = await prisma.creation.findUnique({
//                 where: {
//                     id: creationId,
//                 },
//                 include: {
//                     // Direct property (if level4 somehow has a direct property)
//                     property: {
//                         select: {
//                             id: true,
//                             propertyCode: true,
//                             propertyName: true
//                         }
//                     },
//                     // Everything under super (level 4) is in superChildren
//                     superChildren: {
//                         where: {
//                             isActive: true,
//                             isDeleted: false,
//                         },
//                         include: {
//                             property: {
//                                 select: {
//                                     id: true,
//                                     propertyCode: true,
//                                     propertyName: true

//                                 }
//                             },
//                             // Everything under group (level 3) is in groupChildren
//                             groupChildren: {
//                                 where: {
//                                     isActive: true,
//                                     isDeleted: false,
//                                 },
//                                 include: {
//                                     property: {
//                                         select: {
//                                             id: true,
//                                             propertyCode: true,
//                                             propertyName: true
//                                         }
//                                     },
//                                     // Everything under brand (level 2) is in brandChildren
//                                     brandChildren: {
//                                         where: {
//                                             isActive: true,
//                                             isDeleted: false,
//                                         },
//                                         include: {
//                                             property: {
//                                                 select: {
//                                                     id: true,
//                                                     propertyCode: true,
//                                                     propertyName: true
//                                                 }
//                                             },
//                                             // Level 1 properties
//                                             groupChildren: {
//                                                 where: {
//                                                     isActive: true,
//                                                     isDeleted: false,
//                                                 },
//                                                 include: {
//                                                     property: {
//                                                         select: {
//                                                             id: true,
//                                                             propertyCode: true,
//                                                             propertyName: true
//                                                         }
//                                                     }
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             });

//             if (!level4Creation) {
//                 return {
//                     success: false,
//                     message: "Creation not found or inactive",
//                     data: []
//                 };
//             }
//             // Collect property from level 4 itself (if exists)
//             if (level4Creation.property) {
//                 propertyData.push({
//                     id: level4Creation.property.id,
//                     code: level4Creation.property.propertyCode,
//                     name: level4Creation.property.propertyName
//                 });
//             }

//             // Traverse superChildren (everything under super/level 4)
//             for (const superChild of level4Creation.superChildren) {
//                 // Collect property from this super child (could be group/brand/property)
//                 if (superChild.property) {
//                     propertyData.push({
//                         id: superChild.property.id,
//                         code: superChild.property.propertyCode,
//                         name: superChild.property.propertyName
//                     });
//                 }

//                 // Traverse groupChildren (everything under group/level 3)
//                 for (const groupChild of superChild.groupChildren) {
//                     // Collect property from this group child
//                     if (groupChild.property) {
//                         propertyData.push({
//                             id: groupChild.property.id,
//                             code: groupChild.property.propertyCode,
//                             name: groupChild.property.propertyName
//                         });
//                     }

//                     // Traverse brandChildren (everything under brand/level 2)
//                     for (const brandChild of groupChild.brandChildren) {
//                         // Collect property from this brand child
//                         if (brandChild.property) {
//                             propertyData.push({
//                                 id: brandChild.property.id,
//                                 code: brandChild.property.propertyCode,
//                                 name: brandChild.property.propertyName
//                             });
//                         }

//                         // Traverse level 1 properties under brand
//                         for (const level1 of brandChild.groupChildren) {
//                             if (level1.property) {
//                                 propertyData.push({
//                                     id: level1.property.id,
//                                     code: level1.property.propertyCode,
//                                     name: level1.property.propertyName
//                                 });
//                             }
//                         }
//                     }
//                 }
//             }

//             return {
//                 success: true,
//                 message: "Properties fetched successfully",
//                 data: propertyData,
//                 count: propertyData.length
//             };

//         } catch (error) {
//             console.error("Error fetching properties for level 4:", error);
//             return {
//                 success: false,
//                 message: error instanceof Error ? error.message : "Unknown error occurred",
//                 data: []
//             };
//         }
//     }
//     public async getPropertyIdsAndCodesForLevel3(creationId: string) {
//         try {
//             const propertyData: Array<{ id: string; code: string; name: string }> = [];

//             const level3Creation = await prisma.creation.findUnique({
//                 where: {
//                     id: creationId,
//                 },
//                 include: {
//                     property: {
//                         select: {
//                             id: true,
//                             propertyCode: true,
//                             propertyName: true

//                         }
//                     },
//                     // Everything under group (level 3) is in groupChildren
//                     groupChildren: {
//                         where: {
//                             isActive: true,
//                             isDeleted: false,
//                         },
//                         include: {
//                             property: {
//                                 select: {
//                                     id: true,
//                                     propertyCode: true,
//                                     propertyName: true
//                                 }
//                             },
//                             // Everything under brand (level 2) is in brandChildren
//                             brandChildren: {
//                                 where: {
//                                     isActive: true,
//                                     isDeleted: false,
//                                 },
//                                 include: {
//                                     property: {
//                                         select: {
//                                             id: true,
//                                             propertyCode: true,
//                                             propertyName: true
//                                         }
//                                     },
//                                     // Level 1 properties
//                                     groupChildren: {
//                                         where: {
//                                             isActive: true,
//                                             isDeleted: false,
//                                         },
//                                         include: {
//                                             property: {
//                                                 select: {
//                                                     id: true,
//                                                     propertyCode: true,
//                                                     propertyName: true
//                                                 }
//                                             }
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }

//                 }
//             });

//             if (!level3Creation) {
//                 return {
//                     success: false,
//                     message: "Creation not found or inactive",
//                     data: []
//                 };
//             }
//             // Collect property from level 3 itself (if exists)
//             if (level3Creation.property) {
//                 propertyData.push({
//                     id: level3Creation.property.id,
//                     code: level3Creation.property.propertyCode,
//                     name: level3Creation.property.propertyName
//                 });
//             }

//             // Traverse groupChildren (everything under group/level 3)
//             for (const groupChild of level3Creation.groupChildren) {
//                 // Collect property from this group child
//                 if (groupChild.property) {
//                     propertyData.push({
//                         id: groupChild.property.id,
//                         code: groupChild.property.propertyCode,
//                         name: groupChild.property.propertyName
//                     });
//                 }

//                 // Traverse brandChildren (everything under brand/level 2)
//                 for (const brandChild of groupChild.brandChildren) {
//                     // Collect property from this brand child
//                     if (brandChild.property) {
//                         propertyData.push({
//                             id: brandChild.property.id,
//                             code: brandChild.property.propertyCode,
//                             name: brandChild.property.propertyName
//                         });
//                     }

//                     // Traverse level 1 properties under brand
//                     for (const level1 of brandChild.groupChildren) {
//                         if (level1.property) {
//                             propertyData.push({
//                                 id: level1.property.id,
//                                 code: level1.property.propertyCode,
//                                 name: level1.property.propertyName
//                             });
//                         }
//                     }
//                 }
//             }

//             return {
//                 success: true,
//                 message: "Properties fetched successfully",
//                 data: propertyData,
//                 count: propertyData.length
//             };

//         } catch (error) {
//             return {
//                 success: false,
//                 message: error instanceof Error ? error.message : "Unknown error occurred",
//                 data: []
//             };
//         }
//     }
//     public async getPropertyIdsAndCodesForLevel2(creationId: string) {
//         try {
//             const propertyData: Array<{ id: string; code: string, name: string }> = [];

//             const level2Creation = await prisma.creation.findUnique({
//                 where: {
//                     id: creationId,
//                 },
//                 include: {
//                     // Direct property (if level2 has a direct property)
//                     property: {
//                         select: {
//                             id: true,
//                             propertyCode: true,
//                             propertyName: true
//                         }
//                     },
//                     // Everything under brand (level 2) is in brandChildren
//                     brandChildren: {
//                         where: {
//                             isActive: true,
//                             isDeleted: false,
//                         },
//                         include: {
//                             property: {
//                                 select: {
//                                     id: true,
//                                     propertyCode: true,
//                                     propertyName: true
//                                 }
//                             },
//                             // Level 1 properties
//                             groupChildren: {
//                                 where: {
//                                     isActive: true,
//                                     isDeleted: false,
//                                 },
//                                 include: {
//                                     property: {
//                                         select: {
//                                             id: true,
//                                             propertyCode: true,
//                                             propertyName: true
//                                         }
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             });

//             if (!level2Creation) {
//                 return {
//                     success: false,
//                     message: "Creation not found or inactive",
//                     data: []
//                 };
//             }
//             // Collect property from level 2 itself (if exists)
//             if (level2Creation.property) {
//                 propertyData.push({
//                     id: level2Creation.property.id,
//                     code: level2Creation.property.propertyCode,

//                     name: level2Creation.property.propertyName
//                 });
//             }

//             // Traverse brandChildren (everything under brand/level 2)
//             for (const brandChild of level2Creation.brandChildren) {
//                 // Collect property from this brand child
//                 if (brandChild.property) {
//                     propertyData.push({
//                         id: brandChild.property.id,
//                         code: brandChild.property.propertyCode,
//                         name: brandChild.property.propertyName
//                     });
//                 }

//                 // Traverse level 1 properties under brand
//                 for (const level1 of brandChild.groupChildren) {
//                     if (level1.property) {
//                         propertyData.push({
//                             id: level1.property.id,
//                             code: level1.property.propertyCode,
//                             name: level1.property.propertyName
//                         });
//                     }
//                 }
//             }

//             return {
//                 success: true,
//                 message: "Properties fetched successfully",
//                 data: propertyData,
//                 count: propertyData.length
//             };

//         } catch (error) {
//             return {
//                 success: false,
//                 message: error instanceof Error ? error.message : "Unknown error occurred",
//                 data: []
//             };
//         }
//     }
//     public async getPropertyIdAndCodeForLevel0And1(creationId: string) {
//         try {
//             const propertyCreation = await prisma.creation.findUnique({
//                 where: {
//                     id: creationId
//                 }, include: {
//                     property: {
//                         select: {
//                             id: true,
//                             propertyCode: true,
//                             propertyName: true
//                         }
//                     }
//                 }
//             })
//             return {
//                 success: true,
//                 message: "",
//                 data: [{ id: propertyCreation?.property?.id, code: propertyCreation?.property?.propertyCode, name: propertyCreation?.property?.propertyName }]
//             }
//         } catch (error) {
//             return {
//                 success: false,
//                 message: error instanceof Error ? error.message : "Unknown error occurred",
//                 data: []
//             };
//         }
//     }

// }