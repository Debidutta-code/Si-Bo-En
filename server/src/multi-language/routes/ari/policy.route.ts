import { Router } from 'express';
import { PolicyTranslationController } from '../../controllers/ari/policy.controller';

const policyTranslationRouter = Router();
const policyTranslationController = new PolicyTranslationController();

policyTranslationRouter.route('/:policyId')
  .put(policyTranslationController.upsert.bind(policyTranslationController))
  .get(policyTranslationController.getTranslated.bind(policyTranslationController));

policyTranslationRouter.get('/:policyId/all', policyTranslationController.getAllTranslations.bind(policyTranslationController));
policyTranslationRouter.delete('/:policyId/:locale', policyTranslationController.deleteLocale.bind(policyTranslationController));

export { policyTranslationRouter };
