// routes/ratetiger.routes.ts

import { Router } from 'express';
import { RateTigerMiddleware } from '../middleware/rate-tiger.middleware';
import { InventoryUpdateController, PricePullController, RateTigerController } from '../controllers';
import { ARIController } from '../controllers/ari-update.controller';

const rateTigerRoute = Router();

// Authentication endpoint
rateTigerRoute.post(
  '/authenticate',
  RateTigerMiddleware.validateAuthCredentials,
  RateTigerController.authenticate
);


rateTigerRoute.post(
    '/ari',
    RateTigerMiddleware.validateBearerToken,
    ARIController.handleARI
);
export default rateTigerRoute;