import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { LoyalityConditionController, LoyalitySpecialConditionController } from "../controllers";

const router = Router();

// Initialize controllers
const loyalityConditionController = new LoyalityConditionController();
const loyalitySpecialConditionController = new LoyalitySpecialConditionController();

// ===== Loyalty Condition Routes =====
router.route("/")
    .post(
        protect,
        checkRoleBased("canCreatePolicy"),
        loyalityConditionController.createCondition.bind(loyalityConditionController)
    );

router.route("/:id")
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        loyalityConditionController.updateCondition.bind(loyalityConditionController)
    )
    .delete(
        protect,
        checkRoleBased("canDeletePolicy"),
        loyalityConditionController.deleteCondition.bind(loyalityConditionController)
    );

router.route("/program/:loyaltyProgramId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        loyalityConditionController.getConditionsByProgramId.bind(loyalityConditionController)
    );

// ===== Loyalty Special Condition Routes =====
router.route("/special")
    .post(
        protect,
        checkRoleBased("canCreatePolicy"),
        loyalitySpecialConditionController.createSpecialCondition.bind(loyalitySpecialConditionController)
    );

router.route("/special/:id")
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        loyalitySpecialConditionController.updateSpecialCondition.bind(loyalitySpecialConditionController)
    )
    .delete(
        protect,
        checkRoleBased("canDeletePolicy"),
        loyalitySpecialConditionController.deleteSpecialCondition.bind(loyalitySpecialConditionController)
    );

router.route("/special/program/:loyaltyProgramId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        loyalitySpecialConditionController.getSpecialConditionsByProgramId.bind(loyalitySpecialConditionController)
    );

export default router;