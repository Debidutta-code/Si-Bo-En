import { Router } from 'express';
import { PromoCodeController } from '../controller';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();
const promoCodeController = new PromoCodeController();

router.route('/').post(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    promoCodeController.createPromoCode.bind(promoCodeController)
);
router.route('verify').post(
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    promoCodeController.validatePromoCodeController.bind(promoCodeController)
);
router
    .route('/:id')
    .patch(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'promoCodeData.propertyId',
            source: 'body',
        }),
        promoCodeController.updatePromoCode.bind(promoCodeController)
    )
    .delete(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        promoCodeController.deletePromoCode.bind(promoCodeController)
    );

router.route('/property/:propertyId').get(
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    promoCodeController.getAllPromoCodesByPropertyId.bind(promoCodeController)
);
router.route('/property/:propertyId/:query').get(
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    promoCodeController.getPromoCodeByParams.bind(promoCodeController)
);
router.route('/recover/:propertyId/:id').patch(
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    promoCodeController.recoverPromoCode.bind(promoCodeController)
);

export default router;
