import { Router } from "express";
import { otaUserRouter } from "../user/routes";
import { wishlistRouter } from "../wishlist/routes";
import { reviewRouter } from "../review/routes";

const otaRouter = Router();

otaRouter.use("/users",  otaUserRouter);
otaRouter.use("/wishlist",  wishlistRouter);
otaRouter.use("/reviews", reviewRouter);

export {otaRouter}