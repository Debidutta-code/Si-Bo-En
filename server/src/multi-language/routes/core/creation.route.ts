import { Router } from 'express';
import { CreationTranslationController } from '../../controllers/core/creation.controller';

const creationTranslationRouter = Router();
const creationTranslationController = new CreationTranslationController();

creationTranslationRouter.route('/:creationId')
  .put(creationTranslationController.upsert.bind(creationTranslationController))
  .get(creationTranslationController.getTranslated.bind(creationTranslationController));

creationTranslationRouter.get('/:creationId/all', creationTranslationController.getAllTranslations.bind(creationTranslationController));
creationTranslationRouter.delete('/:creationId/:locale', creationTranslationController.deleteLocale.bind(creationTranslationController));

export { creationTranslationRouter };
