import { Router } from 'express';
import { PropertyAddressTranslationController } from '../../controllers/property/property-address.controller';

const propertyAddressTranslationRouter = Router();
const propertyAddressTranslationController = new PropertyAddressTranslationController();

propertyAddressTranslationRouter.route('/:propertyAddressId')
  .put(propertyAddressTranslationController.upsert.bind(propertyAddressTranslationController))
  .get(propertyAddressTranslationController.getTranslated.bind(propertyAddressTranslationController));

propertyAddressTranslationRouter.get('/:propertyAddressId/all', propertyAddressTranslationController.getAllTranslations.bind(propertyAddressTranslationController));
propertyAddressTranslationRouter.delete('/:propertyAddressId/:locale', propertyAddressTranslationController.deleteLocale.bind(propertyAddressTranslationController));

export { propertyAddressTranslationRouter };
