import { Router } from 'express';
import { ReviewController } from '../controllers';
import { customerProtect } from '../../../middlewares/customer-auth.middleware';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter
    .route('/property/:propertyId')
    .get(reviewController.getPropertyReviews.bind(reviewController));

reviewRouter
    .route('/')
    .post(customerProtect, reviewController.createReview.bind(reviewController))
    .get(
        customerProtect,
        reviewController.getReviewForCustomer.bind(reviewController)
    );

reviewRouter
    .route('/:reviewId')
    .put(customerProtect, reviewController.updateReview.bind(reviewController))
    .delete(customerProtect, reviewController.deleteReview.bind(reviewController));

reviewRouter
    .route('/reservation/:reservationId')
    .get(
        customerProtect,
        reviewController.getReservationReview.bind(reviewController)
    );

export { reviewRouter };
