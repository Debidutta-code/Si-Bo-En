import { Router } from 'express';
import { categoryRouter } from './category.routes';
import { subcategoryRouter } from './subCategory.routes';
import { variantRouter } from './variant.routes';
import { AddonRoutes } from './addon.routes';
import { AddonDateWiseRoutes } from './addonDateWise.routes';
import { BookingAddonRoutes } from './bookingAddon.routes';
import { childAddonRoute } from './childAddon.route';
const router = Router();

router.use('/categories', categoryRouter);
router.use('/sub-categories', subcategoryRouter);
router.use('/variants', variantRouter);
router.use('/addons', AddonRoutes);
router.use('/addon-datewise', AddonDateWiseRoutes);
router.use('/booking-addons', BookingAddonRoutes);
router.use('/child-addons', childAddonRoute);
export { router as AddonsRoute };
