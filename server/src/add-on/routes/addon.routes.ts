import { Router } from "express";
import { AddonController } from "../controllers";

const router = Router();
const addonController = new AddonController();

/**
 * @route   POST /api/addon/addons
 * @desc    Create a new addon
 * @access  Private
 */
router.post(
    "/",
    addonController.createAddon
);

/**
 * @route   GET /api/addon/addons/property/:propertyId
 * @desc    Get all addons by property ID
 * @access  Public
 */
router.get(
    "/property/:propertyId",
    addonController.getAllAddonsByPropertyId
);

/**
 * @route   GET /api/addon/addons/booking/:propertyId
 * @desc    Get all active addons by property ID with category details for booking
 * @access  Public
 */
router.get(
    "/booking/:propertyId",
    addonController.getAddonsForBooking
);

/**
 * @route   GET /api/addon/addons/:addonId
 * @desc    Get addon by ID
 * @access  Public
 */
router.get(
    "/:addonId",
    addonController.getAddonById
);

/**
 * @route   PUT /api/addon/addons/:addonId
 * @desc    Update addon
 * @access  Private
 */
router.put(
    "/:addonId",
    addonController.updateAddon
);

/**
 * @route   DELETE /api/addon/addons/:addonId
 * @desc    Delete addon
 * @access  Private
 */
router.delete(
    "/:addonId",
    addonController.deleteAddon
);

export { router as AddonRoutes };
