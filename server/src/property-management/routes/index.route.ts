import { Router } from 'express';
import propertyRoute from './property.route';
import {propertyConfigRoute} from "./property-config.route";
const route = Router();

route.use('/property', propertyRoute);
route.use("/config",propertyConfigRoute)
export default route;
