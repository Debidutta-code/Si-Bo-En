// routes/siteminder.routes.ts

import { Router } from 'express';
import { SiteMinderMiddleware } from '../middleware/site-minder.middleware';
import { SiteMinderController } from '../controllers';

const siteMinderRoute = Router();

siteMinderRoute.post(
    '/ari',

    SiteMinderController.handlePush
);

export default siteMinderRoute;