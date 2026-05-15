import { Router } from 'express';
import { AddonCategoryTranslationController } from '../../controllers/features/addons/category.controller';

const addonCategoryTranslationRouter = Router();
const addonCategoryTranslationController = new AddonCategoryTranslationController();

addonCategoryTranslationRouter.put('/:addonCategoryId', addonCategoryTranslationController.upsert.bind(addonCategoryTranslationController));
addonCategoryTranslationRouter.get('/:addonCategoryId', addonCategoryTranslationController.getTranslated.bind(addonCategoryTranslationController));
addonCategoryTranslationRouter.get('/:addonCategoryId/all', addonCategoryTranslationController.getAllTranslations.bind(addonCategoryTranslationController));
addonCategoryTranslationRouter.delete('/:addonCategoryId/:locale', addonCategoryTranslationController.deleteLocale.bind(addonCategoryTranslationController));

export { addonCategoryTranslationRouter };
