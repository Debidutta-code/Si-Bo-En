import { Router } from 'express';
import { AddonController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
const router = Router();
const addonController = new AddonController();

router.post('/', addonController.createAddon);

router.get(
    '/property/:propertyId',
    attachPropertyDetails({
        source: 'params',
        key: 'propertyId',
        identifierType: 'id',
    }),
    addonController.getAllAddonsByPropertyId
);

router.get(
    '/booking/:propertyId',
    attachPropertyDetails({
        source: 'params',
        key: 'propertyId',
        identifierType: 'id',
    }),
    addonController.getAddonsForBooking
);

router.get('/:addonId', addonController.getAddonById);

router.put('/:addonId', addonController.updateAddon);

router.delete('/:addonId', addonController.deleteAddon);

export { router as AddonRoutes };
