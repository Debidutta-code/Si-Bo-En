import { Router } from "express";
import { VariantController } from "../controllers";

const router = Router();
const variantController = new VariantController();

router.post(
    "/",
    variantController.createVariant
);


router.get(
    "/",
    variantController.getAllVariants
);


router.get(
    "/:variantId",
    variantController.getVariantById
);


router.get(
    "/subcategory/:subcategoryId",
    variantController.getVariantsBySubCategoryId
);

router.put(
    "/:variantId",
    variantController.updateVariant
);

router.delete(
    "/:variantId",
    variantController.deleteVariant
);


router.post(
    "/:variantId/addons",
    variantController.addAddonToVariant
);


router.delete(
    "/:variantId/addons/:addonId",
    variantController.removeAddonFromVariant
);

export { router as VariantRoutes };
