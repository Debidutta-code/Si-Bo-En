import { Router } from 'express';

import { inventoryRouter } from './inventory.route';
import { ratePlanRouter } from './ratePlan.route';
import { roomRentPriceRouter } from './roomRent.route';
import startStopSellRoute from './start-stop-sell.route';

const AriRouter = Router();
AriRouter.use('/inventory', inventoryRouter);


AriRouter.use('/rate-plan', ratePlanRouter);


AriRouter.use('/price', roomRentPriceRouter);

AriRouter.use('/start-stop-sell', startStopSellRoute);

export  {AriRouter};
