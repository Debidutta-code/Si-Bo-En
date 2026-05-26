import { Router } from 'express';
import { RoomWishController } from '../controller/room-wish.controller';
import { customerProtect } from '../../../middlewares/customer-auth.middleware';
const roomWishlistRouter = Router();
const roomWishController = new RoomWishController();

roomWishlistRouter.use(customerProtect);

roomWishlistRouter
    .route('/')
    .post(roomWishController.addRoomToWishlist.bind(roomWishController));

roomWishlistRouter
    .route('/:roomId')
    .delete(roomWishController.removeRoomFromWishlist.bind(roomWishController));

roomWishlistRouter
    .route('/property/:propertyWishlistId')
    .get(roomWishController.getRoomsInWishlist.bind(roomWishController));

export { roomWishlistRouter };
