import { Router } from 'express';
import { creationTranslationRouter } from './core/creation.route';
import { propertyTranslationRouter } from './property/property.route';
import { propertyAddressTranslationRouter } from './property/property-address.route';
import { masterPropertyCategoryTranslationRouter } from './property/property-masters.route';
import { masterPropertyTypeTranslationRouter } from './property/property-masters.route';
import { masterAmenityTranslationRouter } from './property/property-masters.route';
import { masterRoomViewTranslationRouter } from './property/property-masters.route';
import { loyaltyConditionsTranslationRouter } from './features/loyalty/loyalty-configs.route';
import { loyaltySpecialConditionTranslationRouter } from './features/loyalty/loyalty-configs.route';
import { promocodeTranslationRouter } from './features/promocodes/promocodes.route';
import { promotionTranslationRouter } from './features/promotions/promotions.route';
import { touristTaxTranslationRouter } from './features/tax-system/tourist-tax.route';
import { taxRuleTranslationRouter } from './features/tax-system/tax-system.route';
import { taxGroupTranslationRouter } from './features/tax-system/tax-system.route';
import { spaTranslationRouter } from './features/spa/spa.route';
import { addonVariantTranslationRouter } from './features/addons/variant.route';
import { addonTranslationRouter } from './features/addons/addon.route';
import { addonCategoryTranslationRouter } from './features/addons/category.route';
import { addonSubCategoryTranslationRouter } from './features/addons/sub-catrgory.route';
import { roomTranslationRouter } from './room/rooms.route';
import { ratePlanTranslationRouter } from './ari/rate-plan.route';
import { policyTranslationRouter } from './ari/policy.route';
import { masterIntegrationTranslationRouter } from './masters/integration.master.route';
import { spaCategoryTranslationRouter } from './masters/spa-type.route';
import { spaSubCategoryTranslationRouter } from './masters/spa-type.route';
import { masterLoyaltyRegistrationFieldTranslationRouter } from './masters/loyalty.master.route';
import { protect } from '../../middlewares/auth.middleware';

const multiLanguageRouter = Router();
multiLanguageRouter.use(protect);
multiLanguageRouter.use('/creation', creationTranslationRouter);// i
multiLanguageRouter.use('/property', propertyTranslationRouter);// i
multiLanguageRouter.use('/property-address', propertyAddressTranslationRouter);// i
multiLanguageRouter.use('/master-property-category', masterPropertyCategoryTranslationRouter);//i
multiLanguageRouter.use('/master-property-type', masterPropertyTypeTranslationRouter);//i
multiLanguageRouter.use('/master-amenity', masterAmenityTranslationRouter);//i
multiLanguageRouter.use('/master-room-view', masterRoomViewTranslationRouter);//i
multiLanguageRouter.use('/loyalty-condition', loyaltyConditionsTranslationRouter);//i
multiLanguageRouter.use('/loyalty-special-condition', loyaltySpecialConditionTranslationRouter);//i
multiLanguageRouter.use('/promotion', promotionTranslationRouter);//i
multiLanguageRouter.use('/promocode', promocodeTranslationRouter);//i
multiLanguageRouter.use('/tourist-tax', touristTaxTranslationRouter);
multiLanguageRouter.use('/tax-rule', taxRuleTranslationRouter);//
multiLanguageRouter.use('/tax-group', taxGroupTranslationRouter);//
multiLanguageRouter.use('/spa', spaTranslationRouter);//
multiLanguageRouter.use('/addon-variant', addonVariantTranslationRouter);//
multiLanguageRouter.use('/addon', addonTranslationRouter);//
multiLanguageRouter.use('/addon-category', addonCategoryTranslationRouter);//
multiLanguageRouter.use('/addon-sub-category', addonSubCategoryTranslationRouter);//
multiLanguageRouter.use('/room', roomTranslationRouter);// i
multiLanguageRouter.use('/rate-plan', ratePlanTranslationRouter);//i
multiLanguageRouter.use('/policy', policyTranslationRouter);//
multiLanguageRouter.use('/master-integration', masterIntegrationTranslationRouter);//i
multiLanguageRouter.use('/spa-category', spaCategoryTranslationRouter);//i
multiLanguageRouter.use('/spa-sub-category', spaSubCategoryTranslationRouter);//i
multiLanguageRouter.use('/master-loyalty-registration-field', masterLoyaltyRegistrationFieldTranslationRouter);//i

export { multiLanguageRouter };
