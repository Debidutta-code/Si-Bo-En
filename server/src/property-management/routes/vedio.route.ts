import { Router } from 'express';
import { PropertyVedioController, RoomVedioController } from '../controller';

import { protect } from '../../middlewares/auth.middleware';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const vedioRouter = Router();
const propertyVedioRouter = Router();
const roomVedioRouter = Router({ mergeParams: true });
const propertyVedioController = new PropertyVedioController();
const roomVedioController = new RoomVedioController();

// Property Video Routes
vedioRouter.use(
    '/property/:propertyId',
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    propertyVedioRouter
);

// Room Video Routes
vedioRouter.use('/room/:roomId', protect, roomVedioRouter);

// Property Video Endpoints
propertyVedioRouter
    .route('/')
    .get(propertyVedioController.getPropertyVideo.bind(propertyVedioController))
    .post(propertyVedioController.createVideo.bind(propertyVedioController))
    .delete(
        propertyVedioController.deletePropertyVideo.bind(
            propertyVedioController
        )
    );

// Room Video Endpoints
roomVedioRouter
    .route('/')
    .get(roomVedioController.getRoomVideo.bind(roomVedioController))
    .post(roomVedioController.createVideo.bind(roomVedioController))
    .delete(roomVedioController.deleteRoomVideo.bind(roomVedioController));

export { vedioRouter };
