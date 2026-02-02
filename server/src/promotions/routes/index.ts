import { Router } from "express";
import { geoRatePlanRouter } from "../geo-rate-plan/routes/geo.routes";
import { mlosRouter } from "../mlos/routes";

const promotionRouter = Router();

promotionRouter.use("/geo-rate-plan", geoRatePlanRouter);
promotionRouter.use("/mlos",mlosRouter)

export default promotionRouter;