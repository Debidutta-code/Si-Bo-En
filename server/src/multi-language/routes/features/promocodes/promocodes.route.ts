import { Router } from 'express';
import { PromotionTranslationController } from '../../controllers/features/promocodes/promocodes.controller';

const promotionTranslationRouter = Router();
const promotionTranslationController = new PromotionTranslationController();

promotionTranslationRouter.route('/:promotionId')
  .put(promotionTranslationController.upsert.bind(promotionTranslationController))
  .get(promotionTranslationController.getTranslated.bind(promotionTranslationController));

promotionTranslationRouter.get('/:promotionId/all', promotionTranslationController.getAllTranslations.bind(promotionTranslationController));
promotionTranslationRouter.delete('/:promotionId/:locale', promotionTranslationController.deleteLocale.bind(promotionTranslationController));

export { promotionTranslationRouter };
