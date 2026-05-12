import { Router } from 'express';
import { BookingAddonController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const router = Router();
const bookingAddonController = new BookingAddonController();

router.post('/', bookingAddonController.createBookingAddon);

router.put('/:bookingAddonId', bookingAddonController.updateBookingAddon);

router.delete('/:bookingAddonId', bookingAddonController.deleteBookingAddon);

export { router as BookingAddonRoutes };
