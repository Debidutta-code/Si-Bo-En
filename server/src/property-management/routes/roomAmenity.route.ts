import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
  checkRoleBased
} from '../../middlewares/checkRole.middleware';
import {
  RoomAminityController,
} from "../controller";


export const roomAminityRoute = Router({ mergeParams: true });
roomAminityRoute
  .route('/')
  .get(RoomAminityController.findAminityByRoomIdController)
  .post(
    protect,
    checkRoleBased('canCreateHotel'),
    RoomAminityController.createRoomAminityController
  )
  .patch(
    protect,
    checkRoleBased('canUpdateHotel'),
    RoomAminityController.updateAminityByPropertyIdController
  )
  .delete(
    protect,
    checkRoleBased('canDeleteHotel'),
    RoomAminityController.deleteAminityByPropertyIdController
  );