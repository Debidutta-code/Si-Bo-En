import { prisma } from '../../../config';
import { ICReview, IReview, IUReview } from '../types';

export class ReviewRepository {
    public async createReview(icReview: ICReview): Promise<IReview> {
        try {
            return await prisma.review.create({
                data: icReview,
            });
        } catch (error) {
            throw new Error('Failed to create review');
        }
    }

    public async getReviewByReservation(
        reservationId: string
    ): Promise<IReview | null> {
        try {
            return await prisma.review.findUnique({
                where: {
                    reservationId,
                    isDeleted: false,
                },
            });
        } catch (error) {
            throw new Error(
                `Failed to get review for reservation: ${reservationId}`
            );
        }
    }

    public async getReviewById(id: string): Promise<IReview | null> {
        try {
            return await prisma.review.findUnique({
                where: { id, isDeleted: false },
            });
        } catch (error) {
            throw new Error(`Failed to get review: ${id}`);
        }
    }

    public async updateReview(
        id: string,
        iuReview: IUReview
    ): Promise<IReview> {
        try {
            return await prisma.review.update({
                where: { id },
                data: {
                    rating: iuReview.rating,
                    review: iuReview.review,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update review: ${id}`);
        }
    }

    public async deleteReview(id: string): Promise<IReview> {
        try {
            return await prisma.review.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error(`Failed to delete review: ${id}`);
        }
    }

    public async getPropertyReviews(
        propertyId: string,
        page: number = 1,
        limit: number = 10
    ) {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                prisma.review.findMany({
                    where: { propertyId, isDeleted: false },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        OtaGuest: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                }),
                prisma.review.count({
                    where: { propertyId, isDeleted: false },
                }),
            ]);
            return { data, total, page, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            throw new Error(
                `Failed to fetch reviews for property: ${propertyId}`
            );
        }
    }
    public async getReviewsByOtaCustomer(
        otaCustomerId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        data: IReview[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                prisma.review.findMany({
                    where: { otaCustomerId, isDeleted: false },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        OtaGuest: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                }),
                prisma.review.count({
                    where: { otaCustomerId, isDeleted: false },
                }),
            ]);
            return { data, total, page, totalPages: Math.ceil(total / limit) };
        } catch (error) {
            throw new Error(
                `Failed to fetch reviews for OTA customer: ${otaCustomerId}`
            );
        }
    }
}
