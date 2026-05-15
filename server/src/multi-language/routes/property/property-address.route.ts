import { Router } from 'express';
import { PropertyAddressTranslationController } from '../../controllers/property/property-address.controller';

const propertyAddressTranslationRouter = Router();
const propertyAddressTranslationController = new PropertyAddressTranslationController();

propertyAddressTranslationRouter.put('/:propertyAddressId', propertyAddressTranslationController.upsert.bind(propertyAddressTranslationController));
propertyAddressTranslationRouter.get('/:propertyAddressId', propertyAddressTranslationController.getTranslated.bind(propertyAddressTranslationController));
propertyAddressTranslationRouter.get('/:propertyAddressId/all', propertyAddressTranslationController.getAllTranslations.bind(propertyAddressTranslationController));
propertyAddressTranslationRouter.delete('/:propertyAddressId/:locale', propertyAddressTranslationController.deleteLocale.bind(propertyAddressTranslationController));

export { propertyAddressTranslationRouter };
