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
        checkRoleBased("canDeletePolicy"),
        loyaltyGuestController.deleteLoyaltyGuest.bind(loyaltyGuestController)
    );

router.route("/property/:propertyId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        loyaltyGuestController.getLoyaltyGuestsForProperty.bind(loyaltyGuestController)
    );

router.route("/creation/:creationLoyaltyId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        loyaltyGuestController.getLoyaltyGuestsForCreation.bind(loyaltyGuestController)
    );

// ===== Booking Engine Public Routes (No Authentication) =====

// Register new loyalty guest from booking engine
router.route("/register")
    .post(
        loyaltyGuestController.registerGuestFromBookingEngine.bind(loyaltyGuestController)
    );

// Check loyalty discount for a guest
router.route("/check-discount")
    .post(
        loyaltyGuestController.checkLoyaltyDiscount.bind(loyaltyGuestController)
    );

// Get loyalty guest by email (for booking engine)
router.route("/by-email/:propertyId/:email")
    .get(
        loyaltyGuestController.getLoyaltyGuestByEmail.bind(loyaltyGuestController)
    );

export default router;
