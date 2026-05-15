import { Router } from 'express';
import { RoomTranslationController } from '../../controllers/room/rooms.controller';

const roomTranslationRouter = Router();
const roomTranslationController = new RoomTranslationController();

roomTranslationRouter.put('/:roomId', roomTranslationController.upsert.bind(roomTranslationController));
roomTranslationRouter.get('/:roomId', roomTranslationController.getTranslated.bind(roomTranslationController));
roomTranslationRouter.get('/:roomId/all', roomTranslationController.getAllTranslations.bind(roomTranslationController));
roomTranslationRouter.delete('/:roomId/:locale', roomTranslationController.deleteLocale.bind(roomTranslationController));

export { roomTranslationRouter };
