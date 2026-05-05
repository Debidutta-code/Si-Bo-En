import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { LoyalityFieldController } from "../controllers";

const router = Router();

// Initialize controller
const loyalityFieldController = new LoyalityFieldController();

// ===== Loyalty Field Routes =====
router.route("/")
    .post(
        protect,
        loyalityFieldController.createField.bind(loyalityFieldController)
    );
router.route("/update-many/:loyaltyProgramId")
    .patch(
        protect,
        loyalityFieldController.updateManyFields.bind(loyalityFieldController)
    );
router.route("/:loyaltyProgramId")
    .get(
        protect,
        loyalityFieldController.getFields.bind(loyalityFieldController)
    );

router.route("/:loyaltyProgramId/:fieldName")
    .patch(
        protect,
        loyalityFieldController.updateField.bind(loyalityFieldController)
    )
    .delete(
        protect,
        loyalityFieldController.deleteField.bind(loyalityFieldController)
    );



export default router;