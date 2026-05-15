import { Router } from 'express';
import { PropertyLoyaltyConfigTranslationController } from '../../controllers/features/loyalty/property-loyalty.controller';

const propertyLoyaltyConfigTranslationRouter = Router();
const propertyLoyaltyConfigTranslationController = new PropertyLoyaltyConfigTranslationController();

propertyLoyaltyConfigTranslationRouter.put('/:propertyLoyaltyConfigId', propertyLoyaltyConfigTranslationController.upsert.bind(propertyLoyaltyConfigTranslationController));
propertyLoyaltyConfigTranslationRouter.get('/:propertyLoyaltyConfigId', propertyLoyaltyConfigTranslationController.getTranslated.bind(propertyLoyaltyConfigTranslationController));
propertyLoyaltyConfigTranslationRouter.get('/:propertyLoyaltyConfigId/all', propertyLoyaltyConfigTranslationController.getAllTranslations.bind(propertyLoyaltyConfigTranslationController));
propertyLoyaltyConfigTranslationRouter.delete('/:propertyLoyaltyConfigId/:locale', propertyLoyaltyConfigTranslationController.deleteLocale.bind(propertyLoyaltyConfigTranslationController));

export { propertyLoyaltyConfigTranslationRouter };
