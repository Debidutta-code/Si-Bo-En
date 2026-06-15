import { protect } from '../../middlewares/auth.middleware';
import { customerProtect } from '../../middlewares/customer-auth.middleware';
import { SpaController } from '../controller';
import { Router } from 'express';
import { spaSlotRouter } from './spa-slots.route';
import { userSpaRouter } from './spa-user.route';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const spaRouter = Router();
const spaController = new SpaController();

spaRouter.use('/slots', spaSlotRouter);
spaRouter.use('/users', userSpaRouter);

spaRouter.route('/').post(protect, attachPropertyDetails({
    identifierType:"id",
    key:"propertyId",
    source:"body"
}),spaController.createSpa.bind(spaController));

spaRouter
    .route('/property/:propertyId')
    .get(attachPropertyDetails({
    identifierType:"id",
    key:"propertyId",
    source:"params"
}),spaController.getSpaForProperty.bind(spaController));
spaRouter
    .route('/property/code/:propertyCode')
    .get(attachPropertyDetails({
    identifierType:"code",
    key:"propertyCode",
    source:"params"
}),spaController.getSpaForPropertyCode.bind(spaController));
spaRouter
    .route('/:id')
    .put(protect, spaController.updateSpa.bind(spaController))
    .delete(protect, spaController.deleteSpa.bind(spaController));
spaRouter.route("/available/:bookingCode").get(spaController.getAvailableSpaForReservation.bind(spaController));
spaRouter.route("/reservation").post(customerProtect, spaController.createSpaReservation.bind(spaController));
spaRouter.route("/reservation/customer").get(customerProtect, spaController.getCustomerSpaBookings.bind(spaController));
spaRouter.route("/reservation/cancel/:bookingId").put(customerProtect, spaController.cancelSpaReservation.bind(spaController));
export {spaRouter}