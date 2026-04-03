import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { LoyalityLevelController } from "../controllers";

const loyalityLevel = Router();
const loyalityLevelController = new LoyalityLevelController();
loyalityLevel.route("/").post(protect, loyalityLevelController.createLoyalityLevel.bind(loyalityLevelController));
loyalityLevel.route("/:programId")
    .get(protect, loyalityLevelController.getLoyalityLevels.bind(loyalityLevelController))
    .put(protect, loyalityLevelController.updateLoyalityLevel.bind(loyalityLevelController))
    .delete(protect, loyalityLevelController.deleteLoyalityLevel.bind(loyalityLevelController));

export  {loyalityLevel};
