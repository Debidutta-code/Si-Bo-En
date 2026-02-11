// routes/ratetiger.routes.ts

import { Router } from 'express';
import rateTigerRoute from '../rate-tiger/routes/rate-tiger.routes';

const integrationRouter = Router();

integrationRouter.use("/rate-tiger",rateTigerRoute)
export default integrationRouter;