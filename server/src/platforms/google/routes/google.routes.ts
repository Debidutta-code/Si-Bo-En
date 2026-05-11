// src/modules/google-feeds/routes/google-feeds.routes.ts

import { Router } from 'express';
import { GoogleFeedsController } from '../controllers';

const googleRouter = Router();

googleRouter.get('/hotel-list.xml', GoogleFeedsController.getHotelListFeed);

googleRouter.get('/price-availability.xml', GoogleFeedsController.getPriceFeed);

googleRouter.get(
    '/landing-pages.xml',
    GoogleFeedsController.getLandingPageFeed
);

googleRouter.get('/status', GoogleFeedsController.getFeedStatus);

export default googleRouter;
