import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
  checkRoleBased,
  addRoleBasedDetails,
  checkMultiplePermissions,
} from '../../middlewares/checkRole.middleware';
import {BankController,
  RoomController,
  RoomAminityController,
  Property,
  PropertyAddressController,
  PropertyAminityController,
  Category,
  PropertyType,
  DestinationType,
  AminityController,
  RoomAminityControllerManagement,
} from "../controller";


export const propertyAddressRoute = Router({ mergeParams: true });

propertyAddressRoute
  .route('/')
  .get(
    protect,
    checkRoleBased('canViewHotel'),
    PropertyAddressController.findAddressByPropertyIdController
  )
  .post(
    protect,
    checkRoleBased('canCreateHotel'),
    PropertyAddressController.createPropertyAddressController
  )
  .patch(
    protect,
    checkRoleBased('canUpdateHotel'),
    PropertyAddressController.updateAddressByPropertyIdController
  )
  .delete(
    protect,
    checkRoleBased('canDeleteHotel'),
    PropertyAddressController.deleteAddressByPropertyIdController
  );
