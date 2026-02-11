// routes/ratetiger.routes.ts

import { Router } from 'express';
import { RateTigerMiddleware } from '../middleware/rate-tiger.middleware';
import { RateTigerController } from '../controllers';

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
  RateTigerMiddleware.validateOTARequest,
  RateTigerController.roomRatePlanPull
);

export default rateTigerRoute;