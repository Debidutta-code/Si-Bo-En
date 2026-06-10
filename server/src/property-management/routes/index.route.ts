import { Router } from 'express';
import propertyRoute from './property.route';
import { propertyConfigRoute } from './property-config.route';
import { transferRoute } from './transfer.route';
const route = Router();

route.use('/property', propertyRoute);
route.use('/transfer', transferRoute);
route.use('/config', propertyConfigRoute);
export default route;
