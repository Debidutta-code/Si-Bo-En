import { Router } from 'express';
import { RatePlanTranslationController } from '../../controllers/ari/rate-plan.controller';

const ratePlanTranslationRouter = Router();
const ratePlanTranslationController = new RatePlanTranslationController();

ratePlanTranslationRouter.route('/:ratePlanId')
  .put(ratePlanTranslationController.upsert.bind(ratePlanTranslationController))
  .get(ratePlanTranslationController.getTranslated.bind(ratePlanTranslationController));

ratePlanTranslationRouter.get('/:ratePlanId/all', ratePlanTranslationController.getAllTranslations.bind(ratePlanTranslationController));
ratePlanTranslationRouter.delete('/:ratePlanId/:locale', ratePlanTranslationController.deleteLocale.bind(ratePlanTranslationController));

export { ratePlanTranslationRouter };
