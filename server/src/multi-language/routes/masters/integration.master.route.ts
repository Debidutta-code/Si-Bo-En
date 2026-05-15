import { Router } from 'express';
import { MasterIntegrationTranslationController } from '../../controllers/masters/integration.master.controller';

const masterIntegrationTranslationRouter = Router();
const masterIntegrationTranslationController = new MasterIntegrationTranslationController();

masterIntegrationTranslationRouter.route('/:masterIntegrationId')
  .put(masterIntegrationTranslationController.upsert.bind(masterIntegrationTranslationController))
  .get(masterIntegrationTranslationController.getTranslated.bind(masterIntegrationTranslationController));

masterIntegrationTranslationRouter.get('/:masterIntegrationId/all', masterIntegrationTranslationController.getAllTranslations.bind(masterIntegrationTranslationController));
masterIntegrationTranslationRouter.delete('/:masterIntegrationId/:locale', masterIntegrationTranslationController.deleteLocale.bind(masterIntegrationTranslationController));

export { masterIntegrationTranslationRouter };
