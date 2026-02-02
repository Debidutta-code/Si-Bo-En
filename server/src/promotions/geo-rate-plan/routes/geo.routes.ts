// routes/geoRatePlan.route.ts

import { Router } from 'express';
import { protect } from '../../../middlewares/auth.middleware';
import { checkRoleBased } from '../../../middlewares/checkRole.middleware';
import { attachPropertyDetails } from '../../../middlewares/property.middleware';
import { GeoRatePlanController } from '../controllers/geo.controller';

export const geoRatePlanRouter = Router();

// Create geo rate plan
geoRatePlanRouter
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'query'
    }),
    GeoRatePlanController.createGeoRatePlan
  );

// Get geo rate plans by property ID with filters
geoRatePlanRouter
  .route('/property/:propertyId')
  .get(
    protect,
    attachPropertyDetails({
      identifierType: 'id',
      key: 'propertyId',
      source: 'params'
    }),
    GeoRatePlanController.getGeoRatePlansByPropertyId
  );

// Get geo rate plans by filters
geoRatePlanRouter
  .route('/filter')
  .get(
    protect,
    GeoRatePlanController.getGeoRatePlansByFilters
  );

// Get, update, delete geo rate plan by ID
geoRatePlanRouter
  .route('/:id')
  .get(
    protect,
    GeoRatePlanController.getGeoRatePlanById
  )
  .patch(
    protect,
    checkRoleBased('canUpdateRatePlan'),
    GeoRatePlanController.updateGeoRatePlan
  )
  .delete(
    protect,
    checkRoleBased('canDeleteRatePlan'),
    GeoRatePlanController.deleteGeoRatePlan
  );