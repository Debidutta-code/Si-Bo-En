import { Router } from 'express';
import { VariantController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const variantRouter = Router();
const variantController = new VariantController();

variantRouter.use(protect);
variantRouter.route('/')
    .post(attachPropertyDetails({
            identifierType: "id",
            key: "id",
            source: "query"
        }), variantController.createVariant.bind(variantController))
    .get(variantController.getAllVariants.bind(variantController));


variantRouter.get(
    '/subcategory/:subcategoryId',
    variantController.getVariantsBySubCategoryId.bind(variantController)
);

variantRouter.route('/:variantId')
    .get(variantController.getVariantById.bind(variantController))
    .put(variantController.updateVariant.bind(variantController))
    .delete(variantController.deleteVariant.bind(variantController));


export { variantRouter };
