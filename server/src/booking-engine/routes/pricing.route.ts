import { Router } from 'express';
import { PricingController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
const pricingRouter = Router();
const pricingController = new PricingController();

pricingRouter.route('/get-price').post(
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    pricingController.getRoomRentController.bind(pricingController)
);

export { pricingRouter };
