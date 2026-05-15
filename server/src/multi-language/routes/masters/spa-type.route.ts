import { Router } from 'express';
import { SpaCategoryTranslationController, SpaSubCategoryTranslationController } from '../../controllers/masters/spa-type.controller';

const spaCategoryTranslationRouter = Router();
const spaCategoryTranslationController = new SpaCategoryTranslationController();

spaCategoryTranslationRouter.put('/:spaCategoryId', spaCategoryTranslationController.upsert.bind(spaCategoryTranslationController));
spaCategoryTranslationRouter.get('/:spaCategoryId', spaCategoryTranslationController.getTranslated.bind(spaCategoryTranslationController));
spaCategoryTranslationRouter.get('/:spaCategoryId/all', spaCategoryTranslationController.getAllTranslations.bind(spaCategoryTranslationController));
spaCategoryTranslationRouter.delete('/:spaCategoryId/:locale', spaCategoryTranslationController.deleteLocale.bind(spaCategoryTranslationController));

const spaSubCategoryTranslationRouter = Router();
const spaSubCategoryTranslationController = new SpaSubCategoryTranslationController();

spaSubCategoryTranslationRouter.put('/:spaSubCategoryId', spaSubCategoryTranslationController.upsert.bind(spaSubCategoryTranslationController));
spaSubCategoryTranslationRouter.get('/:spaSubCategoryId', spaSubCategoryTranslationController.getTranslated.bind(spaSubCategoryTranslationController));
spaSubCategoryTranslationRouter.get('/:spaSubCategoryId/all', spaSubCategoryTranslationController.getAllTranslations.bind(spaSubCategoryTranslationController));
spaSubCategoryTranslationRouter.delete('/:spaSubCategoryId/:locale', spaSubCategoryTranslationController.deleteLocale.bind(spaSubCategoryTranslationController));

export { spaCategoryTranslationRouter, spaSubCategoryTranslationRouter };
