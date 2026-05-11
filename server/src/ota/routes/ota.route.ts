import { Router } from "express";
import { otaUserRouter } from "../user/routes";
import { wishlistRouter } from "../wishlist/routes";
import { reviewRouter } from "../review/routes";
import { hotelRouter } from "../property/routes/hotel.routes";

const otaRouter = Router();

otaRouter.use("/users", otaUserRouter);
otaRouter.use("/wishlist", wishlistRouter);
otaRouter.use("/reviews", reviewRouter);
otaRouter.use("/properties", hotelRouter);
// otaRouter.use("/reservations", ReservationRouter);


export { otaRouter };
