import { Router } from 'express';
import { PromocodeTranslationController } from '../../../controllers/features/promocodes';

const promocodeTranslationRouter = Router();
const promotionTranslationController = new PromocodeTranslationController();

promocodeTranslationRouter.route('/:promocodeId')
  .put(promotionTranslationController.upsert.bind(promotionTranslationController))
  .get(promotionTranslationController.getTranslated.bind(promotionTranslationController));

promocodeTranslationRouter.get('/:promocodeId/all', promotionTranslationController.getAllTranslations.bind(promotionTranslationController));
promocodeTranslationRouter.delete('/:promocodeId/:locale', promotionTranslationController.deleteLocale.bind(promotionTranslationController));

export { promocodeTranslationRouter };
