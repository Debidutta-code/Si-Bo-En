// routes/ratetiger.routes.ts

import { Router } from 'express';
import rateTigerRoute from '../rate-tiger/routes/rate-tiger.routes';
import siteMinderRoute from '../site-minder/routes/site-minder.routes';
import express from 'express';

const integrationRouter = Router();

integrationRouter.use("/rate-tiger", rateTigerRoute)
integrationRouter.use("/site-minder",express.text({ type: ['text/xml', 'application/xml', 'application/soap+xml'] }),siteMinderRoute)
const integrationXMLRouter = Router();
integrationRouter.use("/xml",integrationXMLRouter)
integrationXMLRouter.use(express.text({ type: ['text/xml', 'application/xml', 'application/soap+xml'] }))
integrationXMLRouter.use("/site-minder", siteMinderRoute)

export default integrationRouter