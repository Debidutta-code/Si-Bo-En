import { Router } from 'express';
import { AddonSubCategoryTranslationController } from '../../controllers/features/addons/sub-catrgory.controller';

const addonSubCategoryTranslationRouter = Router();
const addonSubCategoryTranslationController = new AddonSubCategoryTranslationController();

addonSubCategoryTranslationRouter.put('/:addonSubCategoryId', addonSubCategoryTranslationController.upsert.bind(addonSubCategoryTranslationController));
addonSubCategoryTranslationRouter.get('/:addonSubCategoryId', addonSubCategoryTranslationController.getTranslated.bind(addonSubCategoryTranslationController));
addonSubCategoryTranslationRouter.get('/:addonSubCategoryId/all', addonSubCategoryTranslationController.getAllTranslations.bind(addonSubCategoryTranslationController));
addonSubCategoryTranslationRouter.delete('/:addonSubCategoryId/:locale', addonSubCategoryTranslationController.deleteLocale.bind(addonSubCategoryTranslationController));

export { addonSubCategoryTranslationRouter };
