import { Request, Response } from 'express';
import { ReviewService } from '../services';
import { CustomRequest, errorResponse, IApiResponse } from '../../../utils';

export class ReviewController {
    private reviewService: ReviewService;

    constructor() {
        this.reviewService = new ReviewService();
    }

    public async createReview(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const customer = req.customer;
            if (!customer) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const {
                propertyId,
                propertyCode,
                propertyName,
                reservationId,
                rating,
                review,
            } = req.body;

            if (
                !propertyId ||
                !propertyCode ||
                !propertyName ||
                !reservationId ||
                rating === undefined ||
                !review
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Missing required fields for review creation'
                        )
                    );
            }

            if (rating < 1 || rating > 5) {
                return res
                    .status(400)
                    .json(errorResponse('Rating must be between 1 and 5'));
            }

            const result = await this.reviewService.createReview({
                propertyId,
                propertyCode,
                propertyName,
                customerId: customer.id,
                reservationId,
                rating,
                review,
            });

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to create review', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to create review', 'Unknown error')
                );
        }
    }

    public async updateReview(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const customer = req.customer;
            if (!customer) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const { reviewId } = req.params;
            const { rating, review } = req.body;

            if (rating !== undefined && (rating < 1 || rating > 5)) {
                return res
                    .status(400)
                    .json(errorResponse('Rating must be between 1 and 5'));
            }

            const result = await this.reviewService.updateReview(
                reviewId,
                customer.id,
                { rating, review }
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to update review', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to update review', 'Unknown error')
                );
        }
    }

    public async deleteReview(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const customer = req.customer;
            if (!customer) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const { reviewId } = req.params;

            const result = await this.reviewService.deleteReview(
                reviewId,
                customer.id
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse('Failed to delete review', error.message)
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse('Failed to delete review', 'Unknown error')
                );
        }
    }

    public async getPropertyReviews(
        req: Request,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const { propertyId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result = await this.reviewService.getPropertyReviews(
                propertyId,
                page,
                limit
            );
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve property reviews',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to retrieve property reviews',
                        'Unknown error'
                    )
                );
        }
    }
    public async getReviewForCustomer(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const customer = req.customer;
            if (!customer) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.reviewService.getCustomerReview(
                customer.id,
                page,
                limit
            );
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to retrieve customer reviews',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to retrieve customer reviews',
                        'Unknown error'
                    )
                );
        }
    }

    public async getReservationReview(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const customer = req.customer;
            if (!customer) {
                return res
                    .status(401)
                    .json(
                        errorResponse(
                            'Authorization failed, Login again',
                            'User not found'
                        )
                    );
            }

            const { reservationId } = req.params;

            if (!reservationId) {
                return res
                    .status(400)
                    .json(errorResponse('Reservation ID is required'));
            }

            const result =
                await this.reviewService.getReservationReview(reservationId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to get reservation review',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Failed to get reservation review',
                        'Unknown error'
                    )
                );
        }
    }
}
