import { Router } from 'express';
import { TouristTaxTranslationController } from '../../controllers/features/tax-system/tourist-tax.controller';

const touristTaxTranslationRouter = Router();
const touristTaxTranslationController = new TouristTaxTranslationController();

touristTaxTranslationRouter.route('/:touristTaxId')
  .put(touristTaxTranslationController.upsert.bind(touristTaxTranslationController))
  .get(touristTaxTranslationController.getTranslated.bind(touristTaxTranslationController));

touristTaxTranslationRouter.get('/:touristTaxId/all', touristTaxTranslationController.getAllTranslations.bind(touristTaxTranslationController));
touristTaxTranslationRouter.delete('/:touristTaxId/:locale', touristTaxTranslationController.deleteLocale.bind(touristTaxTranslationController));

export { touristTaxTranslationRouter };
