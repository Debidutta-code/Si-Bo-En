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
        checkRoleBased("canCreatePolicy"),
        loyalityFieldController.createField.bind(loyalityFieldController)
    );
router.route("/update-many/:loyaltyProgramId")
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        loyalityFieldController.updateManyFields.bind(loyalityFieldController)
    );
router.route("/:loyaltyProgramId")
    .get(
        protect,
        checkRoleBased("canViewHotel"),
        loyalityFieldController.getFields.bind(loyalityFieldController)
    );

router.route("/:loyaltyProgramId/:fieldName")
    .patch(
        protect,
        checkRoleBased("canUpdatePolicy"),
        loyalityFieldController.updateField.bind(loyalityFieldController)
    )
    .delete(
        protect,
        checkRoleBased("canDeletePolicy"),
        loyalityFieldController.deleteField.bind(loyalityFieldController)
    );



export default router;