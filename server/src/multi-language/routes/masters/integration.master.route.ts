import { Router } from 'express';
import { MasterIntegrationTranslationController } from '../../controllers/masters/integration.master.controller';

const masterIntegrationTranslationRouter = Router();
const masterIntegrationTranslationController = new MasterIntegrationTranslationController();

masterIntegrationTranslationRouter.put('/:masterIntegrationId', masterIntegrationTranslationController.upsert.bind(masterIntegrationTranslationController));
masterIntegrationTranslationRouter.get('/:masterIntegrationId', masterIntegrationTranslationController.getTranslated.bind(masterIntegrationTranslationController));
masterIntegrationTranslationRouter.get('/:masterIntegrationId/all', masterIntegrationTranslationController.getAllTranslations.bind(masterIntegrationTranslationController));
masterIntegrationTranslationRouter.delete('/:masterIntegrationId/:locale', masterIntegrationTranslationController.deleteLocale.bind(masterIntegrationTranslationController));

export { masterIntegrationTranslationRouter };
