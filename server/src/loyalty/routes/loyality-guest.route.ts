import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { LoyaltyGuestController } from "../controllers";

const router = Router();

// Initialize controller
const loyaltyGuestController = new LoyaltyGuestController();


router.route("/:id")
    .delete(
        protect,
        loyaltyGuestController.deleteLoyaltyGuest.bind(loyaltyGuestController)
    );

router.route("/property/:propertyId")
    .get(
        protect,
        loyaltyGuestController.getLoyaltyGuestsForProperty.bind(loyaltyGuestController)
    );

router.route("/creation/:creationLoyaltyId")
    .get(
        protect,
        loyaltyGuestController.getLoyaltyGuestsForCreation.bind(loyaltyGuestController)
    );

router.route("/register")
    .post(
        loyaltyGuestController.registerGuestFromBookingEngine.bind(loyaltyGuestController)
    );

router.route("/check-discount")
    .post(
        loyaltyGuestController.checkLoyaltyDiscount.bind(loyaltyGuestController)
    );

router.route("/by-email/:propertyId/:email")
    .get(
        loyaltyGuestController.getLoyaltyGuestByEmail.bind(loyaltyGuestController)
    );

export default router;
