import { Router } from 'express';
import { ChargeTranslationController } from '../../controllers/ari/charges.controller';

const chargeTranslationRouter = Router();
const chargeTranslationController = new ChargeTranslationController();

chargeTranslationRouter.put('/:chargeId', chargeTranslationController.upsert.bind(chargeTranslationController));
chargeTranslationRouter.get('/:chargeId', chargeTranslationController.getTranslated.bind(chargeTranslationController));
chargeTranslationRouter.get('/:chargeId/all', chargeTranslationController.getAllTranslations.bind(chargeTranslationController));
chargeTranslationRouter.delete('/:chargeId/:locale', chargeTranslationController.deleteLocale.bind(chargeTranslationController));

export { chargeTranslationRouter };
