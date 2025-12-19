import { Router } from 'express';
import { PromoCodeController } from '../controller';

const router = Router();
const promoCodeController = new PromoCodeController();

router.route("/").post(promoCodeController.createPromoCode.bind(promoCodeController));
router.route("/:id")
    .patch(promoCodeController.updatePromoCode.bind(promoCodeController))
    .delete(promoCodeController.deletePromoCode.bind(promoCodeController));
router.route("/property/:propertyId").get(promoCodeController.getAllPromoCodesByPropertyId.bind(promoCodeController));
router.route("/property/:propertyId/:query").get(promoCodeController.getPromoCodeByParams.bind(promoCodeController));
router.route("/recover/:propertyId/:id").patch(promoCodeController.recoverPromoCode.bind(promoCodeController));

export default router;




