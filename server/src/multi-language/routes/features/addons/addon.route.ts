import { Router } from 'express';
import { AddonTranslationController } from '../../controllers/features/addons/addon.controller';

const addonTranslationRouter = Router();
const addonTranslationController = new AddonTranslationController();

addonTranslationRouter.route('/:addonId')
  .put(addonTranslationController.upsert.bind(addonTranslationController))
  .get(addonTranslationController.getTranslated.bind(addonTranslationController));

addonTranslationRouter.get('/:addonId/all', addonTranslationController.getAllTranslations.bind(addonTranslationController));
addonTranslationRouter.delete('/:addonId/:locale', addonTranslationController.deleteLocale.bind(addonTranslationController));

export { addonTranslationRouter };
