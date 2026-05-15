import { Router } from 'express';
import { LoyaltyConditionsTranslationController, LoyaltySpecialConditionTranslationController } from '../../controllers/features/loyalty/loyalty-configs.controller';

const loyaltyConditionsTranslationRouter = Router();
const loyaltyConditionsTranslationController = new LoyaltyConditionsTranslationController();

loyaltyConditionsTranslationRouter.put('/:loyaltyConditionId', loyaltyConditionsTranslationController.upsert.bind(loyaltyConditionsTranslationController));
loyaltyConditionsTranslationRouter.get('/:loyaltyConditionId', loyaltyConditionsTranslationController.getTranslated.bind(loyaltyConditionsTranslationController));
loyaltyConditionsTranslationRouter.get('/:loyaltyConditionId/all', loyaltyConditionsTranslationController.getAllTranslations.bind(loyaltyConditionsTranslationController));
loyaltyConditionsTranslationRouter.delete('/:loyaltyConditionId/:locale', loyaltyConditionsTranslationController.deleteLocale.bind(loyaltyConditionsTranslationController));

const loyaltySpecialConditionTranslationRouter = Router();
const loyaltySpecialConditionTranslationController = new LoyaltySpecialConditionTranslationController();

loyaltySpecialConditionTranslationRouter.put('/:loyaltySpecialConditionId', loyaltySpecialConditionTranslationController.upsert.bind(loyaltySpecialConditionTranslationController));
loyaltySpecialConditionTranslationRouter.get('/:loyaltySpecialConditionId', loyaltySpecialConditionTranslationController.getTranslated.bind(loyaltySpecialConditionTranslationController));
loyaltySpecialConditionTranslationRouter.get('/:loyaltySpecialConditionId/all', loyaltySpecialConditionTranslationController.getAllTranslations.bind(loyaltySpecialConditionTranslationController));
loyaltySpecialConditionTranslationRouter.delete('/:loyaltySpecialConditionId/:locale', loyaltySpecialConditionTranslationController.deleteLocale.bind(loyaltySpecialConditionTranslationController));

export { loyaltyConditionsTranslationRouter, loyaltySpecialConditionTranslationRouter };
