import { Router } from 'express';
import { PromocodeTranslationController } from '../../../controllers/features/promocodes';

const promocodeTranslationRouter = Router();
const promotionTranslationController = new PromocodeTranslationController();

promocodeTranslationRouter.route('/:promotionId')
  .put(promotionTranslationController.upsert.bind(promotionTranslationController))
  .get(promotionTranslationController.getTranslated.bind(promotionTranslationController));

promocodeTranslationRouter.get('/:promotionId/all', promotionTranslationController.getAllTranslations.bind(promotionTranslationController));
promocodeTranslationRouter.delete('/:promotionId/:locale', promotionTranslationController.deleteLocale.bind(promotionTranslationController));

export { promocodeTranslationRouter };
