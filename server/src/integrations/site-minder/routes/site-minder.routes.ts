// routes/ratetiger.routes.ts

import { Router } from 'express';
import { RateTigerMiddleware } from '../middleware/rate-tiger.middleware';
import {
    InventoryUpdateController,
    PricePullController,
    RateTigerController,
} from '../controllers';
import { ARIController } from '../controllers/ari-update.controller';
import { withHotelCodeConversion } from '../utils/hotel-code.handler';

const siteMinderRoute = Router();

// Authentication endpoint
siteMinderRoute.post(
    '/authenticate',
    RateTigerMiddleware.validateAuthCredentials,
    RateTigerController.authenticate
);

siteMinderRoute.post(
    '/ari',
    withHotelCodeConversion(ARIController.handleARI)
);

export default siteMinderRoute;
