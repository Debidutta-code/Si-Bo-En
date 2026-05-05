import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkMultiplePermissions, checkRoleBased } from '../../middlewares/checkRole.middleware';
import { RoomAminityController } from '../controllers';

const roomAminityController = new RoomAminityController();
const roomAminityRouteM = Router();

roomAminityRouteM
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        roomAminityController.getRoomAmenities.bind(roomAminityController)
    );

roomAminityRouteM
    .route('/')
    .post(
        protect,
        checkRoleBased('canCDAmenity'),
        roomAminityController.createRoomAminity.bind(roomAminityController)
    );

roomAminityRouteM
    .route('/')
    .delete(
        protect,
        checkRoleBased('canCDAmenity'),
        roomAminityController.deleteRoomAmenities.bind(roomAminityController)
    );
export { roomAminityRouteM };