import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
  checkRoleBased
} from '../../middlewares/checkRole.middleware';
import {
  PropertyAminityController,
} from "../controller";


export const propertyAminityRoute = Router({ mergeParams: true });
propertyAminityRoute
  .route('/')
  .get(
    protect,
    checkRoleBased('canViewHotel'),
    PropertyAminityController.findAminityByPropertyIdController
  )
  .post(
    protect,
    checkRoleBased('canCreateHotel'),
    PropertyAminityController.createPropertyAminityController
  )
  .patch(
    protect,
    checkRoleBased('canUpdateHotel'),
    PropertyAminityController.updateAminityByPropertyIdController
  )
  .delete(
    protect,
    checkRoleBased('canDeleteHotel'),
    PropertyAminityController.deleteAminityByPropertyIdController
  );