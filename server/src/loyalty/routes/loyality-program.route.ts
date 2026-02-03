import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { LoyalityProgramController, AdvanceLoyaltyProgramController } from "../controllers";

const router = Router();

// Initialize controllers
const loyalityProgramController = new LoyalityProgramController();
const advanceLoyaltyProgramController = new AdvanceLoyaltyProgramController();

// ===== Basic Loyalty Program Routes =====
router.route("/")
    .post(
        protect,
        checkRoleBased("canCreatePolicy"),
        loyalityProgramController.createLoyaltyProgram.bind(loyalityProgramController)
    );

router.route("/:loyaltyProgramId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        loyalityProgramController.getLoyaltyProgram.bind(loyalityProgramController)
    )
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        loyalityProgramController.updateLoyaltyProgram.bind(loyalityProgramController)
    )
    .delete(
        protect,
        checkRoleBased("canDeletePolicy"),
        loyalityProgramController.deleteLoyaltyProgram.bind(loyalityProgramController)
    );

// ===== Advance Loyalty Program Routes =====
router.route("/advance")
    .post(
        protect,
        checkRoleBased("canCreatePolicy"),
        advanceLoyaltyProgramController.createAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

router.route("/advance/:loyaltyProgramId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        advanceLoyaltyProgramController.getAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

router.route("/advance/update/:id")
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        advanceLoyaltyProgramController.updateAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

router.route("/advance/delete/:id")
    .delete(
        protect,
        checkRoleBased("canDeletePolicy"),
        advanceLoyaltyProgramController.deleteAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

export default router;