import { Router } from 'express';
import { AddonVariantTranslationController } from '../../../controllers/features/addons';

const addonVariantTranslationRouter = Router();
const addonVariantTranslationController = new AddonVariantTranslationController();

addonVariantTranslationRouter.route('/:addonVariantId')
  .put(addonVariantTranslationController.upsert.bind(addonVariantTranslationController))
  .get(addonVariantTranslationController.getTranslated.bind(addonVariantTranslationController));

addonVariantTranslationRouter.get('/:addonVariantId/all', addonVariantTranslationController.getAllTranslations.bind(addonVariantTranslationController));
addonVariantTranslationRouter.delete('/:addonVariantId/:locale', addonVariantTranslationController.deleteLocale.bind(addonVariantTranslationController));

export { addonVariantTranslationRouter };
