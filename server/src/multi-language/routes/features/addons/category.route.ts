import { Router } from 'express';
import { AddonCategoryTranslationController } from '../../../controllers/features/addons';

const addonCategoryTranslationRouter = Router();
const addonCategoryTranslationController = new AddonCategoryTranslationController();

addonCategoryTranslationRouter.route('/:addonCategoryId')
  .put(addonCategoryTranslationController.upsert.bind(addonCategoryTranslationController))
  .get(addonCategoryTranslationController.getTranslated.bind(addonCategoryTranslationController));

addonCategoryTranslationRouter.get('/:addonCategoryId/all', addonCategoryTranslationController.getAllTranslations.bind(addonCategoryTranslationController));
addonCategoryTranslationRouter.delete('/:addonCategoryId/:locale', addonCategoryTranslationController.deleteLocale.bind(addonCategoryTranslationController));

export { addonCategoryTranslationRouter };
