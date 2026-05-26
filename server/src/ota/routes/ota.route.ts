import { Router } from "express";
import { wishlistRouter } from "../wishlist/routes";
import { reviewRouter } from "../review/routes";
import { hotelRouter } from "../property/routes/hotel.routes";

const otaRouter = Router();

otaRouter.use("/wishlist", wishlistRouter);
otaRouter.use("/reviews", reviewRouter);
otaRouter.use("/properties", hotelRouter);


export { otaRouter };
