import { Router } from "express";

import {reservationRoute} from "../frontoffice/reservation/routes";
const frontOfficeRoute=Router();

frontOfficeRoute.use('/reservations',reservationRoute);
export {frontOfficeRoute}