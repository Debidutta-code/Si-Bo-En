import {InventoryController, RatePlanController} from "../controllers";
import { Router } from 'express';

export const inventoryRouter = Router();


import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from "../../middlewares/checkRole.middleware";

inventoryRouter
  .route('/room-types/:hotelCode')
  .get(
    protect,
    checkRoleBased('canAddInventory'),
    InventoryController.getRoomTypeController
  );
inventoryRouter
  .route('/create/:propertyId')
  .post(
    protect,
    checkRoleBased('canAddInventory'),
    InventoryController.createNewInventory
  );
inventoryRouter
  .route('/map/rateplan/:propertyId')
  .put(
    protect,
    checkRoleBased('canMapRatePlan'),
    InventoryController.mapRatePlans
  );
inventoryRouter
  .route('/get-mapped/rateplan')
  .post(
    protect,
    checkRoleBased('canMapRatePlan'),
    RatePlanController.getMappedRatePlanByHotel
  );
inventoryRouter
  .route('/update/price')
  .patch(
    protect,
    checkRoleBased('canUpdateRoomPrice'),
    RatePlanController.updateMappedRatePlan
  );