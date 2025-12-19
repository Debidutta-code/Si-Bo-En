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

export const paymentDetailsRoute = Router({ mergeParams: true });
paymentDetailsRoute
  .route('/')
  .post(
    protect,
    checkRoleBased('canCreateHotel'),
    BankController.addBankDetails
  )
  .get(BankController.getBankDetailsByPropertyId)
  .patch(
    protect,
    checkRoleBased('canUpdatePaymentDetails'),
    BankController.updateBankDetailsByPropertyId
  )
  .put(
    protect,
    checkRoleBased('canUpdatePaymentDetails'),
    BankController.updatePaymentMethodsByPropertyId
  );