// routes/geoRatePlan.route.ts

import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { GeoRatePlanController } from '../controllers/geo.controller';

export const geoRatePlanRouter = Router();
const geoController = new GeoRatePlanController();
// Create geo rate plan
geoRatePlanRouter.route('/').post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'query',
    }),
    geoController.createGeoRatePlan.bind(geoController)
);

geoRatePlanRouter.route('/property/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    geoController.getGeoRatePlansByPropertyId.bind(geoController)
);

geoRatePlanRouter
    .route('/:id')
    .get(protect, geoController.getGeoRatePlanById.bind(geoController))
    .patch(
        protect,
        checkRoleBased('canUpdateRatePlan'),
        geoController.updateGeoRatePlan.bind(geoController)
    )
    .delete(
        protect,
        checkRoleBased('canDeleteRatePlan'),
        geoController.deleteGeoRatePlan.bind(geoController)
    );
