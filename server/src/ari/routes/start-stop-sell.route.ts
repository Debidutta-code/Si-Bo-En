import { Router } from 'express';
import { StartStopSellController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
const router = Router();
const startStopSellController = new StartStopSellController();

router.route('/:propertyId').patch(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    startStopSellController.createStartStopSell.bind(startStopSellController)
);
export default router;
