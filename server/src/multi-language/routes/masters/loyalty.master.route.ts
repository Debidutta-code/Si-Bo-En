import { Router } from 'express';
import { MasterLoyaltyRegistrationFieldTranslationController } from '../../controllers/masters/loyalty.master.controller';

const masterLoyaltyRegistrationFieldTranslationRouter = Router();
const masterLoyaltyRegistrationFieldTranslationController = new MasterLoyaltyRegistrationFieldTranslationController();

masterLoyaltyRegistrationFieldTranslationRouter.route('/:masterLoyaltyRegistrationFieldId')
  .put(masterLoyaltyRegistrationFieldTranslationController.upsert.bind(masterLoyaltyRegistrationFieldTranslationController))
  .get(masterLoyaltyRegistrationFieldTranslationController.getTranslated.bind(masterLoyaltyRegistrationFieldTranslationController));

masterLoyaltyRegistrationFieldTranslationRouter.get('/:masterLoyaltyRegistrationFieldId/all', masterLoyaltyRegistrationFieldTranslationController.getAllTranslations.bind(masterLoyaltyRegistrationFieldTranslationController));
masterLoyaltyRegistrationFieldTranslationRouter.delete('/:masterLoyaltyRegistrationFieldId/:locale', masterLoyaltyRegistrationFieldTranslationController.deleteLocale.bind(masterLoyaltyRegistrationFieldTranslationController));

export { masterLoyaltyRegistrationFieldTranslationRouter };
