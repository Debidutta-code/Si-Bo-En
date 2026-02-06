import { Express, NextFunction, Request, Response, Router } from 'express';
import { AppError } from '../utils/error.util';

// // Route imports
import { AuthRouter, CreationRouter, UserRouter ,initRouter} from "../auth/routes";
import { AccessControlRoutes } from '../access-control/routes';
import PropertyManagement from '../property-management/routes/index.route';
import { AriRouter } from '../ari/routes';
import ActivityRouter from "../logs/routes/activity.routes"
import { PolicyRoute } from "../policies/routes";
import { promoCodeRoutes } from '../promocode/routes';
import { TaxSystemRouter } from '../tax-system/routes';
import {AddonsRoute} from '../add-on/routes';
import {pmsRoute} from "../pms/routes";
import {BookingEngineRoutes} from "../booking-engine/routes"
import {dashboardRouter} from "../dashboard/routes";
import EmailService from "../sms-email-service/routes/route";
import { PaymentRoutes } from "../payment/routes";

import { agencyMainRouter } from '../agency/routes/index.route';
import { loyaltyRouter } from '../loyalty/routes/loyalty.routes';
import promotionRouter from '../promotions/routes';
export async function initializeExpressRoutes({ app }: { app: Express }) {
  // Health check
  app.head('/status', (_, res: Response) => res.status(200).end());

  const apiV1Router = Router();
  app.use('/api/v1', apiV1Router);

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // Mount all routers under /api/v1
  apiV1Router.use('/auth', AuthRouter);
  apiV1Router.use('/user', UserRouter);
  apiV1Router.use("/create", CreationRouter);
  apiV1Router.use("/init", initRouter);

  apiV1Router.use("/dash",dashboardRouter)

  apiV1Router.use('/access', AccessControlRoutes);

  apiV1Router.use("/policy", PolicyRoute);

  apiV1Router.use('/property-management', PropertyManagement);
  apiV1Router.use('/ari', AriRouter);
  apiV1Router.use('/activities', ActivityRouter);
  apiV1Router.use('/promo-codes', promoCodeRoutes);
  apiV1Router.use('/tax-system', TaxSystemRouter);
  apiV1Router.use('/addon', AddonsRoute);
  apiV1Router.use("/pms",pmsRoute)
  apiV1Router.use("/booking-engine",BookingEngineRoutes)
  apiV1Router.use("/email-service",EmailService)
  apiV1Router.use("/agency",agencyMainRouter);
  apiV1Router.use("/promotions",promotionRouter);
  apiV1Router.use('/loyalty', loyaltyRouter);
  apiV1Router.use("/payment", PaymentRoutes)
  // Handle 404 for any undefined route under /api/v1
  app.all('/api/v1/*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });

  // Global error handler
  // app.use(errorHandler);
}
