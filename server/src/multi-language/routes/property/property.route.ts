import { Router } from 'express';
import { PropertyTranslationController } from '../../controllers/property/property.controller';

const propertyTranslationRouter = Router();
const propertyTranslationController = new PropertyTranslationController();

propertyTranslationRouter.put('/:propertyId', propertyTranslationController.upsert.bind(propertyTranslationController));
propertyTranslationRouter.get('/:propertyId', propertyTranslationController.getTranslated.bind(propertyTranslationController));
propertyTranslationRouter.get('/:propertyId/all', propertyTranslationController.getAllTranslations.bind(propertyTranslationController));
propertyTranslationRouter.delete('/:propertyId/:locale', propertyTranslationController.deleteLocale.bind(propertyTranslationController));

export { propertyTranslationRouter };
