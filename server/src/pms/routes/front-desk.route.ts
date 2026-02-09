import { Router } from "express";

import {reservationRoute} from "../frontoffice/reservation/routes";
import { reportsRouter } from "../frontoffice/reports/routes/reports.route";
const frontOfficeRoute=Router();

frontOfficeRoute.use('/reservations',reservationRoute);
frontOfficeRoute.use('/reports',reportsRouter)
export {frontOfficeRoute}