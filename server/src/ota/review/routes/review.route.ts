import { Router } from "express";
import { ReviewController } from "../controllers";
import { otaProtect } from "../../../middlewares/ota-user.middleware";

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.route("/property/:propertyId")
    .get(reviewController.getPropertyReviews.bind(reviewController));

reviewRouter.route("/")
    .post(otaProtect,reviewController.createReview.bind(reviewController))
    .get(otaProtect,reviewController.getReviewForCustomer.bind(reviewController));

reviewRouter.route("/:reviewId")
    .put(otaProtect,reviewController.updateReview.bind(reviewController))
    .delete(otaProtect,reviewController.deleteReview.bind(reviewController));

reviewRouter.route("/reservation/:reservationId")
    .get(otaProtect,reviewController.getReservationReview.bind(reviewController));

export { reviewRouter };
