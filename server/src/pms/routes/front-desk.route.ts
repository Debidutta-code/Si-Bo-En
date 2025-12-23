import { Router } from "express";
// // import {guestRouter} from "../frontoffice/guest/routes";
// // import {folioLineRouter,folioRouter,paymentRouter} from "../frontoffice/payment/routes";
import {reservationRoute} from "../frontoffice/reservation/routes";
const frontOfficeRoute=Router();

// // frontOfficeRoute.use('/guests',guestRouter);
// // frontOfficeRoute.use('/folios',folioRouter);
// // frontOfficeRoute.use('/folio-lines',folioLineRouter);
// // frontOfficeRoute.use('/payments',paymentRouter);
frontOfficeRoute.use('/reservations',reservationRoute);
export {frontOfficeRoute}