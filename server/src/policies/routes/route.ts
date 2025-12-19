import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware"
import { PolicyController } from "../controller"
import { checkRoleBased } from "../../middlewares/checkRole.middleware"
const router = Router();

router.route("/").post(protect, checkRoleBased("canCreatePolicy"), PolicyController.createPolicies)
router.route("/:id")
    .patch(protect, checkRoleBased("canUpdatePolicy"), PolicyController.updatePolicy)
    .delete(protect, checkRoleBased("canDeletePolicy"), PolicyController.deletePolicy);
router.route("/getPolicy").post(protect, checkRoleBased("canViewHotel"), PolicyController.findPolicy)
router.route("/getPolicyByHotelCode").get(protect, checkRoleBased("canViewHotel"), PolicyController.getPoliciesByHotelCode)


router.route("/addToRatePlan").post(protect, checkRoleBased("canCreatePolicy"), PolicyController.AddToRatePlan)
export default router;