// routes/ratetiger.routes.ts

import { Router } from 'express';
import rateTigerRoute from '../rate-tiger/routes/rate-tiger.routes';
import siteMinderRoute from '../site-minder/routes/site-minder.routes';

const integrationRouter = Router();

integrationRouter.use("/rate-tiger",rateTigerRoute)
integrationRouter.use("/site-minder",siteMinderRoute)

export default integrationRouter;