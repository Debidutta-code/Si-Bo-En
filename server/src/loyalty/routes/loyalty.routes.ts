import { Router } from "express";
import loyaltyProgramRoutes from "./loyality-program.route";
import loyaltyFieldRoutes from "./loyality-field.route";
import loyaltyConditionRoutes from "./loyality-condition.route";
import propertyLoyaltyRoutes from "./property-loyality.route";
import creationLoyaltyRoutes from "./creation-loyality.route";

const router = Router();

// Mount all loyalty sub-routes
router.use("/program", loyaltyProgramRoutes);
router.use("/field", loyaltyFieldRoutes);
router.use("/condition", loyaltyConditionRoutes);
router.use("/property", propertyLoyaltyRoutes);
router.use("/creation", creationLoyaltyRoutes);

export { router as loyaltyRouter };
