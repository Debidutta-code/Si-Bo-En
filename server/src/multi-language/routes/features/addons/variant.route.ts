import { Router } from 'express';
import { AddonVariantTranslationController } from '../../controllers/features/addons/variant.controller';

const addonVariantTranslationRouter = Router();
const addonVariantTranslationController = new AddonVariantTranslationController();

addonVariantTranslationRouter.put('/:addonVariantId', addonVariantTranslationController.upsert.bind(addonVariantTranslationController));
addonVariantTranslationRouter.get('/:addonVariantId', addonVariantTranslationController.getTranslated.bind(addonVariantTranslationController));
addonVariantTranslationRouter.get('/:addonVariantId/all', addonVariantTranslationController.getAllTranslations.bind(addonVariantTranslationController));
addonVariantTranslationRouter.delete('/:addonVariantId/:locale', addonVariantTranslationController.deleteLocale.bind(addonVariantTranslationController));

export { addonVariantTranslationRouter };
