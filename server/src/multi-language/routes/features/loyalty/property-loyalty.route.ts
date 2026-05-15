import { Router } from 'express';
import { PropertyLoyaltyConfigTranslationController } from '../../../controllers/features/loyalty';

const propertyLoyaltyConfigTranslationRouter = Router();
const propertyLoyaltyConfigTranslationController = new PropertyLoyaltyConfigTranslationController();

propertyLoyaltyConfigTranslationRouter.route('/:propertyLoyaltyConfigId')
  .put(propertyLoyaltyConfigTranslationController.upsert.bind(propertyLoyaltyConfigTranslationController))
  .get(propertyLoyaltyConfigTranslationController.getTranslated.bind(propertyLoyaltyConfigTranslationController));

propertyLoyaltyConfigTranslationRouter.get('/:propertyLoyaltyConfigId/all', propertyLoyaltyConfigTranslationController.getAllTranslations.bind(propertyLoyaltyConfigTranslationController));
propertyLoyaltyConfigTranslationRouter.delete('/:propertyLoyaltyConfigId/:locale', propertyLoyaltyConfigTranslationController.deleteLocale.bind(propertyLoyaltyConfigTranslationController));

export { propertyLoyaltyConfigTranslationRouter };
