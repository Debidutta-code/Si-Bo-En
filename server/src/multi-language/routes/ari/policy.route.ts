import { Router } from 'express';
import { PolicyTranslationController } from '../../controllers/ari/policy.controller';

const policyTranslationRouter = Router();
const policyTranslationController = new PolicyTranslationController();

policyTranslationRouter.put('/:policyId', policyTranslationController.upsert.bind(policyTranslationController));
policyTranslationRouter.get('/:policyId', policyTranslationController.getTranslated.bind(policyTranslationController));
policyTranslationRouter.get('/:policyId/all', policyTranslationController.getAllTranslations.bind(policyTranslationController));
policyTranslationRouter.delete('/:policyId/:locale', policyTranslationController.deleteLocale.bind(policyTranslationController));

export { policyTranslationRouter };
