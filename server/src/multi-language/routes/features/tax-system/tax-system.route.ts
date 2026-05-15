import { Router } from 'express';
import { TaxRuleTranslationController, TaxGroupTranslationController } from '../../controllers/features/tax-system/tax-system.controller';

const taxRuleTranslationRouter = Router();
const taxRuleTranslationController = new TaxRuleTranslationController();

taxRuleTranslationRouter.route('/:taxRuleId')
  .put(taxRuleTranslationController.upsert.bind(taxRuleTranslationController))
  .get(taxRuleTranslationController.getTranslated.bind(taxRuleTranslationController));

taxRuleTranslationRouter.get('/:taxRuleId/all', taxRuleTranslationController.getAllTranslations.bind(taxRuleTranslationController));
taxRuleTranslationRouter.delete('/:taxRuleId/:locale', taxRuleTranslationController.deleteLocale.bind(taxRuleTranslationController));

const taxGroupTranslationRouter = Router();
const taxGroupTranslationController = new TaxGroupTranslationController();

taxGroupTranslationRouter.route('/:taxGroupId')
  .put(taxGroupTranslationController.upsert.bind(taxGroupTranslationController))
  .get(taxGroupTranslationController.getTranslated.bind(taxGroupTranslationController));

taxGroupTranslationRouter.get('/:taxGroupId/all', taxGroupTranslationController.getAllTranslations.bind(taxGroupTranslationController));
taxGroupTranslationRouter.delete('/:taxGroupId/:locale', taxGroupTranslationController.deleteLocale.bind(taxGroupTranslationController));

export { taxRuleTranslationRouter, taxGroupTranslationRouter };
