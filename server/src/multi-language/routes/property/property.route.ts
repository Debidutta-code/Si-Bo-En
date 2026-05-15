import { Router } from 'express';
import { PropertyTranslationController } from '../../controllers/property/property.controller';

const propertyTranslationRouter = Router();
const propertyTranslationController = new PropertyTranslationController();

propertyTranslationRouter.route('/:propertyId')
  .put(propertyTranslationController.upsert.bind(propertyTranslationController))
  .get(propertyTranslationController.getTranslated.bind(propertyTranslationController));

propertyTranslationRouter.get('/:propertyId/all', propertyTranslationController.getAllTranslations.bind(propertyTranslationController));
propertyTranslationRouter.delete('/:propertyId/:locale', propertyTranslationController.deleteLocale.bind(propertyTranslationController));

export { propertyTranslationRouter };
