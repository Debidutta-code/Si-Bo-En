import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { LoyaltyGuestController } from "../controllers";

const router = Router();

// Initialize controller
const loyaltyGuestController = new LoyaltyGuestController();

// ===== Loyalty Guest Routes =====
router.route("/")
    .post(
        protect,
        checkRoleBased("canCreatePolicy"),
        loyaltyGuestController.createLoyaltyGuest.bind(loyaltyGuestController)
    );

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

export default router;
