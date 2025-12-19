import { Express, NextFunction, Request, Response, Router } from 'express';
import { AppError } from '../utils/error.util';

// // Route imports
import { AuthRouter, CreationRouter, UserRouter } from "../auth/routes";
import { AccessControlRoutes } from '../access-control/routes';
import PropertyManagement from '../property-management/routes/index.route';
import { AriRouter } from '../ari/routes';
import ActivityRouter from "../logs/routes/activity.routes"
import { PolicyRoute } from "../policies/routes";
import { promoCodeRoutes } from '../promocode/routes';
import { TaxSystemRouter } from '../tax-system/routes';
import {AddonsRoute} from '../add-on/routes';
import {pmsRoute} from "../pms/routes";
// import {dashboardRouter} from "../dashboard/routes"
export async function initializeExpressRoutes({ app }: { app: Express }) {
  // Health check
  app.head('/status', (_, res: Response) => res.status(200).end());

  const apiV1Router = Router();
  app.use('/api/v1', apiV1Router);

  
  // Mount all routers under /api/v1
  apiV1Router.use('/auth', AuthRouter);
  apiV1Router.use('/user', UserRouter);
  apiV1Router.use("/create", CreationRouter);

  // apiV1Router.use("/dash",dashboardRouter)

  apiV1Router.use('/access', AccessControlRoutes);

  apiV1Router.use("/policy", PolicyRoute);

  apiV1Router.use('/property-management', PropertyManagement);
  apiV1Router.use('/ari', AriRouter);
  apiV1Router.use('/activities', ActivityRouter);
  apiV1Router.use('/promo-codes', promoCodeRoutes);
  apiV1Router.use('/tax-system', TaxSystemRouter);
  apiV1Router.use('/addon', AddonsRoute);
  apiV1Router.use("/pms",pmsRoute)

  // Handle 404 for any undefined route under /api/v1
  app.all('/api/v1/*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  });

  // Global error handler
  // app.use(errorHandler);
}
