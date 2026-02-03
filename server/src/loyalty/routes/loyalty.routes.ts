import { Router } from "express";
import loyaltyProgramRoutes from "./loyality-program.route";
import loyaltyFieldRoutes from "./loyality-field.route";
import loyaltyConditionRoutes from "./loyality-condition.route";
import propertyLoyaltyRoutes from "./property-loyality.route";
import creationLoyaltyRoutes from "./creation-loyality.route";
import loyaltyGuestRoutes from "./loyality-guest.route";
const router = Router();

// Mount all loyalty sub-routes
router.use("/program", loyaltyProgramRoutes);
router.use("/field", loyaltyFieldRoutes);
router.use("/condition", loyaltyConditionRoutes);
router.use("/property", propertyLoyaltyRoutes);
router.use("/creation", creationLoyaltyRoutes);
router.use("/guest", loyaltyGuestRoutes);

export { router as loyaltyRouter };
