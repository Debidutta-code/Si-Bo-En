import { Router } from "express";
import { CategoryRoutes } from "./category.routes";
import { SubCategoryRoutes } from "./subCategory.routes";
import { VariantRoutes } from "./variant.routes";
import { AddonRoutes } from "./addon.routes";
import { AddonDateWiseRoutes } from "./addonDateWise.routes";
import { BookingAddonRoutes } from "./bookingAddon.routes";
import { childAddonRoute } from "./childAddon.route";
const router = Router();

router.use("/categories", CategoryRoutes);
router.use("/sub-categories", SubCategoryRoutes);
router.use("/variants", VariantRoutes);
router.use("/addons", AddonRoutes);
router.use("/addon-datewise", AddonDateWiseRoutes);
router.use("/booking-addons", BookingAddonRoutes);
router.use("/child-addons", childAddonRoute);
export { router as AddonsRoute };