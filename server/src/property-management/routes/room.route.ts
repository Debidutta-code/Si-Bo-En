import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import {
  checkRoleBased,
} from '../../middlewares/checkRole.middleware';
import {
  RoomController,
} from "../controller";

export const propertyRoomRoute = Router({ mergeParams: true });
propertyRoomRoute
  .route('/')
  .post(protect, checkRoleBased('canCreateHotel'), RoomController.createRoom);
propertyRoomRoute.route('/inv-setup')
  .get(protect, RoomController.getRoomsForInvSetup);
propertyRoomRoute.route('/property-rooms')
  .get(protect, checkRoleBased('canViewHotel'), RoomController.getAllRoomsByPropertyId);
propertyRoomRoute
  .route('/:roomId')
  .get(RoomController.getRoomById)
  .patch(protect, checkRoleBased('canUpdateHotel'), RoomController.updateRoom)
  .delete(protect, checkRoleBased('canDeleteHotel'), RoomController.deleteRoom)
  .put(protect, checkRoleBased('canUpdateHotel'), RoomController.add360ImageToRoom);


