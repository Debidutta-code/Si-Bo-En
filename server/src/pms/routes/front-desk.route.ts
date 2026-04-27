import { Router } from "express";
import { reservationRoute } from "../../reservation/routes";
import { reportsRouter } from "../../reports/routes/reports.route";

const frontOfficeRoute=Router();

frontOfficeRoute.use('/reservations',reservationRoute);
frontOfficeRoute.use('/reports',reportsRouter)
export {frontOfficeRoute}