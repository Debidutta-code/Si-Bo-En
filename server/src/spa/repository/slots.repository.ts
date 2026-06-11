// import { prisma } from '../../config';
// import {
//     BatchPayload,
//     ICSpaSlotR,
//     ISpaSlot,
//     ICSpaDatesR,
//     ISpaDates,
// } from '../types';

// export class SpaDatesRepo {
//     public async createDate(data: ICSpaDatesR): Promise<ISpaDates> {
//         try {
//             return await prisma.spaDates.create({
//                 data: { ...data },
//                 include: {
//                     Slots: {
//                         include: {
//                             slotsAvailable: true,
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while creating spa date');
//         }
//     }

//     public async getDateById(id: string): Promise<ISpaDates | null> {
//         try {
//             return await prisma.spaDates.findUnique({
//                 where: {
//                     id,
//                     spaModule: {
//                         Property: {
//                             propertyConfigs: { isSpaModuleEnabled: true },
//                         },
//                     },
//                 },
//                 include: {
//                     Slots: {
//                         include: {
//                             slotsAvailable: true,
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa date by id');
//         }
//     }

//     public async getForDateRange(
//         spaModuleId: string,
//         startDate: Date,
//         endDate: Date
//     ): Promise<ISpaDates[]> {
//         try {
//             return await prisma.spaDates.findMany({
//                 where: {
//                     spaModuleId,
//                     date: { gte: startDate, lte: endDate },
//                     spaModule: {
//                         Property: {
//                             propertyConfigs: { isSpaModuleEnabled: true },
//                         },
//                     },
//                 },
//                 include: {
//                     Slots: {
//                         include: {
//                             slotsAvailable: true,
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa dates for date range');
//         }
//     }

//     // public async getSpaForDate(
//     //     spaModuleId: string,
//     //     date: Date
//     // ): Promise<ISpaDates | null> {
//     //     try {
//     //         return await prisma.spaDates.findFirst({
//     //             where: {
//     //                 spaModuleId,
//     //                 date: { equals: date },
//     //                 spaModule: {
//     //                     Property: {
//     //                         propertyConfigs: { isSpaModuleEnabled: true },
//     //                     },
//     //                 },
//     //             },
//     //             // include: {
//     //             //     Slots: {
//     //             //         include: {
//     //             //             slotsAvailable: true,
//     //             //         },
//     //             //     },
//     //             // },
//     //         });
//     //     } catch (error) {
//     //         throw new Error('Error occur while fetching spa for date');
//     //     }
//     // }

//     public async deleteDate(id: string): Promise<ICSpaDatesR> {
//         try {
//             return await prisma.spaDates.delete({
//                 where: {
//                     id,
//                     spaModule: {
//                         Property: {
//                             propertyConfigs: { isSpaModuleEnabled: true },
//                         },
//                     },
//                 },
//                 include: {
//                     Slots: true,
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while deleting spa date');
//         }
//     }
// }

// export class SpaSlotsRepo {
//     public async createSlots(data: ICSpaSlotR[]): Promise<BatchPayload> {
//         try {
//             return await prisma.spaSlots.createMany({ data });
//         } catch (error) {
//             throw new Error('Error occur while creating spa slot');
//         }
//     }

//     public async getSlotById(id: string): Promise<ISpaSlot | null> {
//         try {
//             return await prisma.spaSlots.findUnique({
//                 where: {
//                     id,
//                     spaDate: {
//                         spaModule: {
//                             Property: {
//                                 propertyConfigs: { isSpaModuleEnabled: true },
//                             },
//                         },
//                     },
//                 },
//                 include: {
//                     slotsAvailable: true,
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while fetching spa slot by id');
//         }
//     }

//     public async deleteSlot(id: string): Promise<ISpaSlot> {
//         try {
//             return await prisma.spaSlots.delete({
//                 where: {
//                     id,
//                     spaDate: {
//                         spaModule: {
//                             Property: {
//                                 propertyConfigs: { isSpaModuleEnabled: true },
//                             },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while deleting spa slot');
//         }
//     }

//     // marks a specific SlotsAvailable section as booked
//     public async markSectionAsBooked(
//         slotsAvailableId: string,
//         reservationId: string
//     ) {
//         try {
//             return await prisma.slotsAvailable.update({
//                 where: { id: slotsAvailableId },
//                 data: {
//                     status: 'booked',
//                     reservationId,
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while marking section as booked');
//         }
//     }

//     // frees a specific SlotsAvailable section
//     public async markSectionAsAvailable(slotsAvailableId: string) {
//         try {
//             return await prisma.slotsAvailable.update({
//                 where: { id: slotsAvailableId },
//                 data: {
//                     status: 'active',
//                     reservationId: null,
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while marking section as available');
//         }
//     }

//     // marks a specific SlotsAvailable section as completed
//     public async markSectionAsCompleted(slotsAvailableId: string) {
//         try {
//             return await prisma.slotsAvailable.update({
//                 where: { id: slotsAvailableId },
//                 data: { status: 'completed' },
//             });
//         } catch (error) {
//             throw new Error('Error occur while marking section as completed');
//         }
//     }

//     // marks a whole slot inactive (admin disables the slot)
//     public async markSlotAsInactive(id: string): Promise<ISpaSlot> {
//         try {
//             return await prisma.spaSlots.update({
//                 where: {
//                     id,
//                     spaDate: {
//                         spaModule: {
//                             Property: {
//                                 propertyConfigs: { isSpaModuleEnabled: true },
//                             },
//                         },
//                     },
//                 },
//                 data: {
//                     slotsAvailable: {
//                         updateMany: {
//                             where: { status: 'active' },
//                             data: { status: 'inactive' },
//                         },
//                     },
//                 },
//             });
//         } catch (error) {
//             throw new Error('Error occur while marking slot as inactive');
//         }
//     }
// }