import { Router } from 'express';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import { PropertyDetailsController } from '../controllers';
const propertyDetailsRouter = Router();
const propertyDetailsController = new PropertyDetailsController();

propertyDetailsRouter.route('/get-property-details/:propertyCode').get(
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'params',
    }),
    propertyDetailsController.getPropertyDetailsController.bind(propertyDetailsController)
);

export { propertyDetailsRouter };
