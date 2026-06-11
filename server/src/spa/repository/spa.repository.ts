// import { prisma } from '../../config';
// import { CurrencyCode } from '../../tax-system/interfaces';
// import { ICSpaR, IReservationSpa, ISpaO, ISpaWSlots, IUSpaR } from '../types';

// // shared include for Slots — replaces old Reservation include
// const slotsInclude = {
//     include: {
//         slotsAvailable: {
//             select: {
//                 id: true,
//                 status: true,
//                 reservationId: true,
//                 slotBooking: {
//                     select: { id: true, spaBookingId: true, amount: true },
//                 },
//             },
//         },
//     },
// };

// export class SpaRepository {
//     public async createSpa(data: ICSpaR): Promise<ISpaO> {
//         try {
//             return await prisma.spa.create({ data });
//         } catch (error) {
//             throw new Error('Error occur while creating spa');
//         }
//     }

//     public async getSpaByCode(code: string, propertyId: string): Promise<ISpaO | null> {
//         try {
//             return await prisma.spa.findUnique({
//                 where: { itemCode_propertyId: { itemCode: code, propertyId } },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa');
//         }
//     }

//     public async getByName(name: string, propertyId: string): Promise<ISpaO | null> {
//         try {
//             return await prisma.spa.findUnique({
//                 where: { name_propertyId: { name, propertyId } },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa');
//         }
//     }

//     public async getById(id: string): Promise<ISpaO | null> {
//         try {
//             return await prisma.spa.findUnique({ where: { id } });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa');
//         }
//     }

//     public async updateSpa(id: string, data: IUSpaR): Promise<ISpaO> {
//         try {
//             return await prisma.spa.update({ where: { id }, data: { ...data } });
//         } catch (error) {
//             throw new Error('Error occur while updating spa');
//         }
//     }

//     public async deleteSpa(id: string): Promise<ISpaO> {
//         try {
//             return await prisma.spa.delete({ where: { id } });
//         } catch (error) {
//             throw new Error('Error occur while deleting spa');
//         }
//     }

//     public async getSpaForProperty(propertyId: string): Promise<ISpaWSlots[]> {
//         try {
//             return await prisma.spa.findMany({
//                 where: {
//                     propertyId,
//                     Property: { propertyConfigs: { isSpaModuleEnabled: true } },
//                 },
//                 include: {
//                     Category: true,
//                     SubCategory: true,
//                     User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                     SpaDates: { include: { Slots: { ...slotsInclude } } },
//                     AssignedSpas: {
//                         include: {
//                             User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spas for property');
//         }
//     }

//     public async getSpaForPropertyCode(propertyCode: string): Promise<ISpaWSlots[]> {
//         try {
//             return await prisma.spa.findMany({
//                 where: {
//                     isInclusive: false,
//                     Property: {
//                         propertyCode,
//                         propertyConfigs: { isSpaModuleEnabled: true },
//                     },
//                 },
//                 include: {
//                     Category: true,
//                     SubCategory: true,
//                     User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                     SpaDates: { include: { Slots: { ...slotsInclude } } },
//                     AssignedSpas: {
//                         include: {
//                             User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spas for property code');
//         }
//     }

//     public async getAvailableSpaForinDateRange(
//         propertyId: string,
//         startDate: Date,
//         endDate: Date
//     ): Promise<ISpaWSlots[]> {
//         try {
//             return await prisma.spa.findMany({
//                 where: {
//                     propertyId,
//                     isActive: true,
//                     Property: { propertyConfigs: { isSpaModuleEnabled: true } },
//                 },
//                 include: {
//                     Category: true,
//                     SubCategory: true,
//                     User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                     SpaDates: {
//                         where: { date: { gte: startDate, lt: endDate } },
//                         include: {
//                             Slots: {
//                                 // only show slots that have at least one active section
//                                 where: {
//                                     slotsAvailable: { some: { status: 'active' } },
//                                 },
//                                 orderBy: { startTime: 'asc' },
//                                 ...slotsInclude,
//                             },
//                         },
//                     },
//                     AssignedSpas: {
//                         include: {
//                             User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching available spas for property');
//         }
//     }

//     public async getReservationByCode(bookingCode: string): Promise<IReservationSpa | null> {
//         try {
//             return await prisma.reservation.findUnique({
//                 where: {
//                     bookingCode,
//                     property: { propertyConfigs: { isSpaModuleEnabled: true } },
//                 },
//                 select: {
//                     id: true,
//                     propertyId: true,
//                     bookingCode: true,
//                     reservationStartDate: true,
//                     reservationEndDate: true,
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa');
//         }
//     }

//     public async createSpaBooking(
//         data: {
//             userEmail: string;
//             userContactNumber: string;
//             userId?: string;
//             totalAmount: number;
//             currencyCode?: CurrencyCode;
//         },
//         slots: { spaId: string; slotsAvailableId: string; amount: number }[]  // ← updated
//     ) {
//         try {
//             return await prisma.$transaction(async (tx) => {
//                 // 1. verify every section is free before touching anything
//                 for (const s of slots) {
//                     const section = await tx.slotsAvailable.findUnique({
//                         where: { id: s.slotsAvailableId },
//                     });
//                     if (!section) throw new Error(`Section not found: ${s.slotsAvailableId}`);
//                     if (section.status !== 'active') throw new Error(`Section not available: ${s.slotsAvailableId}`);
//                 }

