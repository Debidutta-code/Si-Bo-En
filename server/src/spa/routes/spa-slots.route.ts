import { protect } from '../../middlewares/auth.middleware';
import { SpaDateController, SpaSlotController } from '../controller';
import { Router } from 'express';

const spaSlotRouter = Router();
const spaDateController = new SpaDateController();
const spaSlotController = new SpaSlotController();

spaSlotRouter
    .route('/dates/:id')
    .post(protect, spaDateController.createSpaDate.bind(spaDateController))
    .delete(protect, spaDateController.deleteSpaDate.bind(spaDateController));
spaSlotRouter
    .route('/dates/range/:id')
    .post(
        protect,
        spaDateController.getSpaForDateRange.bind(spaDateController)
    );
spaSlotRouter
    .route('/slots').post(protect, spaSlotController.createSlots.bind(spaSlotController))

spaSlotRouter
    .route('/slots/:id')
    .delete(protect, spaSlotController.deleteSpaSlot.bind(spaSlotController))
    .patch(protect, spaSlotController.updateSpaSlotStatus.bind(spaSlotController))

spaSlotRouter.route("/slot-availibility/book").patch(spaSlotController.markSlotAvailibilityAsBooked.bind(spaSlotController));
spaSlotRouter.route("/slot-availibility/cancel").patch(spaSlotController.markSlotAvailibilityAsBooked.bind(spaSlotController));


spaSlotRouter.route("/slot-availibility/:id")
    .patch(spaSlotController.updateSpaSlotAvailibilityStatus.bind(spaSlotController))
    .delete(protect, spaSlotController.deleteSlotAvailibilityById.bind(spaSlotController));




export { spaSlotRouter };
