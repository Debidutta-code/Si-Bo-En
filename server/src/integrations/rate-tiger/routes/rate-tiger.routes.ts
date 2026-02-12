// routes/ratetiger.routes.ts

import { Router } from 'express';
import { RateTigerMiddleware } from '../middleware/rate-tiger.middleware';
import { InventoryUpdateController, PricePullController, RateTigerController } from '../controllers';

const rateTigerRoute = Router();

// Authentication endpoint
rateTigerRoute.post(
  '/authenticate',
  RateTigerMiddleware.validateAuthCredentials,
  RateTigerController.authenticate
);

// Room type and rate plan pull endpoint
rateTigerRoute.post(
  '/room-rateplan-pull',
  RateTigerMiddleware.validateBearerToken,
  RateTigerController.roomRatePlanPull
);
rateTigerRoute.post(
  '/inventory-pull',
  RateTigerMiddleware.validateBearerToken,
  RateTigerController.inventoryPull
);
rateTigerRoute.post(
  '/price-pull',
  RateTigerMiddleware.validateBearerToken,
  PricePullController.pricePull
);
// Add to routes/ratetiger.routes.ts

rateTigerRoute.post(
  '/price-update',
  RateTigerMiddleware.validateBearerToken,
  RateTigerController.priceUpdate
);
rateTigerRoute.post(
  '/inventory-update',
  RateTigerMiddleware.validateBearerToken,
  InventoryUpdateController.inventoryUpdate
);
export default rateTigerRoute;