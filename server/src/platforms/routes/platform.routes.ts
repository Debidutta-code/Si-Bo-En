// routes/ratetiger.routes.ts

import { Router } from 'express';
import googleRouter from '../google/routes/google.routes';

const platformRouter = Router();

platformRouter.use("/google",googleRouter)
export default platformRouter;