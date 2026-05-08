import { Router } from 'express';
import { AddonDateWiseController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const router = Router();
const addonDateWiseController = new AddonDateWiseController();

router.post('/', addonDateWiseController.createAddonDateWise);

router.get('/addon/:addonId', addonDateWiseController.getAddOnDateWiseById);

// GET /api/addon/addon-datewise/date?propertyId=...&date=YYYY-MM-DD
router.get(
    '/date',
    attachPropertyDetails({
        source: 'query',
        key: 'propertyId',
        identifierType: 'id',
    }),
    addonDateWiseController.getAddOnsByDate
);

// GET /api/addon/addon-datewise/available?propertyCode=XXX&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get(
    '/available',
    attachPropertyDetails({
        source: 'query',
        key: 'propertyCode',
        identifierType: 'code',
    }),
    addonDateWiseController.getAvailableAddonsByDateRange
);
router.put('/addon/:addonId', addonDateWiseController.updateAddonByAddonId);

router.put('/:id', addonDateWiseController.updateAddonForSingleDate);

router.delete('/addon/:addonId', addonDateWiseController.deleteAddonByAddonId);

router.delete('/:id', addonDateWiseController.deleteAddonForParticularDate);

export { router as AddonDateWiseRoutes };
