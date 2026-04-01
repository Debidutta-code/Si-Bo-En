import { InventoryController, RatePlanController } from "../controllers";
import { Router } from 'express';

export const inventoryRouter = Router();


import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from "../../middlewares/checkRole.middleware";
import { attachPropertyDetails } from "../../middlewares/property.middleware";
const inventoryController = new InventoryController();

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
    inventoryController.getRoomTypeController.bind(inventoryController)
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
    inventoryController.createNewInventory.bind(inventoryController)
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
    inventoryController.mapRatePlans.bind(inventoryController)
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
inventoryRouter.route('/availability')
  .get(
    protect,
    checkRoleBased('canUpdateRoomPrice'),
    attachPropertyDetails({
      identifierType: "id",
      key: "propertyId",
      source: "query"
    }),
    inventoryController.getRoomAvailibility.bind(inventoryController)
  );