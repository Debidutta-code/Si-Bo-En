import { ReviewRepository } from '../repository';
import { ICReview, IUReview } from '../types';
import { IApiResponse, successResponse, errorResponse } from '../../../utils';

export class ReviewService {
    private reviewRepository: ReviewRepository;

    constructor() {
        this.reviewRepository = new ReviewRepository();
    }

    public async createReview(icReview: ICReview): Promise<IApiResponse> {
        try {
            const existingReview =
                await this.reviewRepository.getReviewByReservation(
                    icReview.reservationId
                );
            if (existingReview) {
                return errorResponse(
                    'A review already exists for this reservation. Only one review per reservation is allowed.',
                    'Duplicate review'
                );
            }

            const newReview =
                await this.reviewRepository.createReview(icReview);
            return successResponse('Review created successfully', newReview);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to create review', error.message);
            }
            return errorResponse('Failed to create review', 'Unknown error');
        }
    }

    public async updateReview(
        reviewId: string,
        otaCustomerId: string,
        iuReview: IUReview
    ): Promise<IApiResponse> {
        try {
            const review = await this.reviewRepository.getReviewById(reviewId);
            if (!review) {
                return errorResponse('Review not found', 'Not Found');
            }
            if (review.otaCustomerId !== otaCustomerId) {
                return errorResponse(
                    'Unauthorized to update this review',
                    'Unauthorized'
                );
            }

            const updatedReview = await this.reviewRepository.updateReview(
                reviewId,
                iuReview
            );
            return successResponse(
                'Review updated successfully',
                updatedReview
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to update review', error.message);
            }
            return errorResponse('Failed to update review', 'Unknown error');
        }
    }

    public async deleteReview(
        reviewId: string,
        otaCustomerId: string
    ): Promise<IApiResponse> {
        try {
            const review = await this.reviewRepository.getReviewById(reviewId);
            if (!review) {
                return errorResponse('Review not found', 'Not Found');
            }
            if (review.otaCustomerId !== otaCustomerId) {
                return errorResponse(
                    'Unauthorized to delete this review',
                    'Unauthorized'
                );
            }

            await this.reviewRepository.deleteReview(reviewId);
            return successResponse('Review deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete review', error.message);
            }
            return errorResponse('Failed to delete review', 'Unknown error');
        }
    }

    public async getPropertyReviews(
        propertyId: string,
        page: number,
        limit: number
    ): Promise<IApiResponse> {
        try {
            const result = await this.reviewRepository.getPropertyReviews(
                propertyId,
                page,
                limit
            );
            return successResponse(
                'Property reviews retrieved successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve property reviews',
                    error.message
                );
            }
            return errorResponse(
                'Failed to retrieve property reviews',
                'Unknown error'
            );
        }
    }
    public async getCustomerReview(
        otaCustomerId: string,
        page: number,
        limit: number
    ): Promise<IApiResponse> {
        try {
            const result = await this.reviewRepository.getReviewsByOtaCustomer(
                otaCustomerId,
                page,
                limit
            );
            return successResponse(
                'Customer reviews retrieved successfully',
                result
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve customer reviews',
                    error.message
                );
            }
            return errorResponse(
                'Failed to retrieve customer reviews',
                'Unknown error'
            );
        }
    }
    public async getReservationReview(
        reservationId: string
    ): Promise<IApiResponse> {
        try {
            const review =
                await this.reviewRepository.getReviewByReservation(
                    reservationId
                );
            if (!review) {
                return errorResponse(
                    'No review found for this reservation',
                    'Not Found'
                );
            }
            return successResponse(
                'Reservation review retrieved successfully',
                review
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve reservation review',
                    error.message
                );
            }
            return errorResponse(
                'Failed to retrieve reservation review',
                'Unknown error'
            );
        }
    }
}
