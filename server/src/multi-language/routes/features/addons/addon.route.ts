import { Router } from 'express';
import { AddonTranslationController } from '../../controllers/features/addons/addon.controller';

const addonTranslationRouter = Router();
const addonTranslationController = new AddonTranslationController();

addonTranslationRouter.put('/:addonId', addonTranslationController.upsert.bind(addonTranslationController));
addonTranslationRouter.get('/:addonId', addonTranslationController.getTranslated.bind(addonTranslationController));
addonTranslationRouter.get('/:addonId/all', addonTranslationController.getAllTranslations.bind(addonTranslationController));
addonTranslationRouter.delete('/:addonId/:locale', addonTranslationController.deleteLocale.bind(addonTranslationController));

export { addonTranslationRouter };
