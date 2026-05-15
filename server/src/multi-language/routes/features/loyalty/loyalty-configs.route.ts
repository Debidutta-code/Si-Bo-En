import { Router } from 'express';
import { LoyaltyConditionsTranslationController, LoyaltySpecialConditionTranslationController } from '../../../controllers/features/loyalty';

const loyaltyConditionsTranslationRouter = Router();
const loyaltyConditionsTranslationController = new LoyaltyConditionsTranslationController();

loyaltyConditionsTranslationRouter.route('/:loyaltyConditionId')
  .put(loyaltyConditionsTranslationController.upsert.bind(loyaltyConditionsTranslationController))
  .get(loyaltyConditionsTranslationController.getTranslated.bind(loyaltyConditionsTranslationController));

loyaltyConditionsTranslationRouter.get('/:loyaltyConditionId/all', loyaltyConditionsTranslationController.getAllTranslations.bind(loyaltyConditionsTranslationController));
loyaltyConditionsTranslationRouter.delete('/:loyaltyConditionId/:locale', loyaltyConditionsTranslationController.deleteLocale.bind(loyaltyConditionsTranslationController));

const loyaltySpecialConditionTranslationRouter = Router();
const loyaltySpecialConditionTranslationController = new LoyaltySpecialConditionTranslationController();

loyaltySpecialConditionTranslationRouter.route('/:loyaltySpecialConditionId')
  .put(loyaltySpecialConditionTranslationController.upsert.bind(loyaltySpecialConditionTranslationController))
  .get(loyaltySpecialConditionTranslationController.getTranslated.bind(loyaltySpecialConditionTranslationController));

loyaltySpecialConditionTranslationRouter.get('/:loyaltySpecialConditionId/all', loyaltySpecialConditionTranslationController.getAllTranslations.bind(loyaltySpecialConditionTranslationController));
loyaltySpecialConditionTranslationRouter.delete('/:loyaltySpecialConditionId/:locale', loyaltySpecialConditionTranslationController.deleteLocale.bind(loyaltySpecialConditionTranslationController));

export { loyaltyConditionsTranslationRouter, loyaltySpecialConditionTranslationRouter };
