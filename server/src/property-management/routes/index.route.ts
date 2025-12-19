import { Router } from 'express';
import propertyRoute from './property.route';
import uploadRoute from './upload.route';
import {propertyConfigRoute} from "./property-config.route";
const route = Router();

route.use('/property', propertyRoute);
route.use('/upload', uploadRoute);
route.use("/config",propertyConfigRoute)
export default route;
