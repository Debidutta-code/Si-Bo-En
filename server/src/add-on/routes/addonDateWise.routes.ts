import { Router } from "express";
import { AddonDateWiseController } from "../controllers";

const router = Router();
const addonDateWiseController = new AddonDateWiseController();

/**
 * @route   POST /api/addon/addon-datewise
 * @desc    Create addon date-wise availability (bulk)
 * @access  Private
 */
router.post(
    "/",
    addonDateWiseController.createAddonDateWise
);

router.get(
    "/addon/:addonId",
    addonDateWiseController.getAddOnDateWiseById
);

// GET /api/addon/addon-datewise/date?propertyId=...&date=YYYY-MM-DD
router.get(
    "/date",
    addonDateWiseController.getAddOnsByDate
);
/**
 * @route   PUT /api/addon/addon-datewise/addon/:addonId
 * @desc    Update addon availability by addon ID (all dates)
 * @access  Private
 */
router.put(
    "/addon/:addonId",
    addonDateWiseController.updateAddonByAddonId
);

/**
 * @route   PUT /api/addon/addon-datewise/:id
 * @desc    Update addon for a single date
 * @access  Private
 */
router.put(
    "/:id",
    addonDateWiseController.updateAddonForSingleDate
);

/**
 * @route   DELETE /api/addon/addon-datewise/addon/:addonId
 * @desc    Delete addon by addon ID (all dates)
 * @access  Private
 */
router.delete(
    "/addon/:addonId",
    addonDateWiseController.deleteAddonByAddonId
);

/**
 * @route   DELETE /api/addon/addon-datewise/:id
 * @desc    Delete addon for a particular date
 * @access  Private
 */
router.delete(
    "/:id",
    addonDateWiseController.deleteAddonForParticularDate
);

export { router as AddonDateWiseRoutes };
