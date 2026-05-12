import { Router } from 'express';
import { geoRatePlanRouter } from '../geo-rate-plan/routes/geo.routes';
import { mlosRouter } from '../mlos/routes';
import {
    deviceSpecificPromotionRouter,
    earlyBirdPromotionRouter,
    offerForTonightPromotionRouter,
} from '../eb-ds-oftc/routes';
import { customizableDealRouter } from '../customizable-deal/routes';

const promotionRouter = Router();

promotionRouter.use('/geo-rate-plan', geoRatePlanRouter);
promotionRouter.use('/mlos', mlosRouter);
promotionRouter.use('/early-bird', earlyBirdPromotionRouter);
promotionRouter.use('/device-specific', deviceSpecificPromotionRouter);
promotionRouter.use('/offer-for-tonight', offerForTonightPromotionRouter);
promotionRouter.use('/customizable-deal', customizableDealRouter);

export default promotionRouter;
