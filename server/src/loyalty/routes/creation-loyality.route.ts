import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { CreationLoyalityController } from "../controllers";

const router = Router();

// Initialize controller
const creationLoyalityController = new CreationLoyalityController();

// ===== Creation Loyalty Routes =====
router.route("/")
    .post(
        protect,
        checkRoleBased("canCreatePolicy"),
        creationLoyalityController.createCreationLoyality.bind(creationLoyalityController)
    );

router.route("/:creationLoyalityId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        creationLoyalityController.getCreationLoyalityById.bind(creationLoyalityController)
    )
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        creationLoyalityController.updateCreationLoyality.bind(creationLoyalityController)
    )
    .delete(
        protect,
        checkRoleBased("canDeletePolicy"),
        creationLoyalityController.deleteLoyality.bind(creationLoyalityController)
    );

router.route("/by-creation/:creationId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        creationLoyalityController.getLoyalityByCreation.bind(creationLoyalityController)
    );

router.route("/with-property/:creationId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        creationLoyalityController.getAllCreationLoyalityWithProperty.bind(creationLoyalityController)
    );

export default router;