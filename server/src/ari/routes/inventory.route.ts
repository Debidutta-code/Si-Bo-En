import {InventoryController, RatePlanController} from "../controllers";
import { Router } from 'express';

export const inventoryRouter = Router();


import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { attachPropertyDetails } from "../../middlewares/property.middleware";

inventoryRouter
  .route('/room-types/:hotelCode')
  .get(
    protect,

    checkRoleBased('canAddInventory'),
    attachPropertyDetails({
      identifierType: "code",
      key: "hotelCode",
      source: "params"
    }),
    InventoryController.getRoomTypeController
  );
inventoryRouter
  .route('/create/:propertyId')
  .post(
    protect,
    checkRoleBased('canAddInventory'),
    attachPropertyDetails({
      identifierType: "id",
      key: "propertyId",
      source: "params"
    }),
    InventoryController.createNewInventory
  );
inventoryRouter
  .route('/map/rateplan/:propertyId')
  .put(
    protect,
    checkRoleBased('canMapRatePlan'),
    attachPropertyDetails({
      identifierType: "id",
      key: "propertyId",
      source: "params"
    }),
    InventoryController.mapRatePlans
  );
inventoryRouter
  .route('/get-mapped/rateplan')
  .post(
    protect,
    checkRoleBased('canMapRatePlan'),
    attachPropertyDetails({
      identifierType: "id",
      key: "propertyId",
      source: "body"
    }),
    RatePlanController.getMappedRatePlanByHotel
  );
inventoryRouter
  .route('/update/price')
  .patch(
    protect,
    checkRoleBased('canUpdateRoomPrice'),
    RatePlanController.updateMappedRatePlan
  );
inventoryRouter
  .route('/update-or-create/charges')
  .post(
    protect,
    checkRoleBased('canUpdateRoomPrice'),
    attachPropertyDetails({
      identifierType: "code",
      key: "propertyCode",
      source: "body"
    }),
    RatePlanController.updateOrCreateRatePlanCharges
  );