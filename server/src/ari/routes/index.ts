import { Router } from 'express';

import { inventoryRouter } from './inventory.route';
import { ratePlanRouter } from './ratePlan.route';
import { roomRentPriceRouter } from './roomRent.route';
import startStopSellRoute from './start-stop-sell.route';
import {restrictionRouter} from "./restriction.routes";
import {availabilityRouter} from "./availibility.route";
import ratePlanWithAddonRouter from './Rateplanwithaddon.routes';
const AriRouter = Router();
AriRouter.use('/inventory', inventoryRouter);


AriRouter.use('/rate-plan', ratePlanRouter);
AriRouter.use('/rate-plan-with-addon', ratePlanWithAddonRouter);


AriRouter.use('/price', roomRentPriceRouter);

AriRouter.use('/start-stop-sell', startStopSellRoute);
AriRouter.use('/cta-ctd',restrictionRouter);
AriRouter.use('/analysis',availabilityRouter)
export  {AriRouter};
