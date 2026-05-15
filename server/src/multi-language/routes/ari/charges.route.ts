import { Router } from 'express';
import { ChargeTranslationController } from '../../controllers/ari/charges.controller';

const chargeTranslationRouter = Router();
const chargeTranslationController = new ChargeTranslationController();

chargeTranslationRouter.route('/:chargeId')
  .put(chargeTranslationController.upsert.bind(chargeTranslationController))
  .get(chargeTranslationController.getTranslated.bind(chargeTranslationController));

chargeTranslationRouter.get('/:chargeId/all', chargeTranslationController.getAllTranslations.bind(chargeTranslationController));
chargeTranslationRouter.delete('/:chargeId/:locale', chargeTranslationController.deleteLocale.bind(chargeTranslationController));

export { chargeTranslationRouter };
