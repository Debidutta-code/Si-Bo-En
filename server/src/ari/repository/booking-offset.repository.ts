import { prisma } from '../../config';
import {
    IBookingOffset,
    ICBookingOffsetR,
    ICBookingOffsetS,
    BatchPayload,
    IUBookingOffsetR,
} from '../types/booking-offset.types';

export class BookingOffsetRepository {
    public async createBookingOffsets(
        bookingOffsets: ICBookingOffsetR[]
    ): Promise<BatchPayload> {
        try {
            return await prisma.bookingOffset.createMany({
                data: bookingOffsets,
            });
        } catch (error) {
            throw new Error('Failed to create booking offsets');
        }
    }
    public async getBookingOffsets(
        propertyId: string,
        ratePlanId: string | null,
        startDate: Date | null,
        endDate: Date | null
    ): Promise<IBookingOffset[]> {
        try {
            let where: any = {
                propertyId,
            };
            if (ratePlanId) {
                where.ratePlanId = ratePlanId;
            }
            if (startDate && endDate) {
                where.date = {
                    gte: startDate,
                    lte: endDate,
                };
            } else if (startDate) {
                where.date = {
                    gte: startDate,
                };
            } else if (endDate) {
                where.date = {
                    lte: endDate,
                };
            }
            return await prisma.bookingOffset.findMany({
                where: {
                    ...where,
                },
                orderBy: {
                    date: 'asc',
                },
            });
        } catch (error) {
            throw new Error('Failed to get booking offsets');
        }
    }
    public async updateBookingOffsets(
        condition: {
            propertyId: string;
            ratePlanId: string;
            startDate: Date | null;
            endDate: Date | null;
        },
        bookingOffsets: IUBookingOffsetR[]
    ): Promise<BatchPayload> {
        try {
            let whereClause: any = {
                propertyId: condition.propertyId,
                ratePlanId: condition.ratePlanId,
            };
            if (condition.startDate && condition.endDate) {
                whereClause.date = {
                    gte: condition.startDate,
                    lte: condition.endDate,
                };
            } else if (condition.startDate) {
                whereClause.date = {
                    gte: condition.startDate,
                };
            } else if (condition.endDate) {
                whereClause.date = {
                    lte: condition.endDate,
                };
            }

            // Only include fields that are explicitly provided (not null/undefined)
            const filteredData: any = {};
            for (const [key, value] of Object.entries(bookingOffsets as any)) {
                if (value !== null && value !== undefined) {
                    filteredData[key] = value;
                }
            }

            return await prisma.bookingOffset.updateMany({
                where: {
                    ...whereClause,
                },
                data: filteredData,
            });
        } catch (error) {
            throw new Error('Failed to update booking offsets');
        }
    }
    public async deleteBookingOffsets(condition: {
        propertyId: string;
        ratePlanId: string;
        startDate: Date | null;
        endDate: Date | null;
    }): Promise<BatchPayload> {
        try {
            let whereClause: any = {
                propertyId: condition.propertyId,
                ratePlanId: condition.ratePlanId,
            };
            if (condition.startDate && condition.endDate) {
                whereClause.date = {
                    gte: condition.startDate,
                    lte: condition.endDate,
                };
            } else if (condition.startDate) {
                whereClause.date = {
                    gte: condition.startDate,
                };
            } else if (condition.endDate) {
                whereClause.date = {
                    lte: condition.endDate,
                };
            }
            return await prisma.bookingOffset.deleteMany({
                where: {
                    ...whereClause,
                },
            });
        } catch (error) {
            throw new Error('Failed to delete booking offsets');
        }
    }

    public async updateById(
        id: string,
        data: IUBookingOffsetR
    ): Promise<IBookingOffset> {
        try {
            return await prisma.bookingOffset.update({
                where: {
                    id,
                },
                data: data,
            });
        } catch (error) {
            throw new Error('Failed to update booking offset');
        }
    }
    public async deleteById(id: string): Promise<IBookingOffset> {
        try {
            return await prisma.bookingOffset.delete({
                where: {
                    id,
                },
            });
        } catch (error) {
            throw new Error('Failed to delete booking offset');
        }
    }
    public async getById(id: string): Promise<IBookingOffset | null> {
        try {
            return await prisma.bookingOffset.findUnique({
                where: {
                    id,
                },
            });
        } catch (error) {
            throw new Error('Failed to get booking offset');
        }
    }
    public async checkIfExists(
        ratePlanId: string,
        date: Date
    ): Promise<boolean> {
        try {
            const isExist = await prisma.bookingOffset.findUnique({
                where: {
                    ratePlanId_date: {
                        ratePlanId,
                        date,
                    },
                },
            });
            return !!isExist;
        } catch (error) {
            throw new Error('Failed to check if booking offset exists');
        }
    }
    public async upsertBookingOffset(
        ratePlanId: string,
        date: Date,
        propertyId: string,
        ratePlanCode: string,
        ratePlanName: string,
        data: Partial<ICBookingOffsetS>
    ): Promise<IBookingOffset> {
        try {
            // Build update data: only include fields that are explicitly provided
            const updateData: any = {};
            if (data.minimumAdvanceBookingOffset)
                updateData.minimumAdvanceBookingOffset =
                    data.minimumAdvanceBookingOffset;
            if (data.maximumAdvanceBookingOffset)
                updateData.maximumAdvanceBookingOffset =
                    data.maximumAdvanceBookingOffset;
            if (data.minimumAmendBookingOffset)
                updateData.minimumAmendBookingOffset =
                    data.minimumAmendBookingOffset;
            if (data.maximumAmendBookingOffset)
                updateData.maximumAmendBookingOffset =
                    data.maximumAmendBookingOffset;
            if (data.minimumCancelBookingOffset)
                updateData.minimumCancelBookingOffset =
                    data.minimumCancelBookingOffset;
            if (data.maximumCancelBookingOffset)
                updateData.maximumCancelBookingOffset =
                    data.maximumCancelBookingOffset;

            return await prisma.bookingOffset.upsert({
                where: {
                    ratePlanId_date: {
                        ratePlanId,
                        date,
                    },
                },
                update: updateData,
                create: {
                    propertyId,
                    ratePlanId,
                    ratePlanCode,
                    ratePlanName,
                    date,
                    ...updateData,
                },
            });
        } catch (error) {
            throw new Error('Failed to upsert booking offset');
        }
    }
}