//                 // 2. create SpaBooking + SlotBookings in one shot
//                 const booking = await tx.spaBooking.create({
//                     data: {
//                         userEmail: data.userEmail,
//                         userContactNumber: data.userContactNumber,
//                         userId: data.userId,
//                         totalAmount: data.totalAmount,
//                         currencyCode: data.currencyCode,
//                         SlotBookings: {
//                             create: slots.map((s) => ({
//                                 spaId: s.spaId,
//                                 slotsAvailableId: s.slotsAvailableId,  // ← updated
//                                 amount: s.amount,
//                             })),
//                         },
//                     },
//                 });

//                 // 3. mark each section as booked
//                 for (const s of slots) {
//                     await tx.slotsAvailable.update({
//                         where: { id: s.slotsAvailableId },
//                         data: { status: 'booked' },
//                     });
//                 }

//                 return booking;
//             });
//         } catch (error) {
//             if (error instanceof Error) throw new Error(error.message);
//             throw new Error('Error occur while creating spa booking');
//         }
//     }

//     public async cancelSpaBooking(bookingId: string, slotBookingId?: string) {
//         try {
//             return await prisma.$transaction(async (tx) => {
//                 const booking = await tx.spaBooking.findUnique({
//                     where: { id: bookingId },
//                     include: {
//                         SlotBookings: {
//                             include: {
//                                 spa: {
//                                     include: {
//                                         AssignedSpas: { include: { User: true } },
//                                     },
//                                 },
//                                 slotsAvailable: {          // ← updated
//                                     include: {
//                                         spaSlot: { include: { spaDate: true } },
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 });

//                 if (!booking) throw new Error('Spa booking not found');

//                 const slotBookingToCancel = booking.SlotBookings.find(
//                     (sb) => sb.id === slotBookingId || sb.slotsAvailableId === slotBookingId
//                 );
//                 if (!slotBookingToCancel) throw new Error('Slot booking not found');

//                 // free the section
//                 await tx.slotsAvailable.update({
//                     where: { id: slotBookingToCancel.slotsAvailableId },
//                     data: { status: 'active' },
//                 });

//                 await tx.slotBooking.delete({ where: { id: slotBookingToCancel.id } });

//                 const remaining = booking.SlotBookings.filter(
//                     (sb) => sb.id !== slotBookingToCancel.id
//                 );

//                 const updatedBooking = await tx.spaBooking.update({
//                     where: { id: bookingId },
//                     data: {
//                         status: remaining.length === 0 ? 'cancelled' : undefined,
//                         totalAmount: remaining.length === 0
//                             ? 0
//                             : booking.totalAmount - slotBookingToCancel.amount,
//                     },
//                 });

//                 return { booking: updatedBooking, cancelledSlot: slotBookingToCancel };
//             });
//         } catch (error) {
//             if (error instanceof Error) throw new Error(error.message);
//             throw new Error('Error occur while cancelling spa booking');
//         }
//     }

//     public async getSpaBookingsByCustomerId(customerId: string) {
//         try {
//             return await prisma.spaBooking.findMany({
//                 where: { userId: customerId, status: 'confirmed' },
//                 include: {
//                     SlotBookings: {
//                         include: {
//                             spa: true,
//                             slotsAvailable: {             // ← updated
//                                 include: {
//                                     spaSlot: { include: { spaDate: true } },
//                                 },
//                             },
//                         },
//                     },
//                 },
//                 orderBy: { createdAt: 'desc' },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching customer spa bookings');
//         }
//     }

//     // returns the SpaSlot (with its date) given a slotsAvailableId
//     public async getSlotById(slotsAvailableId: string) {
//         try {
//             const section = await prisma.slotsAvailable.findUnique({
//                 where: { id: slotsAvailableId },
//                 include: {
//                     spaSlot: { include: { spaDate: true } },
//                 },
//             });
//             // return shape compatible with email service usage
//             return section
//                 ? {
//                       startTime: section.spaSlot.startTime,
//                       endTime: section.spaSlot.endTime,
//                       spaDate: section.spaSlot.spaDate,
//                   }
//                 : null;
//         } catch (error) {
//             throw new Error('Error occur while fetching spa slot');
//         }
//     }

//     public async getSlotBookingBySlotsAvailableId(slotsAvailableId: string) {
//         try {
//             return await prisma.slotBooking.findUnique({   // ← findUnique via @unique
//                 where: { slotsAvailableId },
//                 include: {
//                     spa: {
//                         include: {
//                             AssignedSpas: {
//                                 include: {
//                                     User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                                 },
//                             },
//                         },
//                     },
//                     slotsAvailable: {
//                         include: {
//                             spaSlot: { include: { spaDate: true } },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching slot booking');
//         }
//     }

//     public async getSpaBookingById(bookingId: string) {
//         try {
//             return await prisma.spaBooking.findUnique({ where: { id: bookingId } });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa booking');
//         }
//     }

//     public async getSpaWithProperty(spaId: string) {
//         try {
//             return await prisma.spa.findUnique({
//                 where: {
//                     id: spaId,
//                     Property: { propertyConfigs: { isSpaModuleEnabled: true } },
//                 },
//                 include: {
//                     AssignedSpas: {
//                         include: {
//                             User: { select: { id: true, firstName: true, lastName: true, email: true } },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa with property');
//         }
//     }
// }