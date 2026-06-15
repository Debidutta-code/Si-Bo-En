import { Express, NextFunction, Request, Response, Router } from 'express';
import { AppError } from '../utils/error.util';

import { AuthRouter, CreationRouter, UserRouter } from '../auth/routes';
import { AccessControlRoutes } from '../access-control/routes';
import PropertyManagement from '../property-management/routes/index.route';
import { AriRouter } from '../ari/routes';
import ActivityRouter from '../logs/routes/activity.routes';
import { PolicyRoute } from '../policies/routes';
import { promoCodeRoutes } from '../promocode/routes';
import { TaxSystemRouter } from '../tax-system/routes';
import { AddonsRoute } from '../add-on/routes';
import { BookingEngineRoutes } from '../booking-engine/routes';
import { dashboardRouter } from '../dashboard/routes';
import { PaymentRoutes } from '../payment/routes';

import { agencyMainRouter } from '../agency/routes/index.route';
import { loyaltyRouter } from '../loyalty/routes/loyalty.routes';
import promotionRouter from '../promotions/routes';
import { agentPlatformRouter } from '../agent-paltform/routes';
import integrationRouter from '../integrations/routes/index.routes';
import platformRouter from '../platforms/routes/platform.routes';
import { currencyRoutes } from '../currency-maping/routes';
import { fikafiPaymentRoutes } from '../payment/routes/fikafi.routes';
import { managementRoute } from '../utils-management/routes';
import { uploadRouter } from '../uploads/routes';
import { spaRouter } from '../spa/routes';
import serviceLogRouter from '../logs/routes/service-log.route';
import { reservationRoute } from '../reservation/routes';
import { reportsRouter } from '../reports/routes/reports.route';
import { problemTicketRouter } from '../problem-tickets/routes';
import { otaRouter } from '../ota/routes';
import { multiLanguageRouter } from '../multi-language/routes/multil-language.route';
import { customerRouter } from '../customer/routes';

export async function initializeExpressRoutes({ app }: { app: Express }) {
    // Health check
    app.head('/status', (_, res: Response) => res.status(200).end());

    const apiV1Router = Router();
    app.use('/api/v1', apiV1Router);

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
        });
    });

    // Mount all routers under /api/v1
    apiV1Router.use('/auth', AuthRouter);
    apiV1Router.use('/user', UserRouter);
    apiV1Router.use('/create', CreationRouter);

    apiV1Router.use('/dash', dashboardRouter);

    apiV1Router.use('/access', AccessControlRoutes);

    apiV1Router.use('/policy', PolicyRoute);
    apiV1Router.use('/agent-platform', agentPlatformRouter);
    apiV1Router.use('/property-management', PropertyManagement);
    apiV1Router.use('/ari', AriRouter);
    apiV1Router.use('/activities', ActivityRouter);
    apiV1Router.use('/promo-codes', promoCodeRoutes);
    apiV1Router.use('/tax-system', TaxSystemRouter);
    apiV1Router.use('/addon', AddonsRoute);
    apiV1Router.use('/reservations', reservationRoute);
    apiV1Router.use('/reports', reportsRouter);

    apiV1Router.use('/booking-engine', BookingEngineRoutes);
    apiV1Router.use('/agency', agencyMainRouter);
    apiV1Router.use('/promotions', promotionRouter);
    apiV1Router.use('/loyalty', loyaltyRouter);
    apiV1Router.use('/fikafi', fikafiPaymentRoutes);
    apiV1Router.use('/utils-management', managementRoute);
    apiV1Router.use('/upload', uploadRouter);
    apiV1Router.use('/payment', PaymentRoutes);
    apiV1Router.use('/integrations', integrationRouter);
    apiV1Router.use('/platform', platformRouter);
    apiV1Router.use('/spa', spaRouter);
    apiV1Router.use('/currency', currencyRoutes);
    apiV1Router.use('/service-logs', serviceLogRouter);
    apiV1Router.use('/problem-tickets', problemTicketRouter);
    apiV1Router.use('/ota', otaRouter);
    apiV1Router.use('/multi-language', multiLanguageRouter);
    apiV1Router.use('/customer', customerRouter);

    app.all('/api/v1/*', (req: Request, _res: Response, next: NextFunction) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

}
