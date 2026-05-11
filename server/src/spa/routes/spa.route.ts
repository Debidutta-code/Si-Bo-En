import { protect } from '../../middlewares/auth.middleware';
import { SpaController } from '../controller';
import { Router } from 'express';
import { spaSlotRouter } from './spa-slots.route';
import { userSpaRouter } from './spa-user.route';

const spaRouter = Router();
const spaController = new SpaController();

spaRouter.use('/slots', spaSlotRouter);
spaRouter.use('/users', userSpaRouter);

spaRouter.route('/').post(protect, spaController.createSpa.bind(spaController));

spaRouter
    .route('/property/:propertyId')
    .get(spaController.getSpaForProperty.bind(spaController));
spaRouter
    .route('/:id')
    .put(protect, spaController.updateSpa.bind(spaController))
    .delete(protect, spaController.deleteSpa.bind(spaController));
spaRouter
    .route('/available/:bookingCode')
    .get(spaController.getAvailableSpaForReservation.bind(spaController));
export { spaRouter };
