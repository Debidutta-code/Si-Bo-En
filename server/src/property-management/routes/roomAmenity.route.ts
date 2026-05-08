import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import { RoomAminityController } from '../controller';

const roomAminityController = new RoomAminityController();
export const roomAminityRoute = Router({ mergeParams: true });
roomAminityRoute
    .route('/')
    .get(
        roomAminityController.findAminityByRoomIdController.bind(
            roomAminityController
        )
    )
    .post(
        protect,
        checkRoleBased('canCreateHotel'),
        roomAminityController.createRoomAminityController.bind(
            roomAminityController
        )
    )
    .patch(
        protect,
        checkRoleBased('canUpdateHotel'),
        roomAminityController.updateAminityByPropertyIdController.bind(
            roomAminityController
        )
    )
    .delete(
        protect,
        checkRoleBased('canDeleteHotel'),
        roomAminityController.deleteAminityByPropertyIdController.bind(
            roomAminityController
        )
    );
