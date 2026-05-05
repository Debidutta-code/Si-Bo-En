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
        loyalityProgramController.createLoyaltyProgram.bind(loyalityProgramController)
    );

router.route("/:loyaltyProgramId")
    .get(
        protect,
        loyalityProgramController.getLoyaltyProgram.bind(loyalityProgramController)
    )
    .patch(
        protect,
        loyalityProgramController.updateLoyaltyProgram.bind(loyalityProgramController)
    )
    .delete(
        protect,
        loyalityProgramController.deleteLoyaltyProgram.bind(loyalityProgramController)
    );

router.route("/creation/:creationId")
    .get(
        protect,
        loyalityProgramController.getLoyaltyProgramByCreationId.bind(loyalityProgramController)
    );

router.route("/property/:creationLoyaltyConfigId")
    .get(
        protect,
        loyalityProgramController.getPropertyLoyalityProgramByCreationId.bind(loyalityProgramController)
    );

router.route("/advance")
    .post(
        protect,
        advanceLoyaltyProgramController.createAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

router.route("/advance/:loyaltyProgramId")
    .get(
        protect,
        advanceLoyaltyProgramController.getAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

router.route("/advance/update/:id")
    .patch(
        protect,
        advanceLoyaltyProgramController.updateAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

router.route("/advance/delete/:id")
    .delete(
        protect,
        advanceLoyaltyProgramController.deleteAdvanceLoyaltyProgram.bind(advanceLoyaltyProgramController)
    );

export default router;