import {propertyWishlistRouter,roomWishlistRouter} from "."
import { Router } from "express"

const wishlistRouter = Router();

wishlistRouter.use("/property", propertyWishlistRouter);
wishlistRouter.use("/room", roomWishlistRouter);

export { wishlistRouter };