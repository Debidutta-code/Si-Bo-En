import { Router } from 'express';
import express from 'express';

import rateTigerRoute from '../rate-tiger/routes/rate-tiger.routes';
import siteMinderRoute from '../site-minder/routes/site-minder.routes';
import channexRoute from '../channex/routes/channex.routes';

const integrationRouter = Router();

integrationRouter.use('/rate-tiger', rateTigerRoute);
integrationRouter.use("/channex", channexRoute)
integrationRouter.use(
    '/site-minder',
    express.text({
        type: '*/*',
    }),
    siteMinderRoute
);

export default integrationRouter;